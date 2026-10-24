import { describe, it, expect, vi } from 'vitest';

// No CONTACT_AGE_RECIPIENT: fail closed, store nothing.
vi.mock('$env/dynamic/private', () => ({ env: { CONTACT_DB_PATH: ':memory:' } }));

import { POST } from './+server';
import { getDb } from '$lib/server/contact-store';

describe('POST /api/qnix without CONTACT_AGE_RECIPIENT', () => {
	it('503s "Contact is temporarily unavailable" and stores nothing', async () => {
		try {
			await POST({
				request: new Request('http://localhost/api/qnix', {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ email: 'a@b.co' })
				}),
				getClientAddress: () => '10.60.0.1'
			} as any);
			expect.unreachable('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(503);
			expect(e.body.message).toBe('Contact is temporarily unavailable');
		}
		expect(getDb(':memory:').prepare('SELECT count(*) AS n FROM qnix_interest').get()).toEqual({ n: 0 });
	});
});
