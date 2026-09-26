import { describe, it, expect } from 'vitest';
import { encodeBuildSheet, decodeBuildSheet, opsPackQty, MAX_BOTS, type BotOrder } from './build-sheet';
import { BOT_FEATURES, OPS_FEATURES } from './bot-features';

const bot = (server: string, features: string[]): BotOrder => ({ server, features });

describe('opsPackQty', () => {
	it('is 0 when no bot carries an ops feature', () => {
		expect(opsPackQty([bot('A', ['moderation', 'data-sync']), bot('B', ['leveling'])])).toBe(0);
	});

	it('counts each bot carrying at least one ops feature', () => {
		expect(opsPackQty([
			bot('A', ['moderation', 'server-monitoring']),
			bot('B', ['leveling']),
			bot('C', ['scheduled-scraping'])
		])).toBe(2);
	});

	it('counts a bot with multiple ops features only once', () => {
		expect(opsPackQty([bot('A', ['server-monitoring', 'app-monitoring', 'scheduled-scraping'])])).toBe(1);
	});

	it('is 0 for an empty cart', () => {
		expect(opsPackQty([])).toBe(0);
	});
});

describe('encodeBuildSheet', () => {
	it('encodes one metadata key per bot plus bot_count', () => {
		const meta = encodeBuildSheet([bot('Alpha Base', ['moderation', 'logging']), bot('Beta', ['leveling'])]);
		expect(meta.bot_count).toBe('2');
		expect(meta.bot_1).toBe('server=Alpha Base;features=moderation,logging');
		expect(meta.bot_2).toBe('server=Beta;features=leveling');
	});

	it('rejects an empty cart', () => {
		expect(() => encodeBuildSheet([])).toThrow(/empty/i);
	});

	it('rejects more than MAX_BOTS bots (Stripe 50-metadata-key cap)', () => {
		const bots = Array.from({ length: MAX_BOTS + 1 }, (_, i) => bot(`s${i}`, ['moderation']));
		expect(() => encodeBuildSheet(bots)).toThrow(/max/i);
	});

	it('rejects a bot with no features', () => {
		expect(() => encodeBuildSheet([bot('Alpha', [])])).toThrow(/feature/i);
	});

	it('rejects unknown feature ids (client must send catalog ids only)', () => {
		expect(() => encodeBuildSheet([bot('Alpha', ['cryptominer'])])).toThrow(/unknown feature/i);
	});

	it('sanitizes delimiter chars out of server names and caps length', () => {
		const meta = encodeBuildSheet([bot('Evil;name=x'.padEnd(200, 'A'), ['moderation'])]);
		expect(meta.bot_1).not.toMatch(/Evil;name/);
		expect(meta.bot_1.length).toBeLessThanOrEqual(500); // Stripe metadata value cap
	});
});

describe('decodeBuildSheet', () => {
	it('round-trips what encode produced', () => {
		const bots = [bot('Alpha Base', ['moderation', 'logging']), bot('', ['giveaways'])];
		expect(decodeBuildSheet(encodeBuildSheet(bots))).toEqual([
			{ server: 'Alpha Base', features: ['moderation', 'logging'] },
			{ server: '', features: ['giveaways'] }
		]);
	});

	it('tolerates missing keys instead of crashing the webhook', () => {
		expect(decodeBuildSheet({ bot_count: '3', bot_2: 'server=Only;features=leveling' })).toEqual([
			{ server: 'Only', features: ['leveling'] }
		]);
	});

	it('skips malformed segments without =', () => {
		expect(decodeBuildSheet({ bot_count: '1', bot_1: 'garbage;server=Ok;features=moderation' })).toEqual([
			{ server: 'Ok', features: ['moderation'] }
		]);
	});

	it('caps bot_count so absurd values cannot spin the decoder', () => {
		expect(decodeBuildSheet({ bot_count: 'Infinity', bot_1: 'server=A;features=moderation' })).toEqual([
			{ server: 'A', features: ['moderation'] }
		]);
	});
});

// Regression guard (2026-08-24): a storefront redesign once overwrote the cart
// page with a version that priced `cart.count * monthlyUsd` and dropped the Ops
// Pack entirely. The Stripe charge stayed correct because /api/checkout derives
// the ops line item server-side — so the cart QUOTED $5 and BILLED $14. A quote
// that disagrees with the charge is the worst version of this bug, because
// nothing errors. These lock the quantity math the cart total depends on.
describe('opsPackQty — the number the cart total and the Stripe line item share', () => {
	it('counts one pack per bot carrying any ops feature, not one per feature', () => {
		const opsIds = [...OPS_FEATURES];
		expect(opsIds.length).toBeGreaterThan(1);
		expect(opsPackQty([{ server: '', features: [opsIds[0], opsIds[1]] }])).toBe(1);
	});

	it('charges no pack for a bot with only base features', () => {
		const base = BOT_FEATURES.find((f) => !OPS_FEATURES.has(f.id))!;
		expect(opsPackQty([{ server: '', features: [base.id] }])).toBe(0);
	});

	it('counts packs per bot across a mixed cart', () => {
		const ops = [...OPS_FEATURES][0];
		const base = BOT_FEATURES.find((f) => !OPS_FEATURES.has(f.id))!.id;
		expect(
			opsPackQty([
				{ server: 'a', features: [ops] },
				{ server: 'b', features: [base] },
				{ server: 'c', features: [base, ops] }
			])
		).toBe(2);
	});

	it('the cart total formula agrees with a hand-computed quote', () => {
		const ops = [...OPS_FEATURES][0];
		const base = BOT_FEATURES.find((f) => !OPS_FEATURES.has(f.id))!.id;
		const items = [
			{ server: 'a', features: [base, ops] },
			{ server: 'b', features: [base] }
		];
		const MONTHLY = 5, OPS_PACK = 9;
		const total = items.length * MONTHLY + opsPackQty(items) * OPS_PACK;
		expect(total).toBe(19); // 2 bots @ $5 + 1 Ops Pack @ $9
	});
});
