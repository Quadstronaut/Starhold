import { describe, it, expect } from 'vitest';
import { generateIdentity, identityToRecipient, Decrypter, armor } from 'age-encryption';
import { openDb, saveMessage, saveQnixInterest, closeMessage, type Db } from './contact-store';
import { purge, monthsAgo } from './retention';
import { buildBundle } from './contact-export';

const NOW = new Date('2027-06-15T12:00:00.000Z');
const daysBefore = (d: number) => new Date(NOW.getTime() - d * 86_400_000);
const m = { product: '', kind: 'contact', name: 'A', email: 'a@b.co', message: 'hello there friend' };

async function setup(): Promise<{ db: Db; recipient: string; identity: string }> {
	const identity = await generateIdentity(); // test-only keypair
	return { db: openDb(':memory:'), recipient: await identityToRecipient(identity), identity };
}
const ids = (db: Db, t: string) => (db.prepare(`SELECT id FROM ${t} ORDER BY id`).all() as any[]).map((r) => r.id);

describe('purge (fake clock)', () => {
	it('deletes closed messages 90 days after closing, keeps younger ones', async () => {
		const { db, recipient } = await setup();
		const old = await saveMessage(db, recipient, m, daysBefore(120));
		const fresh = await saveMessage(db, recipient, m, daysBefore(120));
		closeMessage(db, old, 'done', daysBefore(91));
		closeMessage(db, fresh, 'done', daysBefore(89));
		expect(purge(db, NOW)).toEqual({ messages: 1, qnix: 0 });
		expect(ids(db, 'messages')).toEqual([fresh]);
	});

	it('keeps open messages younger than 12 months, however old', async () => {
		const { db, recipient } = await setup();
		const id = await saveMessage(db, recipient, m, daysBefore(300));
		expect(purge(db, NOW).messages).toBe(0);
		expect(ids(db, 'messages')).toEqual([id]);
	});

	it('deletes any message 12 months after created_at, closed or not', async () => {
		const { db, recipient } = await setup();
		await saveMessage(db, recipient, m, new Date(monthsAgo(NOW, 12))); // exactly on the line
		const keep = await saveMessage(db, recipient, m, new Date(new Date(monthsAgo(NOW, 12)).getTime() + 1000));
		expect(purge(db, NOW).messages).toBe(1);
		expect(ids(db, 'messages')).toEqual([keep]);
	});

	it('qnix_interest: 24 months from created_at', async () => {
		const { db, recipient } = await setup();
		await saveQnixInterest(db, recipient, 'a@b.co', new Date(monthsAgo(NOW, 24)));
		const keep = await saveQnixInterest(db, recipient, 'c@d.co', new Date(monthsAgo(NOW, 23)));
		expect(purge(db, NOW)).toEqual({ messages: 0, qnix: 1 });
		expect(ids(db, 'qnix_interest')).toEqual([keep]);
	});

	it('is idempotent: a second run deletes nothing', async () => {
		const { db, recipient } = await setup();
		await saveMessage(db, recipient, m, daysBefore(500));
		expect(purge(db, NOW).messages).toBe(1);
		expect(purge(db, NOW)).toEqual({ messages: 0, qnix: 0 });
	});
});

describe('export bundle', () => {
	it('is age-armored, holds ciphertext only, and decrypts with the private key', async () => {
		const { db, recipient, identity } = await setup();
		await saveMessage(db, recipient, { ...m, email: 'export@example.com' }, NOW);
		await saveQnixInterest(db, recipient, 'q@example.com', NOW);
		const text = await buildBundle(db, recipient, NOW);
		expect(text).toMatch(/^-----BEGIN AGE ENCRYPTED FILE-----/);
		expect(text).not.toContain('example.com');
		const d = new Decrypter();
		d.addIdentity(identity);
		const bundle = JSON.parse(await d.decrypt(armor.decode(text), 'text'));
		expect(bundle.messages).toHaveLength(1);
		expect(bundle.qnix_interest).toHaveLength(1);
		const inner = await d.decrypt(new Uint8Array(Buffer.from(bundle.messages[0].ciphertext, 'base64')), 'text');
		expect(JSON.parse(inner).email).toBe('export@example.com');
	});
});
