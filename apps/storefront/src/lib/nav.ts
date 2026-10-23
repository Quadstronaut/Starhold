// Navigation SSOT. The header, the mobile drawer, and the footer all render
// from these arrays — there is exactly one place to add or rename a link.
import { DISCORD_INVITE, SERVICES_TERMS_APPROVED } from './site-links';

export type NavItem = {
	label: string;
	href: string;
	/** true when the href leaves starhold.dev (gets rel=noopener + a hint) */
	external?: boolean;
};

/** Primary navigation. 4–5 items, no more — a solo operator's site does not
 *  need a mega-menu, and every extra item costs the 10-second evaluator.
 *  STAR-134: the site leads with the services I host and operate, so primary
 *  points at those; the hiring pages moved to `secondary` below. */
export const primary: NavItem[] = [
	{ label: 'Services', href: '/#fleet' },
	{ label: 'Principles', href: '/#principles' },
	{ label: 'Questions', href: '/#faq' },
	{ label: 'Contact', href: '/contact' }
];

/** Secondary navigation: hiring the operator. Still one click from every page
 *  (footer column, and the home page's own hire section), never the headline. */
export const secondary: NavItem[] = [
	{ label: 'Work', href: '/work' },
	{ label: 'Capabilities', href: '/capabilities' },
	{ label: 'Rates', href: '/rates' },
	{ label: 'Operator', href: '/operator' },
	{ label: 'Request a quote', href: '/contact?intent=quote' }
];

/** The one visually distinct call to action that rides in the header. Every
 *  service is invitation only while it is under development. */
export const cta: NavItem = { label: 'Request an invite', href: '/contact?intent=invite' };

/** Utility cluster: the things that prove the site is real, plus the cart.
 *  Commerce lives here — reachable from every route, never the headline. */
export const utility: NavItem[] = [
	{ label: 'Docs', href: 'https://starhold.fyi', external: true },
	{ label: 'Status', href: 'https://status.starhold.fyi', external: true },
	{ label: 'Hangar', href: 'https://starhold.app', external: true },
	{ label: 'Cart', href: '/cart' }
];

/** Everything in the utility cluster except the cart. The cart gets its own
 *  always-visible control in the header bar so it stays one click away at
 *  375px — putting it behind the hamburger would make it two. */
export const utilityLinks: NavItem[] = utility.filter((i) => i.href !== '/cart');

export const cartLink: NavItem = utility.find((i) => i.href === '/cart')!;

export const legal: NavItem[] = [
	{ label: 'Terms', href: '/legal/terms' },
	{ label: 'Privacy', href: '/legal/privacy' },
	{ label: 'Refunds', href: '/legal/refunds' },
	// Hidden until the operator approves the draft wording (see site-links.ts).
	...(SERVICES_TERMS_APPROVED ? [{ label: 'Services Terms', href: '/legal/services' }] : [])
];

/** Where to back the work and where to talk about it. Rendered by the footer
 *  only — the header stays at four primary items plus the utility cluster.
 *  Discord joins the list the moment DISCORD_INVITE is non-empty; until then
 *  the site does not advertise a door that is not open. */
export const community: NavItem[] = [
	{ label: 'Patreon', href: 'https://www.patreon.com/cw/Quadstronaut', external: true },
	...(DISCORD_INVITE ? [{ label: 'Discord', href: DISCORD_INVITE, external: true }] : [])
];
