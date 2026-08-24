import { describe, it, expect, vi, beforeEach } from 'vitest';

const create = vi.fn(async () => ({ url: 'https://checkout.stripe.com/c/test_123' }));
vi.mock('$lib/server/stripe', () => ({
	getStripe: () => ({ checkout: { sessions: { create } } })
}));
// mutable so a test can simulate the Ops Pack price being unconfigured.
// vi.hoisted so the value exists when the hoisted vi.mock factory dereferences it.
const { env } = vi.hoisted(() => ({
	env: { STRIPE_PRICE_CUSTOM_BOT: 'price_test_5mo', STRIPE_PRICE_OPS_PACK: 'price_test_ops9' } as Record<string, string | undefined>
}));
vi.mock('$env/dynamic/private', () => ({ env }));

import { POST } from './+server';

function call(body: unknown) {
	return POST({
		request: new Request('http://localhost/api/checkout', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		}),
		url: new URL('http://localhost/api/checkout')
	} as any);
}

// SvelteKit error() throws an HttpError with .status — unwrap it for asserts.
// Accepts MaybePromise since RequestHandler's return type is not a strict Promise.
async function status(p: unknown): Promise<number> {
	try {
		return ((await p) as Response).status;
	} catch (e: any) {
		return e.status;
	}
}

beforeEach(() => create.mockClear());

describe('POST /api/checkout', () => {
	it('creates a subscription-mode session with quantity = bot count and build-sheet metadata', async () => {
		const res = await call({ bots: [
			{ server: 'Alpha', features: ['moderation', 'logging'] },
			{ server: 'Beta', features: ['leveling'] }
		] });
		expect((await res.json()).url).toMatch(/checkout\.stripe\.com/);
		const params = (create.mock.calls as any)[0][0] as any;
		expect(params.mode).toBe('subscription');
		expect(params.line_items).toEqual([{ price: 'price_test_5mo', quantity: 2 }]);
		expect(params.metadata.bot_count).toBe('2');
		expect(params.subscription_data.metadata.bot_count).toBe('2'); // survives past the session
		expect(params.success_url).toContain('/cart/success');
		expect(params.cancel_url).toContain('/cart');
	});

	it('adds a second Ops Pack line item with quantity = count of bots carrying an ops feature', async () => {
		const res = await call({ bots: [
			{ server: 'A', features: ['moderation', 'server-monitoring'] },
			{ server: 'B', features: ['leveling'] },
			{ server: 'C', features: ['scheduled-scraping'] }
		] });
		expect((await res.json()).url).toMatch(/checkout\.stripe\.com/);
		const params = (create.mock.calls as any)[0][0] as any;
		expect(params.line_items).toEqual([
			{ price: 'price_test_5mo', quantity: 3 }, // every bot pays base
			{ price: 'price_test_ops9', quantity: 2 } // only A and C carry an ops feature
		]);
	});

	it('503s when an ops feature is ordered but STRIPE_PRICE_OPS_PACK is unset, without charging', async () => {
		env.STRIPE_PRICE_OPS_PACK = undefined;
		try {
			expect(await status(call({ bots: [{ server: 'A', features: ['server-monitoring'] }] }))).toBe(503);
			expect(create).not.toHaveBeenCalled();
		} finally {
			env.STRIPE_PRICE_OPS_PACK = 'price_test_ops9';
		}
	});

	it('400s an empty cart without calling Stripe', async () => {
		expect(await status(call({ bots: [] }))).toBe(400);
		expect(create).not.toHaveBeenCalled();
	});

	it('400s unknown feature ids', async () => {
		expect(await status(call({ bots: [{ server: 'x', features: ['cryptominer'] }] }))).toBe(400);
	});

	it('400s non-JSON bodies', async () => {
		const p = POST({
			request: new Request('http://localhost/api/checkout', { method: 'POST', body: 'not json' }),
			url: new URL('http://localhost/api/checkout')
		} as any);
		expect(await status(p)).toBe(400);
	});
});
