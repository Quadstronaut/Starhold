import { describe, it, expect } from 'vitest';
import { BOT_FEATURES, OPS_FEATURES, LIVE_FEATURES } from './bot-features';

// The launch "Proven Pack" gate. When PIPELINE_HANDOFF is on, the storefront sells
// ONLY these; the other 12 stay defined (wire-ID safety) but hidden until shipped.
describe('LIVE_FEATURES (launch Proven Pack)', () => {
	it('is exactly the five proven features', () => {
		expect([...LIVE_FEATURES].sort()).toEqual([
			'github-stream',
			'leveling',
			'moderation',
			'suggestions',
			'welcome'
		]);
	});

	it('every live id is a real, defined feature', () => {
		const ids = new Set(BOT_FEATURES.map((f) => f.id));
		for (const id of LIVE_FEATURES) expect(ids.has(id)).toBe(true);
	});

	it('no live feature is an Ops Pack feature (launch is all base)', () => {
		for (const id of LIVE_FEATURES) expect(OPS_FEATURES.has(id)).toBe(false);
	});
});
