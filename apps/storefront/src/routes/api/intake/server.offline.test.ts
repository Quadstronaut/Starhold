import { describe, it, expect, vi } from 'vitest';

// Separate file: env mock omits CONTACT_AGE_RECIPIENT to exercise the
// fail-closed guard (no public key => never accept a message).
vi.mock('$env/dynamic/private', () => ({
	env: { DISCORD_WEBHOOK_INTAKE: 'https://discord.test/intake', CONTACT_DB_PATH: ':memory:' }
}));
const postDiscord = vi.fn(async (..._a: unknown[]) => {});
vi.mock('$lib/server/discord', async (importOriginal) => ({
	...(await importOriginal<typeof import('$lib/server/discord')>()),
	postDiscord: (...a: unknown[]) => postDiscord(...a)
}));

import { POST } from './+server';
import { getDb } from '$lib/server/contact-store';

function req(h: any, body: unknown, ip: string) {
	return h({
		request: new Request('http://localhost/x', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		getClientAddress: () => ip
	} as any);
}

async function failure(p: any): Promise<{ status: number; body: string }> {
	try {
		await p;
	} catch (e: any) {
		return { status: e.status, body: e.body?.message ?? '' };
	}
	throw new Error('should have thrown');
}

describe('without CONTACT_AGE_RECIPIENT', () => {
	it('/api/intake 503s "Contact is temporarily unavailable", stores and relays nothing', async () => {
		const f = await failure(
			req(POST, { kind: 'contact', email: 'a@b.co', message: 'hello there friend', website: '' }, '10.50.50.50')
		);
		expect(f.status).toBe(503);
		expect(f.body).toBe('Contact is temporarily unavailable');
		expect(postDiscord).not.toHaveBeenCalled();
		expect(getDb(':memory:').prepare('SELECT count(*) AS n FROM messages').get()).toEqual({ n: 0 });
	});

	it('logs no body', async () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		await failure(req(POST, { kind: 'contact', email: 'secret@b.co', message: 'topsecret words here', website: '' }, '10.50.50.52'));
		expect(JSON.stringify(spy.mock.calls)).not.toMatch(/secret|topsecret/);
		spy.mockRestore();
	});
});
