// P2.3: Managed Ops page renders price, inclusions and engagement rules from the content module.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'svelte/server';
import Page from '../routes/services/managed-ops/+page.svelte';
import { INCLUDED, ENGAGEMENT_RULES } from '../lib/content/managed-ops';
import { exists } from './_helpers';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

describe('P2.3 managed ops page', () => {
	const { body } = render(Page, { props: {} });

	it('states $99 and links /legal/services, /rates and the quote CTA', () => {
		expect(body).toContain('$99');
		expect(body).toContain('href="/rates"');
		expect(body).toContain('href="/contact?intent=quote"');
		expect(body).toContain('Request Managed Ops');
	});

	it('hides the draft /legal/services link while unapproved', { timeout: 30_000 }, async () => {
		vi.resetModules();
		vi.doMock('../lib/site-links', async (orig) => ({
			...(await orig<typeof import('../lib/site-links')>()),
			SERVICES_TERMS_APPROVED: false
		}));
		const P = (await import('../routes/services/managed-ops/+page.svelte')).default;
		const { render: r } = await import('svelte/server');
		expect(r(P, { props: {} }).body).not.toContain('href="/legal/services"');
		vi.doUnmock('../lib/site-links');
		vi.resetModules();
	});

	// Cold dynamic import + SSR compile after resetModules can exceed 5s.
	it('shows the /legal/services link once approved', { timeout: 30_000 }, async () => {
		vi.resetModules();
		vi.doMock('../lib/site-links', async (orig) => ({
			...(await orig<typeof import('../lib/site-links')>()),
			SERVICES_TERMS_APPROVED: true
		}));
		const P = (await import('../routes/services/managed-ops/+page.svelte')).default;
		const { render: r } = await import('svelte/server');
		expect(r(P, { props: {} }).body).toContain('href="/legal/services"');
		vi.doUnmock('../lib/site-links');
		vi.resetModules();
	});

	it('renders every included item and every rule text', () => {
		for (const i of INCLUDED) expect(body).toContain(esc(i));
		for (const r of ENGAGEMENT_RULES) expect(body).toContain(esc(r.text));
	});

	it('has no checkout surface (R2)', () => {
		expect(exists('src/routes/services/managed-ops/+page.server.ts')).toBe(false);
		expect(body).not.toContain('<input');
		expect(body).not.toContain('/api/services/checkout');
	});

	it('uses "database" and "24/7" only inside their exclusion rules', () => {
		const stripped = ENGAGEMENT_RULES.reduce((b, r) => b.split(esc(r.text)).join(''), body);
		expect(stripped).not.toMatch(/database/i);
		expect(stripped).not.toContain('24/7');
	});
});
