// STAR-142: the launch switch (lib/launch.ts). Every check runs in BOTH states.
//   off: the wording that ships today is unchanged (the pinned tests elsewhere cover the details).
//   on : none of the closed-gate words appear anywhere in the copy of the four open products,
//        and the prices on the page are the ones the release bars state.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { collectStrings } from '../acceptance/_helpers';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO, loadPairs, transform } from '../../../../deploy/launch-overlay.mjs';

/** Re-import the copy modules with the switch forced to one state. */
async function load(launched: boolean) {
	vi.resetModules();
	vi.doMock('./launch', () => ({
		LAUNCHED: launched,
		pick: <T>(off: T, on: T): T => (launched ? on : off),
		ACCOUNT_URL: 'https://starship.starhold.app'
	}));
	const [copy, avail, labels, nav, errors] = await Promise.all([
		import('./content/copy'),
		import('./availability'),
		import('./labels'),
		import('./nav'),
		import('./errors')
	]);
	return { copy, avail, labels, nav, errors };
}

afterEach(() => vi.doUnmock('./launch'));

const OPEN_PRODUCTS = ['render', 'status', 'umbermark', 'zenithmark'] as const;

// "Closed gate" words. Case-insensitive; the apostrophe may be straight or curly.
const CLOSED_GATE = [/invite/i, /invitation/i, /paused/i, /not open/i, /isn['’]t open/i, /under construction/i, /by hand/i];

/** The copy a reader meets about the four open products and the pages around them. */
function surface(m: Awaited<ReturnType<typeof load>>): string {
	const { copy, avail, labels, nav, errors } = m;
	const openCards = copy.serviceItems.filter((s) => (OPEN_PRODUCTS as readonly string[]).includes(s.id));
	return collectStrings({
		home: copy.home,
		principles: copy.principles,
		openCards,
		servicesChrome: { label: copy.services.inviteLabel, href: copy.services.inviteHref('render') },
		faq: copy.faq,
		invite: copy.invite,
		account: copy.account,
		contact: copy.contact,
		comingSoon: copy.comingSoon,
		checkout: avail.CHECKOUT_NOTICE,
		openMeans: avail.OPEN_MEANS,
		availability: OPEN_PRODUCTS.map((id) => avail.availabilityFor(id)),
		labels: [...OPEN_PRODUCTS, 'account'].map((id) => labels.labelFor(id)),
		cta: nav.cta,
		e401: errors.copyFor(401)
	}).join('\n');
}

describe('launch switch', () => {
	describe('off: wording is the pre-launch wording', () => {
		it('keeps the gates visible', async () => {
			const m = await load(false);
			expect(m.avail.CHECKOUT_NOTICE).toBe('Checkout is paused; nothing is for sale today. These rules apply when it reopens.');
			expect(m.avail.availabilityFor('render')).toBe('Free tier open; sign-in and checkout closed');
			expect(m.labels.labelFor('render')).toBe('Invitation only');
			expect(m.labels.labelFor('account')).toBe('In development');
			expect(m.nav.cta).toEqual({ label: 'Request an invite', href: '/invite' });
			expect(m.copy.home.hero.ctaPrimary).toEqual({ label: 'Request an invite', href: '/invite' });
			expect(m.errors.copyFor(401).explanation).toContain('access is by invitation only');
			expect(m.copy.comingSoon[0]).toBe('Export and delete your own data from your account.');
			const render = m.copy.serviceItems.find((s) => s.id === 'render')!;
			expect(render).toMatchObject({ href: null, invite: true, action: 'Request an invite' });
			expect(CLOSED_GATE.some((re) => re.test(surface(m)))).toBe(true); // the test can see the words
		});
	});

	describe('on: every gate is open', () => {
		it('no closed-gate word appears in the copy of the four open products', async () => {
			const text = surface(await load(true));
			for (const re of CLOSED_GATE) expect(text, String(re)).not.toMatch(re);
		});

		it('the four products and the account read Open, the rest are untouched', async () => {
			const { labels, copy } = await load(true);
			for (const id of [...OPEN_PRODUCTS, 'account']) expect(labels.labelFor(id), id).toBe('Open');
			expect(labels.labelFor('shushgame')).toBe('Open · free');
			expect(labels.labelFor('starbot')).toBe('In development');
			expect(labels.labelFor('qnix')).toBe('In development');
			for (const l of Object.values(labels.PRODUCT_LABELS)) expect(labels.LABELS as readonly string[]).toContain(l);
			// the cards carry their own label and availability line
			for (const s of copy.serviceItems) expect(s.status, s.id).toBe(labels.labelFor(s.id));
		});

		it('states the agreed prices, and no Zenithmark price', async () => {
			const { avail, copy } = await load(true);
			expect(avail.availabilityFor('render')).toContain('Hobby $5, Pro $19, Scale $49 a month');
			expect(avail.availabilityFor('status')).toContain('Private $15, MSP $29 a month');
			expect(avail.availabilityFor('umbermark')).toContain('report $5 one-off, Pro $19 a month');
			expect(avail.availabilityFor('zenithmark')).toBe('Open');
			const zen = copy.serviceItems.find((s) => s.id === 'zenithmark')!;
			expect(JSON.stringify(zen)).not.toMatch(/\$\d/);
		});

		it('sends people to sign in or to the services, never to an invite', async () => {
			const { copy, nav, errors } = await load(true);
			expect(nav.cta).toEqual({ label: 'Get started', href: '/#services' });
			expect(copy.home.hero.ctaPrimary).toEqual({ label: 'Get started', href: '/#services' });
			expect(copy.home.hero.ctaSecondary).toEqual({ label: 'Sign in', href: 'https://starship.starhold.app' });
			expect(copy.account.cta).toEqual({ label: 'Sign in', href: 'https://starship.starhold.app' });
			expect(copy.account.body.join(' ')).toContain('Sign in with Google at starship.starhold.app');
			expect(errors.copyFor(401).explanation).toContain('https://starship.starhold.app');
			for (const id of ['render', 'status']) {
				const s = copy.serviceItems.find((x) => x.id === id)!;
				expect(s.invite).toBe(false);
				expect(s.href).toBe(`https://${id}.starhold.app`);
			}
		});

		it('does not claim what is not built: the remaining coming-soon items stay', async () => {
			const { copy } = await load(true);
			expect(copy.comingSoon).toEqual([
				'Notification controls you can switch off.',
				'Offline, on-your-machine tiers.',
				'One public price table.'
			]);
			const starbot = copy.serviceItems.find((s) => s.id === 'starbot')!;
			expect(starbot.status).toBe('In development');
		});

		it('the overlay for docs/shared (what the hangar and docs apps read) equals the storefront wording', async () => {
			const { avail, labels } = await load(true);
			const pairs = await loadPairs();
			const launchedJson = (file: string) => {
				const text = readFileSync(join(REPO, file), 'utf8');
				return JSON.parse(transform(file, text, pairs[file], true));
			};
			const a = launchedJson('docs/shared/availability.json');
			const l = launchedJson('docs/shared/labels.json');
			expect(a.products).toEqual(avail.AVAILABILITY);
			expect(a.checkoutNotice).toBe(avail.CHECKOUT_NOTICE);
			expect(a.openMeans).toBe(avail.OPEN_MEANS);
			expect(l.labels).toEqual([...labels.LABELS]);
			expect(l.products).toEqual(labels.PRODUCT_LABELS);
		});
	});

	describe('invite flow (routes keep their code)', () => {
		const url = new URL('http://localhost/invite?service=render');
		it('off: /invite and /contact?intent=invite render the form', async () => {
			vi.doMock('./launch', () => ({ LAUNCHED: false, pick: <T>(a: T) => a, ACCOUNT_URL: 'x' }));
			vi.resetModules();
			const inv = await import('../routes/invite/+page');
			const con = await import('../routes/contact/+page');
			expect(await (inv.load as any)({ url })).toEqual({ service: 'render' });
			expect(await (con.load as any)({ url: new URL('http://localhost/contact?intent=invite') })).toMatchObject({ intent: 'invite' });
		});
		it('on: both redirect to the service list', async () => {
			vi.doMock('./launch', () => ({ LAUNCHED: true, pick: <T>(_a: T, b: T) => b, ACCOUNT_URL: 'x' }));
			vi.resetModules();
			const inv = await import('../routes/invite/+page');
			const con = await import('../routes/contact/+page');
			const grab = async (p: () => unknown) => {
				try {
					await p();
				} catch (e: any) {
					return e;
				}
				return null;
			};
			const a = await grab(() => (inv.load as any)({ url }));
			const b = await grab(() => (con.load as any)({ url: new URL('http://localhost/contact?intent=invite') }));
			for (const r of [a, b]) {
				expect(r?.status).toBe(307);
				expect(r?.location).toBe('/#services');
			}
			// the plain contact form still works
			expect(await (con.load as any)({ url: new URL('http://localhost/contact') })).toMatchObject({ intent: 'contact' });
		});
	});
});
