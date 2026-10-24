// Tier A · A4 — information architecture contract.
// Route map, navigation shape, hero determinism, and the commerce demotion.
import { describe, it, expect } from 'vitest';
import * as nav from '../lib/nav';
import * as copy from '../lib/content/copy';
import catalog from '../../static/products.json';
import { parseCatalog } from '../lib/products';
import { DISCORD_INVITE } from '../lib/site-links';
import { read, exists, templateText, collectStrings, srcFiles, relative } from './_helpers';

/** Every route that must resolve. Paths are pinned by the spec. */
const PAGES = [
	'',
	'contact',
	'qnix',
	'products/shushgame',
	'legal/terms',
	'legal/privacy',
	'legal/refunds'
];

const ENDPOINTS = ['api/intake'];

describe('A4 · information architecture', () => {
	it('A4.1 every pinned route has a page component', () => {
		const missing = PAGES.filter((p) => !exists(`src/routes/${p ? p + '/' : ''}+page.svelte`));
		expect(missing).toEqual([]);
	});

	it('A4.2 removed pages have no route left and redirect through the one map', () => {
		for (const p of ['about', 'cart', 'work', 'rates', 'operator', 'capabilities', 'services', 'api/checkout', 'api/stripe'])
			expect(exists(`src/routes/${p}`), p).toBe(false);
		expect(read('src/hooks.server.ts')).toMatch(/redirect\(\s*301/);
		expect(read('src/hooks.server.ts')).toMatch(/\$lib\/redirects/);
	});

	it('A4.3 the published products.json contract lists only live products', () => {
		const products = parseCatalog(catalog);
		expect(products.map((p) => p.id)).toEqual(['shushgame', 'qnix']);
		expect(products.find((p) => p.id === 'qnix')!.status).toBe('coming-soon');
		expect(products.find((p) => p.id === 'shushgame')!.url).toBe('https://shushgame.com');
	});

	it('A4.4 the home page still owns the #fleet anchor', () => {
		expect(read('src/routes/+page.svelte')).toMatch(/id="fleet"/);
	});

	it('A4.5 navigation is data-driven with 4-5 primary items and no cart', () => {
		expect(nav.primary.length).toBeGreaterThanOrEqual(4);
		expect(nav.primary.length).toBeLessThanOrEqual(5);
		expect(nav.primary.map((i) => i.href)).toEqual(expect.arrayContaining(['/#fleet', '/contact']));
		expect(nav).not.toHaveProperty('secondary');
		expect(nav.utility.map((i) => i.href)).not.toContain('/cart');
		expect(nav.cta.href).toBe('/contact?intent=invite');

		// the header renders from the module rather than hard-coding links
		const header = read('src/lib/components/Header.svelte');
		expect(header).toMatch(/from '\$lib\/nav'/);
		expect(header).toMatch(/#each primary/);
		expect(header).not.toMatch(/cart/i);

		// and the drawer exposes its state to assistive tech
		expect(header).toMatch(/aria-expanded=\{menuOpen\}/);
		expect(header).toMatch(/Escape/);
	});

	it('A4.6 the home H1 is deterministic and at most 70 characters', () => {
		expect(copy.home.hero.h1.length).toBeLessThanOrEqual(70);
		const randomUsers = srcFiles(['.svelte', '.ts'])
			.filter((f) => /Math\.random/.test(read(relative(f))))
			.map(relative);
		expect(randomUsers).toEqual([]);
		// the headline is a constant, not a load-time selection
		expect(typeof copy.home.hero.h1).toBe('string');
	});

	it('A4.7 no price string renders in the home hero or its chrome', () => {
		const PRICE = /\$\s?\d|\b\d+\s*\/\s*(mo|month)\b|\b\d+\s*(usd|dollars)\b/i;
		const heroCopy = collectStrings(copy.home.hero).join(' ');
		expect(heroCopy).not.toMatch(PRICE);
		expect(templateText(read('src/lib/components/Header.svelte'))).not.toMatch(PRICE);

		// belt and braces: nothing anywhere on the home page quotes a price
		const homeCopy = collectStrings({
			home: copy.home,
			principles: copy.principles
		}).join(' ');
		expect(homeCopy).not.toMatch(PRICE);
		expect(templateText(read('src/routes/+page.svelte'))).not.toMatch(PRICE);
	});

	it('A4.8 no commerce path is left on the storefront', () => {
		expect(exists('src/routes/cart')).toBe(false);
		expect(exists('src/lib/server/stripe.ts')).toBe(false);
		expect(nav.utility.some((i) => i.href === '/cart')).toBe(false);
	});

	// Regression guard: no LinkedIn anchor, evidence id, or href anywhere in source.
	it('A4.11 no LinkedIn anchor exists anywhere in source', () => {
		const hits = srcFiles(['.svelte', '.ts'])
			.filter((f) => /linkedin/i.test(read(relative(f))))
			.map(relative);
		expect(hits).toEqual([]);
	});

	it('A4.10 the community list is Patreon plus Discord once minted, rendered by the footer and never the header', () => {
		// Shape follows the invite: no invite, no Discord. The test reads the same
		// constant the module does, so it is correct in both states.
		expect(nav.community.map((i) => i.label)).toEqual(
			DISCORD_INVITE ? ['Patreon', 'Discord'] : ['Patreon']
		);
		expect(new URL(nav.community[0].href).host).toBe('www.patreon.com');
		if (DISCORD_INVITE) expect(nav.community[1].href).toBe(DISCORD_INVITE);

		// every community link leaves starhold.dev and says so
		expect(nav.community.every((i) => i.external === true)).toBe(true);

		// the footer renders from the module; the header stays at its 4 + utility
		expect(read('src/lib/components/Footer.svelte')).toMatch(/#each community/);
		expect(read('src/lib/components/Header.svelte')).not.toMatch(/community/);
	});
});
