// Navigation SSOT. The header, the mobile drawer, and the footer all render
// from these arrays — there is exactly one place to add or rename a link.
export type NavItem = {
	label: string;
	href: string;
	/** true when the href leaves starhold.dev (gets rel=noopener + a hint) */
	external?: boolean;
};

/** Primary navigation. 4–5 items, no more — a solo operator's site does not
 *  need a mega-menu, and every extra item costs the 10-second evaluator. */
export const primary: NavItem[] = [
	{ label: 'Work', href: '/work' },
	{ label: 'Capabilities', href: '/capabilities' },
	{ label: 'Operator', href: '/operator' },
	{ label: 'Contact', href: '/contact' }
];

/** The one visually distinct call to action that rides in the header. */
export const cta: NavItem = { label: 'Request a quote', href: '/contact?intent=quote' };

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
	{ label: 'Refunds', href: '/legal/refunds' }
];
