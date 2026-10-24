// Tier A · A4 — information architecture contract.
// Route map, navigation shape, hero determinism, and the commerce demotion.
import { describe, it, expect } from 'vitest';
import * as nav from '../lib/nav';
import * as copy from '../lib/content/copy';
import catalog from '../../static/products.json';
import { parseCatalog } from '../lib/products';
import { read, exists, templateText, collectStrings, srcFiles, relative } from './_helpers';

/** Every route that must resolve. Paths are pinned by the spec. */
const PAGES = [
	'',
	'contact',
	'qnix',
	'shush',
	'invite',
	'account',
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
		for (const p of ['about', 'cart', 'work', 'rates', 'operator', 'capabilities', 'services', 'api/checkout', 'api/stripe', 'products'])
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

	it('A4.4 Services, Principles and Questions are home anchors, not pages', () => {
		const home = read('src/routes/+page.svelte');
		for (const id of ['services', 'principles', 'faq', 'fleet', 'operator']) expect(home, id).toMatch(new RegExp('id="' + id + '"'));
		for (const p of ['services', 'principles', 'questions', 'faq']) expect(exists('src/routes/' + p), p).toBe(false);
	});

	it('A4.5 header: Services, Principles, Questions, Hangar, Docs, then Request an invite; no Sign in', () => {
		expect(nav.primary.map((i) => i.label)).toEqual(['Services', 'Principles', 'Questions', 'Hangar', 'Docs']);
		expect(nav.primary.map((i) => i.href)).toEqual(['/#services', '/#principles', '/#faq', 'https://starhold.app', 'https://starhold.fyi']);
		expect(nav.cta).toEqual({ label: 'Request an invite', href: '/invite' });
		const all = JSON.stringify([nav.primary, nav.cta, nav.footerSite]);
		expect(all).not.toMatch(/sign in|signin|\/account|\/cart/i);

		// the header renders from the module rather than hard-coding links
		const header = read('src/lib/components/Header.svelte');
		expect(header).toMatch(/from '\$lib\/nav'/);
		expect(header).toMatch(/#each primary/);
		expect(header).not.toMatch(/cart|sign in/i);

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
		expect(nav.footerSite.some((i) => i.href === '/cart')).toBe(false);
	});

	// Regression guard: no LinkedIn anchor, evidence id, or href anywhere in source.
	it('A4.11 no LinkedIn anchor exists anywhere in source', () => {
		const hits = srcFiles(['.svelte', '.ts'])
			.filter((f) => /linkedin/i.test(read(relative(f))))
			.map(relative);
		expect(hits).toEqual([]);
	});

	it('A4.10 footer: site links, legal links, hello@ address, Back the work, and the closing line', () => {
		expect(nav.footerSite.map((i) => i.label)).toEqual([
			'Services', 'Principles', 'Questions', 'Hangar', 'Docs', 'Fleet status', 'Contact'
		]);
		expect(nav.legal.map((i) => i.label)).toEqual(['Terms', 'Privacy', 'Refunds']);
		expect(nav.backTheWork.label).toBe('Back the work');
		expect(new URL(nav.backTheWork.href).host).toBe('www.patreon.com');
		expect(nav.closingLine).toBe('Starhold · Sovereign systems, built and operated. · Est. 2026');

		// ruling 5: no Discord link in the footer or the header
		const footer = read('src/lib/components/Footer.svelte');
		expect(footer).not.toMatch(/discord/i);
		expect(read('src/lib/components/Header.svelte')).not.toMatch(/discord/i);
		expect(footer).toMatch(/closingLine/);
		expect(footer).toMatch(/site\.email/);
	});

	it('A4.12 the 404 page has the brief copy, three exits and no animation', () => {
		const err = read('src/routes/+error.svelte');
		expect(err).toContain('404 · Page not found');
		expect(err).toContain('No signal at this address.');
		expect(err).toContain("This page doesn't exist here, or its address may have moved. Nothing else happened.".slice(1, -1));
		for (const l of ['>Home<', '>Hangar<', '>Contact<']) expect(err).toContain(l);
		expect(err).not.toMatch(/@keyframes|animation\s*:/);
	});

	it('A4.13 /account is one honest stub with the In development chip, and nothing links to it from the header', () => {
		const page = read('src/routes/account/+page.svelte');
		expect(page).toMatch(/labelFor\('account'\)/);
		expect(copy.account.lede).toBe('Starhold Account is in development.');
		expect(page).not.toMatch(/<form|<input/);
		expect(read('src/lib/components/Header.svelte')).not.toMatch(/account/i);
	});});
