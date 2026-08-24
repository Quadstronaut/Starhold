import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.hoisted so the mock fn exists when the hoisted vi.mock factory dereferences it.
const { createHandoff } = vi.hoisted(() => ({
	createHandoff: vi.fn(async () => 'https://dash.example/checkout/abc')
}));
vi.mock('$lib/server/handoff', () => ({ createHandoff }));

const { env } = vi.hoisted(() => ({
	env: { DASHBOARD_API_BASE: 'https://dash.example', DASHBOARD_INTAKE_BEARER: 'secret' } as Record<
		string,
		string | undefined
	>
}));
vi.mock('$env/dynamic/private', () => ({ env }));

import { POST } from './+server';

function call(body: unknown) {
	return POST({
		request: new Request('http://localhost/api/handoff', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		})
	} as any);
}

// SvelteKit error() throws an HttpError with .status — unwrap it for asserts.
async function status(p: unknown): Promise<number> {
	try {
		return ((await p) as Response).status;
	} catch (e: any) {
		return e.status;
	}
}

beforeEach(() => createHandoff.mockClear());

describe('POST /api/handoff', () => {
	it('forwards live-feature bots (server dropped) and returns the checkout url', async () => {
		const res = (await call({
			bots: [{ server: 'Alpha', features: ['moderation', 'leveling'] }]
		})) as Response;
		expect((await res.json()).url).toBe('https://dash.example/checkout/abc');
		const args = (createHandoff.mock.calls as any)[0];
		expect(args[0]).toBe('https://dash.example');
		expect(args[1]).toBe('secret');
		expect(args[2]).toEqual([{ features: ['moderation', 'leveling'] }]);
	});

	it('400s an empty cart without calling the dashboard', async () => {
		expect(await status(call({ bots: [] }))).toBe(400);
		expect(createHandoff).not.toHaveBeenCalled();
	});

	it("400s a defined-but-not-live feature without calling the dashboard", async () => {
		expect(await status(call({ bots: [{ features: ['scheduled-scraping'] }] }))).toBe(400);
		expect(createHandoff).not.toHaveBeenCalled();
	});

	it('400s unknown feature ids', async () => {
		expect(await status(call({ bots: [{ features: ['cryptominer'] }] }))).toBe(400);
	});

	it('502s when the dashboard is unreachable', async () => {
		createHandoff.mockRejectedValueOnce(new Error('network'));
		expect(await status(call({ bots: [{ features: ['moderation'] }] }))).toBe(502);
	});

	it('400s a cart over MAX_BOTS (25) without calling the dashboard', async () => {
		const bots = Array.from({ length: 26 }, () => ({ features: ['moderation'] }));
		expect(await status(call({ bots }))).toBe(400);
		expect(createHandoff).not.toHaveBeenCalled();
	});

	it('deduplicates features within a bot before forwarding', async () => {
		await call({ bots: [{ features: ['moderation', 'moderation', 'leveling'] }] });
		expect((createHandoff.mock.calls as any)[0][2]).toEqual([{ features: ['moderation', 'leveling'] }]);
	});
});
