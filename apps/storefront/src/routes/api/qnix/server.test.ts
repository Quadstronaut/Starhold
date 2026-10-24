import { describe, it, expect, vi, beforeAll } from 'vitest';
import { generateIdentity, identityToRecipient, Decrypter } from 'age-encryption';

const envMock = vi.hoisted(() => ({
	env: { DISCORD_WEBHOOK_INTAKE: 'https://discord.test/intake', CONTACT_DB_PATH: ':memory:' } as Record<string, string>
}));
vi.mock('$env/dynamic/private', () => envMock);
const fetchSpy = vi.spyOn(globalThis, 'fetch');

import { POST } from './+server';
import { getDb } from '$lib/server/contact-store';

let identity: string;
beforeAll(async () => {
	identity = await generateIdentity(); // test-only keypair
	envMock.env.CONTACT_AGE_RECIPIENT = await identityToRecipient(identity);
});

let n = 0;
const call = (body: unknown) =>
	POST({
		request: new Request('http://localhost/api/qnix', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		getClientAddress: () => `10.7.0.${++n}`
	} as any) as Promise<Response>;

describe('POST /api/qnix', () => {
	it('stores the address encrypted, round-trips, and never touches Discord', async () => {
		expect((await call({ email: 'me@example.com', website: '' })).status).toBe(200);
		const row = getDb(':memory:').prepare('SELECT * FROM qnix_interest').get() as any;
		expect(Buffer.from(row.ciphertext).toString('latin1')).not.toContain('me@example.com');
		const d = new Decrypter();
		d.addIdentity(identity);
		expect(JSON.parse(await d.decrypt(new Uint8Array(row.ciphertext), 'text'))).toEqual({ email: 'me@example.com' });
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('400s a bad email', async () => {
		await expect(call({ email: 'nope' })).rejects.toMatchObject({ status: 400 });
	});

	it('honeypot is swallowed without storing', async () => {
		const before = getDb(':memory:').prepare('SELECT count(*) AS n FROM qnix_interest').get() as any;
		expect((await call({ email: 'bot@example.com', website: 'x' })).status).toBe(200);
		expect(getDb(':memory:').prepare('SELECT count(*) AS n FROM qnix_interest').get()).toEqual(before);
	});
});
