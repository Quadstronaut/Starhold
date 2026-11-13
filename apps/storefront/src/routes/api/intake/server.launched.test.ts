// STAR-142: with the launch switch ON the intake endpoint refuses kind "invite"
// (every service is open) and still takes a normal contact message.
import { describe, it, expect, vi } from 'vitest';

vi.mock('#lib/launch.js', () => ({
	LAUNCHED: true,
	pick: <T>(_off: T, on: T): T => on,
	ACCOUNT_URL: 'https://starship.starhold.app'
}));
vi.mock('../../../lib/launch', () => ({
	LAUNCHED: true,
	pick: <T>(_off: T, on: T): T => on,
	ACCOUNT_URL: 'https://starship.starhold.app'
}));
vi.mock('$app/env/private', () => ({
	CONTACT_AGE_RECIPIENT: 'age1placeholderplaceholderplaceholderplaceholderplaceholderxxxxx',
	CONTACT_DB_PATH: ':memory:',
	DISCORD_WEBHOOK_INTAKE: ''
}));

import { POST } from './+server';

async function status(body: unknown, ip: string): Promise<number> {
	try {
		const res = (await POST({
			request: new Request('http://localhost/api/intake', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify(body)
			}),
			getClientAddress: () => ip
		} as any)) as Response;
		return res.status;
	} catch (e: any) {
		return e.status;
	}
}

describe('POST /api/intake once launched', () => {
	it('refuses an invite request with 400', async () => {
		expect(await status({ kind: 'invite', email: 'a@example.com', product: 'render' }, '10.9.0.1')).toBe(400);
	});
	it('the honeypot still answers 200 and stores nothing', async () => {
		expect(await status({ kind: 'invite', email: 'a@example.com', website: 'spam' }, '10.9.0.2')).toBe(200);
	});
});
