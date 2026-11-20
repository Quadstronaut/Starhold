// STAR-301: /peridot is a thank you, never an ask. One Patreon link, plain name, no asking words.
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import Page from '../../routes/peridot/+page.svelte';
import PrivacyPage from '../../routes/peridot/privacy/+page.svelte';
import DeletePage from '../../routes/peridot/delete/+page.svelte';
import TermsPage from '../../routes/peridot/terms/+page.svelte';
import Footer from '../components/Footer.svelte';
import { exists, read } from '../../acceptance/_helpers';
import { PERIDOT_SUPPORTERS, PERIDOT_DEDICATION, PATREON_URL, PATREON_LINK_TEXT } from './page-content';

const { body, head } = render(Page);
const text = body.replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('STAR-301 /peridot', () => {
	it('renders with its route, title and the free / Android / coming-soon facts', () => {
		expect(exists('src/routes/peridot/+page.svelte')).toBe(true);
		expect(head).toContain('<title>Peridot</title>');
		expect(text).toContain('Peridot is free');
		expect(text).toContain('Android');
		expect(text).toContain('Coming to Google Play.');
	});

	it('has exactly one Patreon link and its text is the plain name', () => {
		const links = [...body.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
		const patreon = links.filter((m) => /patreon/i.test(m[1]));
		expect(patreon).toHaveLength(1);
		expect(patreon[0][1]).toBe(PATREON_URL);
		expect(patreon[0][2].trim()).toBe('Starhold on Patreon');
		expect(PATREON_LINK_TEXT).toBe('Starhold on Patreon');
		expect(links.filter((m) => /^https?:/.test(m[1]))).toHaveLength(1);
	});

	it('never asks: no donate, support us, become a patron, help keep, consider', () => {
		for (const w of ['donate', 'support us', 'become a patron', 'help keep', 'consider', 'early access', 'exclusive']) {
			expect(text.toLowerCase(), w).not.toContain(w);
		}
		expect(text).not.toMatch(/[—!]/);
	});

	it('has the thanks sentence, the dedication from the constants file and no names yet', () => {
		expect(text).toContain('Thank you to the people who support Starhold on Patreon. Their support paid for the time to build this.');
		expect(text).toContain(PERIDOT_DEDICATION);
		expect(PERIDOT_DEDICATION).toBe('For the friend who asked me to build this.');
		expect(PERIDOT_SUPPORTERS).toEqual([]);
		expect(body).not.toContain('<li>');
	});

	it('links to the privacy and delete pages, and they link back', () => {
		expect(body).toContain('href="/peridot/privacy"');
		expect(body).toContain('href="/peridot/delete"');
		expect(body).toContain('href="/peridot/terms"');
		expect(read('src/routes/peridot/terms/+page.svelte')).toContain('href="/peridot"');
		expect(read('src/routes/peridot/privacy/+page.svelte')).toContain('href="/peridot"');
		expect(read('src/routes/peridot/delete/+page.svelte')).toContain('href="/peridot"');
	});

	it('is static, has no feedback link and is not in the nav or product lists', () => {
		expect(body).not.toMatch(/<(script|form|input|button|iframe|img|link|style)\b/i);
		expect(body).not.toContain('feedback');
		for (const f of ['src/lib/nav.ts', 'static/products.json', 'src/lib/products.ts']) expect(read(f).toLowerCase(), f).not.toContain('peridot');
	});

	it('keeps supporter names only in the constants file', () => {
		expect(read('src/routes/peridot/+page.svelte')).toContain('PERIDOT_SUPPORTERS');
	});
});

// STAR-301: the site-wide footer "Back the work" link is an ask, so it is hidden under /peridot.
describe('STAR-301 footer on /peridot routes', () => {
	const patreonLinks = (html: string) => [...html.matchAll(/<a\b[^>]*href="([^"]*patreon\.com[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];

	it('the layout hides the footer link for /peridot and /peridot/* only', () => {
		const layout = read('src/routes/+layout.svelte');
		expect(layout).toContain("page.url.pathname === '/peridot'");
		expect(layout).toContain("page.url.pathname.startsWith('/peridot/')");
		expect(layout).toContain('showBackTheWork=');
	});

	it('Footer renders Back the work by default (home) and omits it when told to', () => {
		expect(patreonLinks(render(Footer).body).map((m) => m[2].trim())).toEqual(['Back the work']);
		expect(patreonLinks(render(Footer, { props: { showBackTheWork: false } }).body)).toHaveLength(0);
	});

	it('/peridot page plus peridot footer has exactly one patreon link, "Starhold on Patreon"; privacy and delete have none', () => {
		const all = patreonLinks(render(Page).body + render(Footer, { props: { showBackTheWork: false } }).body);
		expect(all.map((m) => m[2].trim())).toEqual(['Starhold on Patreon']);
		for (const P of [PrivacyPage, DeletePage, TermsPage]) {
			expect(patreonLinks(render(P).body + render(Footer, { props: { showBackTheWork: false } }).body)).toHaveLength(0);
		}
	});
});
