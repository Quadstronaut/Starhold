// P2.8: Services Terms page (draft) is gated behind SERVICES_TERMS_APPROVED.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { read } from './_helpers';
import { ENGAGEMENT_RULES } from '../lib/content/managed-ops';
import { RATES, usd } from '../lib/content/rates';

const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
// Accept either escaped or raw apostrophes so the check survives Svelte's escaping choices.
const has = (html: string, s: string) => html.includes(s) || html.includes(esc(s)) || html.includes(s.replace(/'/g, '&#39;')) || html.includes(s.replace(/'/g, '&#x27;'));

async function load(flag: boolean) {
	vi.resetModules();
	vi.doMock('../lib/site-links', async (orig) => ({
		...(await orig<typeof import('../lib/site-links')>()),
		SERVICES_TERMS_APPROVED: flag
	}));
	const Page = (await import('../routes/legal/services/+page.svelte')).default;
	const Terms = (await import('../routes/legal/terms/+page.svelte')).default;
	const nav = await import('../lib/nav');
	// Same module graph as the pages, or Svelte's SSR context is not shared.
	const { render } = await import('svelte/server');
	return { Page, Terms, nav, render };
}

afterEach(() => {
	vi.doUnmock('../lib/site-links');
	vi.resetModules();
});

// Each test cold-imports and SSR-compiles pages after vi.resetModules, which can
// exceed the 5s default (observed flaky ~1 in 8 full runs); give the blocks headroom.
describe('P2.8 services terms (flag false)', { timeout: 30_000 }, () => {
	it('ships the flag as true (operator approved 2026-10-22)', () => {
		expect(read('src/lib/site-links.ts')).toMatch(/SERVICES_TERMS_APPROVED: boolean = true;/);
	});

	it('renders headings, entity, contact, every rule, rates', async () => {
		const { Page, render } = await load(false);
		const { body } = render(Page, { props: {} });
		for (const h of [
			'Services Terms',
			'Customer-gated deployments',
			'Liability',
			'Scope: no database work',
			'Response times'
		])
			expect(body).toContain(h);
		for (const r of ENGAGEMENT_RULES) expect(has(body, r.text)).toBe(true);
		expect(body).toContain('Copper Jerky LLC');
		expect(body).toContain('hello@starhold.dev');
		expect(body).toContain(usd(RATES.personalHourlyUsd));
		expect(body).toContain(usd(RATES.businessHourlyUsd));
		expect(body).toContain(usd(RATES.managedOpsServerMonthlyUsd));
	});

	it('shows the draft-wording line', async () => {
		const { Page, render } = await load(false);
		expect(render(Page, { props: {} }).body).toContain('Draft wording');
	});

	it('is noindex, absent from nav, and terms are unchanged', async () => {
		const { Page, Terms, nav, render } = await load(false);
		const { head } = render(Page, { props: {} });
		expect(head).toContain('noindex');
		expect(nav.legal.map((i) => i.href)).not.toContain('/legal/services');
		expect(render(Terms, { props: {} }).body).not.toContain('Services Terms');
	});
});

describe('P2.8 services terms (flag true)', { timeout: 30_000 }, () => {
	it('drops noindex, joins nav, links from terms section 8', async () => {
		const { Page, Terms, nav, render } = await load(true);
		expect(render(Page, { props: {} }).head).not.toContain('robots');
		expect(render(Page, { props: {} }).body).not.toContain('Draft wording');
		expect(nav.legal).toContainEqual({ label: 'Services Terms', href: '/legal/services' });
		expect(render(Terms, { props: {} }).body).toContain(
			'Managed services and hourly work are governed by the'
		);
	});
});

describe('P2.8 hygiene', () => {
	it('is not a marketing route and has no checkout reference', () => {
		expect(read('src/lib/content/copy.ts') + read('src/acceptance/_helpers.ts')).not.toContain('legal/services');
		expect(read('src/routes/legal/services/+page.svelte')).not.toContain('/api/services');
	});
});
