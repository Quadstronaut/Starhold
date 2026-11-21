// SHIP-6: yearly plans on /pricing, behind YEARLY_PLANS (lib/yearly.ts).
//   * Switch off (today): the rendered page is byte-identical to the page before SHIP-6. golden/pricing-switch-off.json
//     was rendered from origin/master 710bb74 with the same props, before this change.
//   * Switch on: every product with yearly plans gets one honest line (amount, "charged once a year", the saving
//     as a fact, renewal), the Suite line gets its yearly price, and nothing nudges toward yearly.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from 'svelte/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { heroPool } from '#lib/heroes.js';
import * as yearly from '#lib/yearly.js';
import { AVAILABILITY } from '#lib/availability.js';
import { TIER_USD } from '#lib/content/catalog.js';

const golden = JSON.parse(readFileSync(join(__dirname, 'golden', 'pricing-switch-off.json'), 'utf8'));
const props = { data: { hero: heroPool[0].id } };

describe('SHIP-6 yearly switch', () => {
	it('is on (operator approved the prices 2026-11-21; Terms and Refund Policy published the same day)', () => {
		expect(yearly.YEARLY_PLANS).toBe(true);
	});
});

describe('SHIP-6 yearly switch off (forced off): the rollback renders /pricing byte for byte as before', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.doMock('#lib/yearly.js', async (orig) => {
			const real = (await orig()) as typeof yearly;
			return {
				...real,
				YEARLY_PLANS: false,
				noteWithYearly: (id: string, note: string | undefined) => real.noteWithYearly(id, note, false),
				suiteYearlySuffix: () => real.suiteYearlySuffix(false)
			};
		});
	});

	it('renders /pricing byte for byte as before', async () => {
		const { render: renderFresh } = await import('svelte/server');
		const Page = (await import('./+page.svelte')).default;
		const { head, body } = renderFresh(Page, { props });
		expect(head).toBe(golden.head);
		expect(body).toBe(golden.body);
		vi.doUnmock('#lib/yearly.js');
	});

	it('adds nothing while off', () => {
		expect(yearly.noteWithYearly('umbermark', undefined, false)).toBeUndefined();
		expect(yearly.noteWithYearly('umbermark', 'a note', false)).toBe('a note');
		expect(yearly.suiteYearlySuffix(false)).toBe('');
	});
});

describe('SHIP-6 yearly prices are configuration that agrees with the monthly lines', () => {
	it('every yearly price is ten months of its monthly price (working default)', () => {
		for (const plans of Object.values(yearly.YEARLY_PRICES)) {
			for (const p of plans) expect(p.yearly).toBe(p.monthly * 10);
		}
		expect(yearly.SUITE_YEARLY).toEqual({ plan: 'Starhold Suite', monthly: TIER_USD.suite, yearly: TIER_USD.suite * 10 });
	});

	it('every monthly price named here is the one on the product availability line', () => {
		for (const [id, plans] of Object.entries(yearly.YEARLY_PRICES)) {
			for (const p of plans) expect(AVAILABILITY[id], `${id} ${p.plan}`).toContain(`$${p.monthly}`);
		}
	});

	it('Starbot has no yearly line (website yearly not built; Discord prices never)', () => {
		expect(yearly.YEARLY_PRICES.starbot).toBeUndefined();
		expect(yearly.yearlyText('starbot')).toBeNull();
	});

	it('the yearly sentence is plain and states the saving as a fact', () => {
		expect(yearly.yearlyText('umbermark')).toBe(
			'Or pay yearly, charged once a year: Solo $50 a year instead of $60; Pro $190 a year instead of $228; Agency $490 a year instead of $588. Renews each year until you cancel.'
		);
		expect(yearly.suiteYearlySuffix(true)).toBe(
			' Or $490 a year, charged once a year, instead of $588 for 12 monthly payments. Renews each year until you cancel.'
		);
	});
});

describe('SHIP-6 yearly switch on (rendered with the switch forced on)', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.doMock('#lib/yearly.js', async (orig) => {
			const real = (await orig()) as typeof yearly;
			return {
				...real,
				YEARLY_PLANS: true,
				noteWithYearly: (id: string, note: string | undefined) => real.noteWithYearly(id, note, true),
				suiteYearlySuffix: () => real.suiteYearlySuffix(true)
			};
		});
	});

	it('shows each yearly line once, the Suite yearly price, and no nudges', async () => {
		// Same module graph as the re-imported page (resetModules gives svelte a fresh runtime).
		const { render: renderFresh } = await import('svelte/server');
		const Page = (await import('./+page.svelte')).default;
		const { body } = renderFresh(Page, { props });
		const text = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
		for (const id of Object.keys(yearly.YEARLY_PRICES)) {
			expect(text.split(yearly.yearlyText(id)!).length - 1, id).toBe(1);
		}
		expect(text).toContain('Or $490 a year, charged once a year, instead of $588 for 12 monthly payments.');
		expect(text).toContain("$49 a month."); // monthly is still stated first
		for (const nudge of ['best value', 'most popular', 'recommended plan', 'save ', '% off', 'free months']) {
			expect(text.toLowerCase(), nudge).not.toContain(nudge);
		}
		vi.doUnmock('#lib/yearly.js');
	});
});
