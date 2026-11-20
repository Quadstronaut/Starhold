// Tier A · A4 — information architecture contract.
// Route map, navigation shape, hero determinism, and the commerce demotion.
import { describe, it, expect } from 'vitest';
import * as nav from '../lib/nav';
import { LAUNCHED } from '../lib/launch';
import * as copy from '../lib/content/copy';
import { AUDIENCES } from '../lib/content/catalog';
import catalog from '../../static/products.json';
import { parseCatalog } from '../lib/products';
import { read, exists, templateText, collectStrings, srcFiles, relative } from './_helpers';

/** Every route that must resolve. Paths are pinned by the spec. */
const PAGES = [
	'',
	'contact',
	'dysonsphere',
	'shush',
	'invite',
	'account',
	'legal/terms',
	'legal/privacy',
	'legal/refunds',
	'peridot',
	'peridot/privacy',
	'peridot/delete',
	'peridot/terms'
];

const ENDPOINTS = ['api/intake'];

function copy404() {
	return JSON.stringify(JSON.parse(read('src/lib/error-copy.json')).codes['404']);
}

describe('A4 · information architecture', () => {
	it('A4.1 every pinned route has a page component', () => {
		const missing = PAGES.filter((p) => !exists(`src/routes/${p ? p + '/' : ''}+page.svelte`));
		expect(missing).toEqual([]);
	});

	it('A4.2 removed pages have no route left and redirect through the one map', () => {
		for (const p of ['about', 'cart', 'work', 'rates', 'operator', 'capabilities', 'services', 'api/checkout', 'api/stripe', 'products/custom-bots', 'products/shushgame', 'how-it-runs', 'hangar'])
			expect(exists(`src/routes/${p}`), p).toBe(false);
		// STAR-299: /products is a page again (the Products page); only its old subpages stay removed.
		expect(exists('src/routes/products/+page.svelte')).toBe(true);
		expect(read('src/hooks.server.ts')).toMatch(/redirect\(\s*301/);
		expect(read('src/hooks.server.ts')).toMatch(/#lib\/redirects/);
	});

	it('A4.3 the published products.json contract lists only live products', () => {
		const products = parseCatalog(catalog);
		expect(products.map((p) => p.id)).toEqual(['shushgame', 'dysonsphere']);
		expect(products.find((p) => p.id === 'dysonsphere')!.status).toBe('coming-soon');
		expect(products.find((p) => p.id === 'shushgame')!.url).toBe('https://shushgame.com');
	});

	it('A4.4 Services, Principles and Questions are home anchors, not pages', () => {
		const home = read('src/routes/+page.svelte');
		for (const id of ['services', 'principles', 'faq', 'fleet', 'operator']) expect(home, id).toMatch(new RegExp('id="' + id + '"'));
		for (const p of ['services', 'principles', 'questions', 'faq']) expect(exists('src/routes/' + p), p).toBe(false);
	});

	// STAR-299 (operator rulings 2026-11-19): one link per audience, read from the one audience list,
	// then Pricing, Products and Docs. "Create account" sits beside "Sign in" once sign-in works.
	it('A4.5 header: the audiences, Pricing, Products, Docs; Create account beside Sign in once launched', () => {
		expect(nav.primary.map((i) => i.label)).toEqual(['For home', 'Small business', 'Teams', 'Pricing', 'Products', 'Docs']);
		expect(nav.primary.map((i) => i.href)).toEqual(['/for/home', '/for/small-business', '/for/teams', '/pricing', '/products', 'https://starhold.fyi']);
		// the audience links are the audience list, not a second list
		expect(nav.primary.slice(0, AUDIENCES.length).map((i) => i.href)).toEqual(AUDIENCES.map((a) => `/for/${a.id}`));
		expect(nav.cta).toEqual(LAUNCHED ? { label: 'Get started', href: '/#services' } : { label: 'Request an invite', href: '/invite' });
		if (LAUNCHED) {
			expect(nav.accountLinks!.create).toMatchObject({ label: 'Create account', href: 'https://starship.starhold.app' });
			expect(nav.accountLinks!.signIn).toMatchObject({ label: 'Sign in', href: 'https://starship.starhold.app' });
		} else expect(nav.accountLinks).toBeNull(); // no account link until sign-in works (ruling 7)
		const all = JSON.stringify([nav.primary, nav.cta, nav.footerSite]);
		expect(all).not.toMatch(/sign in|signin|\/account|\/cart/i);

		// the header renders from the module rather than hard-coding links
		const header = read('src/lib/components/Header.svelte');
		expect(header).toMatch(/from '#lib\/nav\.js'/);
		expect(header).toMatch(/#each primary/);
		expect(header).toMatch(/accountLinks\.create[\s\S]*accountLinks\.signIn/); // create first, sign in beside it
		expect(templateText(header)).not.toMatch(/cart|sign in|account/i); // no hard-coded label

		// and the drawer exposes its state to assistive tech
		expect(header).toMatch(/aria-expanded=\{menuOpen\}/);
		expect(header).toMatch(/Escape/);
	});

	it('A4.6 the home H1 is deterministic and at most 70 characters', () => {
		expect(copy.home.hero.h1.length).toBeLessThanOrEqual(70);
		// One sanctioned user: the decorative hero art pool (STAR-166, operator decision
		// 2026-10-24) picks an image, never copy. Nothing else may randomise.
		const RANDOM_OK = new Set(['src/lib/heroes.ts', 'src/lib/errors.ts']);
		const randomUsers = srcFiles(['.svelte', '.ts'])
			.filter((f) => /Math\.random/.test(read(relative(f))))
			.map(relative)
			.filter((f) => !RANDOM_OK.has(f.split('\\').join('/')));
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
			'For home', 'Small business', 'Teams', 'Pricing', 'Products', 'Docs', 'Open source', 'Fleet status', 'Contact'
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

	it('A4.12 the error page renders the shared Starhold set (STAR-168): copy.json, Go back / Home, pool image, no inline script', () => {
		const err = read('src/routes/+error.svelte');
		for (const l of ['copyFor(', 'errLinks.back', 'errLinks.home', 'poolFor(', 'pickErr(']) expect(err).toContain(l);
		expect(err).not.toMatch(/<script[^>]*>\s*(?!lang)[^<]*document\./);
		expect(copy404()).toContain('LOST IN SPACE');
	});

	it('A4.13 /account is one honest stub with its status chip, and the header links to Starhold Account itself, never to the stub', () => {
		const page = read('src/routes/account/+page.svelte');
		expect(page).toMatch(/labelFor\('account'\)/);
		expect(copy.account.lede).toBe(LAUNCHED ? 'One account for every Starhold service.' : 'Starhold Account is in development.');
		expect(page).not.toMatch(/<form|<input/);
		expect(read('src/lib/components/Header.svelte')).not.toMatch(/["'`]\/account/);
	});

	// STAR-299: the redesign's own routes, and the anchors every old link still needs.
	it('A4.14 the audience, pricing and products pages exist, and /#services still lands on the products', () => {
		for (const p of ['for/[audience]', 'pricing', 'products']) expect(exists(`src/routes/${p}/+page.svelte`), p).toBe(true);
		const home = read('src/routes/+page.svelte');
		expect(home).toMatch(/id="services"[\s\S]*<ProductViews \/>/);
		expect(home).toMatch(/id="open-source"/);
		const views = read('src/lib/components/ProductViews.svelte');
		for (const id of ['by-audience', 'all-products']) expect(views, id).toMatch(new RegExp('id="' + id + '"'));
		// the two views are in the server HTML: hidden only once the script has run (no-JS shows both)
		expect(views).toMatch(/class:off=\{enhanced && view !== 'by-audience'\}/);
		expect(views).toMatch(/try \{\s*localStorage\.setItem/);
	});
});
