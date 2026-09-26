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
	'work',
	'capabilities',
	'operator',
	'contact',
	'services/automation',
	'products/custom-bots',
	'products/qnix',
	'products/shushgame',
	'cart',
	'cart/success',
	'legal/terms',
	'legal/privacy',
	'legal/refunds'
];

const ENDPOINTS = ['api/checkout', 'api/intake', 'api/stripe/webhook', 'about'];

describe('A4 · information architecture', () => {
	it('A4.1 every pinned route has a page component', () => {
		const missing = PAGES.filter((p) => !exists(`src/routes/${p ? p + '/' : ''}+page.svelte`));
		expect(missing).toEqual([]);
	});

	it('A4.2 /about is a real 308 endpoint with no page component', () => {
		expect(exists('src/routes/about/+page.svelte')).toBe(false);
		expect(exists('src/routes/about/+server.ts')).toBe(true);
		const src = read('src/routes/about/+server.ts');
		expect(src).toMatch(/redirect\(\s*308\s*,\s*['"]\/operator['"]\s*\)/);
		expect(src).toMatch(/export const GET/);
	});

	it('A4.3 the published products.json contract is unchanged', () => {
		const products = parseCatalog(catalog);
		expect(products.map((p) => p.id)).toEqual(['shushgame', 'custom-bots', 'qnix', 'automation', 'fullstack']);

		const bots = products.find((p) => p.id === 'custom-bots')!;
		expect(bots.pricing).toEqual({ model: 'subscription', monthly_usd: 5, ops_pack_usd: 9 });
		expect(bots.url).toBe('https://starhold.dev/products/custom-bots');

		expect(products.find((p) => p.id === 'qnix')!.status).toBe('coming-soon');
		expect(products.find((p) => p.id === 'automation')!.pricing.model).toBe('quote');
		expect(products.find((p) => p.id === 'automation')!.url).toBe(
			'https://starhold.dev/services/automation'
		);
		expect(products.find((p) => p.id === 'shushgame')!.url).toBe('https://shushgame.com');
	});

	it('A4.4 the home page still owns the #fleet anchor', () => {
		expect(read('src/routes/+page.svelte')).toMatch(/id="fleet"/);
	});

	it('A4.5 navigation is data-driven with 4-5 primary items and a cart in utility', () => {
		expect(nav.primary.length).toBeGreaterThanOrEqual(4);
		expect(nav.primary.length).toBeLessThanOrEqual(5);
		expect(nav.primary.map((i) => i.href)).toEqual(
			expect.arrayContaining(['/work', '/capabilities', '/operator', '/contact'])
		);
		expect(nav.utility.map((i) => i.href)).toContain('/cart');
		expect(nav.cta.href.startsWith('/contact')).toBe(true);

		// the header renders from the module rather than hard-coding links
		const header = read('src/lib/components/Header.svelte');
		expect(header).toMatch(/from '\$lib\/nav'/);
		expect(header).toMatch(/#each primary/);
		expect(header).toMatch(/data-testid="cart-link"/);

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
			capabilities: copy.capabilities.items,
			work: copy.work.items,
			principles: copy.principles
		}).join(' ');
		expect(homeCopy).not.toMatch(PRICE);
		expect(templateText(read('src/routes/+page.svelte'))).not.toMatch(PRICE);
	});

	it('A4.8 the commerce path is still reachable and still sells', () => {
		// home -> /products/custom-bots is one hop through selected work
		expect(copy.work.items.map((w) => w.href)).toContain('/products/custom-bots');
		expect(templateText(read('src/lib/components/BotConfigurator.svelte'))).toContain('Add to cart');
		expect(nav.utility.some((i) => i.href === '/cart')).toBe(true);
	});

	it('A4.9 the operator Elsewhere list is Patreon, Discord once minted, GitHub — no LinkedIn, no evidence id', () => {
		// Static entries only, in fixed order. Hosts are pinned; the hrefs carry no
		// digits, because A3.8 walks every static copy string and rejects any
		// number other than the founding year.
		const withoutInvite = copy.operator.links('');
		expect(withoutInvite.map((l) => [l.label, new URL(l.href).host])).toEqual([
			['Patreon', 'www.patreon.com'],
			['GitHub', 'github.com']
		]);

		// The invite is spliced between the two, and only when it is non-empty.
		// A digit-bearing sample proves the function shape is what keeps A3.8 green.
		const withInvite = copy.operator.links('https://discord.gg/x1y2z3');
		expect(withInvite.map((l) => l.label)).toEqual(['Patreon', 'Discord', 'GitHub']);
		expect(withInvite[1].href).toBe('https://discord.gg/x1y2z3');

		// No entry carries an evidence id: a profile is a place, not a claim.
		for (const l of withInvite) expect(l).not.toHaveProperty('evidence');

		// LinkedIn is not on /operator or on the home proof strip.
		expect(copy.operator).not.toHaveProperty('profileLink');
		expect(collectStrings(copy.operator).join('\n')).not.toMatch(/linkedin/i);
		expect(copy.home.proof.some((p) => p.href.includes('linkedin.com'))).toBe(false);
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
