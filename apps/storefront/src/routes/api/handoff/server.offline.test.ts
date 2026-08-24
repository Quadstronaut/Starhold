import { describe, it, expect, vi } from 'vitest';

// Separate file: mocks the env WITHOUT the dashboard handoff vars to exercise the
// not-configured guard (the storefront degrades gracefully before the cutover).
vi.mock('$env/dynamic/private', () => ({ env: {} }));
vi.mock('$lib/server/handoff', () => ({ createHandoff: vi.fn() }));

import { POST } from './+server';

describe('POST /api/handoff (offline)', () => {
	it('503s when DASHBOARD_API_BASE / DASHBOARD_INTAKE_BEARER are unset', async () => {
		try {
			await POST({
				request: new Request('http://localhost/api/handoff', { method: 'POST', body: '{}' })
			} as any);
			expect.unreachable('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(503);
		}
	});
});
