import { describe, it, expect, vi, afterEach } from 'vitest';
import { createHandoff } from './handoff';

afterEach(() => vi.unstubAllGlobals());

describe('createHandoff', () => {
	it('posts the build sheet to {base}/intake/build-sheet with the bearer and returns the url', async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(JSON.stringify({ checkoutHandoffUrl: 'https://dash/checkout/x' }), { status: 200 })
		);
		vi.stubGlobal('fetch', fetchMock);

		const url = await createHandoff('https://dash.example/', 'tok', [{ features: ['moderation'] }]);
		expect(url).toBe('https://dash/checkout/x');

		const [calledUrl, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
		expect(calledUrl).toBe('https://dash.example/intake/build-sheet'); // trailing slash trimmed
		expect((init.headers as Record<string, string>).authorization).toBe('Bearer tok');
		expect(JSON.parse(init.body as string)).toEqual({ bots: [{ features: ['moderation'] }] });
	});

	it('throws when the dashboard returns a non-2xx', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
		await expect(createHandoff('https://d', 't', [{ features: ['moderation'] }])).rejects.toThrow(/500/);
	});

	it('throws when the response lacks checkoutHandoffUrl', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })));
		await expect(createHandoff('https://d', 't', [{ features: ['moderation'] }])).rejects.toThrow(
			/checkoutHandoffUrl/
		);
	});
});
