import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { generateIdentity, identityToRecipient, Decrypter } from 'age-encryption';

// Mutable env so the test can plug in a freshly generated age recipient.
const envMock = vi.hoisted(() => ({
	env: { DISCORD_WEBHOOK_INTAKE: 'https://discord.test/intake', CONTACT_DB_PATH: ':memory:' } as Record<string, string>
}));
vi.mock('$env/dynamic/private', () => envMock);

const postDiscord = vi.fn(async (..._args: unknown[]) => {});
vi.mock('$lib/server/discord', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/discord')>()),
	postDiscord: (...args: unknown[]) => postDiscord(...args)
}));

import { POST } from './+server';
import { MAX_PER_WINDOW } from '$lib/server/rate-limit';
import { getDb } from '$lib/server/contact-store';

let identity: string;
beforeAll(async () => {
	// test-only keypair; the private half never leaves this process
	identity = await generateIdentity();
	envMock.env.CONTACT_AGE_RECIPIENT = await identityToRecipient(identity);
});

let nextIp = 0;
function call(body: unknown, ip?: string) {
	const addr = ip ?? `10.0.0.${++nextIp}`; // unique IP per test by default
	return POST({
		request: new Request('http://localhost/api/intake', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		getClientAddress: () => addr
	} as any);
}

async function status(p: unknown): Promise<number> {
	try {
		return ((await p) as Response).status;
	} catch (e: any) {
		return e.status;
	}
}

beforeEach(() => {
	postDiscord.mockClear();
	getDb(':memory:').exec('DELETE FROM messages');
});

const good = { kind: 'contact', name: 'Alex', email: 'alex@example.com', message: 'I would like a bot please.', website: '' };

describe('POST /api/intake', () => {
	it('stores the submission encrypted and round-trips with the private key', async () => {
		const res = (await call(good)) as Response;
		expect(res.status).toBe(200);
		const row = getDb(':memory:').prepare('SELECT * FROM messages').get() as any;
		expect(row.kind).toBe('contact');
		expect(row.status).toBe('open');
		const raw = Buffer.from(row.ciphertext).toString('latin1');
		expect(raw).not.toContain('alex@example.com');
		expect(raw).not.toContain('bot please');
		const d = new Decrypter();
		d.addIdentity(identity);
		const plain = JSON.parse(await d.decrypt(new Uint8Array(row.ciphertext), 'text'));
		expect(plain).toEqual({ name: 'Alex', email: 'alex@example.com', message: 'I would like a bot please.' });
	});

	it('relays only a notice: no email, name or body', async () => {
		await call(good);
		expect(postDiscord).toHaveBeenCalledOnce();
		const [url, text] = postDiscord.mock.calls[0] as any[];
		expect(url).toBe('https://discord.test/intake');
		expect(text).toMatch(/^New message #\d+$/);
		for (const pii of ['alex@example.com', 'Alex', 'bot please']) expect(text).not.toContain(pii);
	});

	it('invite relay is "New invite request #<id> · <product>"', async () => {
		await call({ ...good, kind: 'invite', product: 'umbermark' });
		const [, text] = postDiscord.mock.calls[0] as any[];
		expect(text).toMatch(/^New invite request #\d+ · Umbermark$/);
		expect(text).not.toContain('alex@example.com');
		const row = getDb(':memory:').prepare('SELECT product, kind FROM messages').get() as any;
		expect(row).toEqual({ product: 'umbermark', kind: 'invite' });
	});

	it('ignores a product id that is not in our list', async () => {
		await call({ ...good, kind: 'invite', product: '<script>' });
		const [, text] = postDiscord.mock.calls[0] as any[];
		expect(text).toMatch(/^New invite request #\d+$/);
	});

	it('still stores the message when Discord is down', async () => {
		postDiscord.mockRejectedValueOnce(new Error('discord webhook returned 500'));
		expect(((await call(good)) as Response).status).toBe(200);
		expect(getDb(':memory:').prepare('SELECT count(*) AS n FROM messages').get()).toEqual({ n: 1 });
	});

	it('silently accepts honeypot submissions without storing (bots must not learn they were caught)', async () => {
		const res = (await call({ ...good, website: 'http://spam.example' })) as Response;
		expect(res.status).toBe(200);
		expect(postDiscord).not.toHaveBeenCalled();
		expect(getDb(':memory:').prepare('SELECT count(*) AS n FROM messages').get()).toEqual({ n: 0 });
	});

	it('400s an invalid email', async () => {
		expect(await status(call({ ...good, email: 'not-an-email' }))).toBe(400);
	});

	it('400s a too-short message', async () => {
		expect(await status(call({ ...good, message: 'hi' }))).toBe(400);
	});

	it('400s an unknown kind, including the old qnix kind', async () => {
		expect(await status(call({ ...good, kind: 'sales' }))).toBe(400);
		expect(await status(call({ ...good, kind: 'qnix' }))).toBe(400);
	});

	it('429s when one IP exceeds the window', async () => {
		const ip = '10.99.99.99';
		for (let i = 0; i < MAX_PER_WINDOW; i++) expect(((await call(good, ip)) as Response).status).toBe(200);
		expect(await status(call(good, ip))).toBe(429);
	});
});
