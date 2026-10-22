// P2.2: the rate card states both prices and the only differentiator is business vs personal.
// Asserts on SSR output because prices render from RATES (no literals in the template).
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from 'svelte/server';
import Page from '../routes/rates/+page.svelte';
import { ENGAGEMENT_RULES } from '../lib/content/managed-ops';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

afterEach(() => {
	vi.doUnmock('../lib/site-links');
	vi.resetModules();
});

describe('P2 rate card', () => {
	it('P2.2 rate card page states $49 and $149 and the business-vs-personal rule', () => {
		const { body } = render(Page, { props: {} });
		expect(body).toContain('$49/hr');
		expect(body).toContain('$149/hr');
		expect(body).toContain('small business');
		expect(body).not.toMatch(/(urgent|rush|complex|senior|weekend)/i);
	});

	it('P2.2 renders every engagement rule text (terms link is gated)', () => {
		const { body } = render(Page, { props: {} });
		for (const r of ENGAGEMENT_RULES) expect(body).toContain(esc(r.text));
	});

	it('P2.2 hides the draft /legal/services link while unapproved', { timeout: 30_000 }, async () => {
		vi.resetModules();
		vi.doMock('../lib/site-links', async (orig) => ({
			...(await orig<typeof import('../lib/site-links')>()),
			SERVICES_TERMS_APPROVED: false
		}));
		const P = (await import('../routes/rates/+page.svelte')).default;
		const { render: r } = await import('svelte/server');
		expect(r(P, { props: {} }).body).not.toContain('href="/legal/services"');
		vi.doUnmock('../lib/site-links');
		vi.resetModules();
	});

	// Cold dynamic import + SSR compile after resetModules can exceed 5s.
	it('P2.2 shows the /legal/services link once approved', { timeout: 30_000 }, async () => {
		vi.resetModules();
		vi.doMock('../lib/site-links', async (orig) => ({
			...(await orig<typeof import('../lib/site-links')>()),
			SERVICES_TERMS_APPROVED: true
		}));
		const P = (await import('../routes/rates/+page.svelte')).default;
		const { render: r } = await import('svelte/server');
		expect(r(P, { props: {} }).body).toContain('href="/legal/services"');
	});
});
