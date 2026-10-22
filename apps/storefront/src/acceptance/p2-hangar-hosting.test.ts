// P2.9: Hangar hosting page renders price, inclusions, exclusions and onboarding from the content module.
import { describe, it, expect, vi } from 'vitest';
import { render } from 'svelte/server';
import Page from '../routes/services/hosting/+page.svelte';
import Refunds from '../routes/legal/refunds/+page.svelte';
import { INCLUDED, NOT_INCLUDED, ONBOARDING, BILLING_TERMS } from '../lib/content/hangar-hosting';
import { exists, read } from './_helpers';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

describe('P2.9 hangar hosting page', () => {
	const { body } = render(Page, { props: {} });

	it('states $19/app/month and links the hosting CTA, refunds and the Managed Ops alternative', () => {
		expect(body).toContain('$19/app/month');
		expect(body).toContain('href="/contact?intent=hosting"');
		expect(body).toContain('Request Hangar hosting');
		expect(body).toContain('href="/legal/refunds"');
		expect(body).toContain('href="/services/managed-ops"');
	});

	it('renders every included, excluded and onboarding line', () => {
		for (const i of [...INCLUDED, ...NOT_INCLUDED, ...ONBOARDING]) expect(body).toContain(esc(i));
	});

	it('hides the /legal/services link while the terms are unapproved, shows it once approved', { timeout: 30_000 }, async () => {
		for (const flag of [false, true]) {
			vi.resetModules();
			vi.doMock('../lib/site-links', async (orig) => ({
				...(await orig<typeof import('../lib/site-links')>()),
				SERVICES_TERMS_APPROVED: flag
			}));
			const P = (await import('../routes/services/hosting/+page.svelte')).default;
			const { render: r } = await import('svelte/server');
			expect(r(P, { props: {} }).body.includes('href="/legal/services"')).toBe(flag);
		}
		vi.doUnmock('../lib/site-links');
		vi.resetModules();
	});

	it('has no checkout surface and promises no managed databases', () => {
		expect(exists('src/routes/services/hosting/+page.server.ts')).toBe(false);
		expect(body).not.toContain('<input');
		expect(body).not.toContain('/api/services/checkout');
		expect(body).toContain('No managed databases');
		expect(body.replace(/No managed databases/g, '')).not.toMatch(/managed database/i);
		expect(body).not.toContain('ask for Managed Ops');
	});

	it('refunds page and services terms carry the same hosting sentence', () => {
		expect(render(Refunds, { props: {} }).body).toContain(BILLING_TERMS);
		expect(read('src/routes/legal/services/+page.svelte')).toContain('BILLING_TERMS');
	});
});