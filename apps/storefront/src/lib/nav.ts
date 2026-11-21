// Navigation SSOT. The header, the mobile drawer, and the footer all render
// from these arrays — there is exactly one place to add or rename a link.
// STAR-299 shape: one link per audience (read from the one audience list, so a
// new audience gets its link for free), then Pricing, Products and Docs.

import { pick, ACCOUNT_URL } from './launch';
import { AUDIENCES, audienceHref } from './content/catalog';

export type NavItem = {
	label: string;
	href: string;
	/** true when the href leaves starhold.dev (gets rel=noopener) */
	external?: boolean;
};

const DOCS: NavItem = { label: 'Docs', href: 'https://starhold.fyi', external: true };

/** Header: the audiences, then Pricing · Products · Docs, then the account buttons. */
export const primary: NavItem[] = [
	...AUDIENCES.map((a) => ({ label: a.navLabel, href: audienceHref(a) })),
	{ label: 'Pricing', href: '/pricing' },
	{ label: 'Products', href: '/products' },
	DOCS
];

/** The single call to action. Before launch it is the only header button; after launch the
 *  header shows the two account buttons below instead, and this stays the "start here" link. */
export const cta: NavItem = pick<NavItem>(
	{ label: 'Request an invite', href: '/invite' },
	{ label: 'Get started', href: '/#services' }
);

/** "Create account" beside "Sign in", everywhere a header shows (operator, 2026-11-19: people who
 *  do not see a create button never make an account). Starhold Account has no separate sign-up
 *  step: the first Google sign-in creates the account, so both lead to the same place.
 *  Null before launch: no account link until sign-in works (STAR-145 ruling 7). */
export const accountLinks: { create: NavItem; signIn: NavItem } | null = pick(null, {
	create: { label: 'Create account', href: ACCOUNT_URL, external: true },
	signIn: { label: 'Sign in', href: ACCOUNT_URL, external: true }
});

/** Footer, first row: the header links plus open source, fleet status and contact. */
export const footerSite: NavItem[] = [
	...primary,
	{ label: 'Open source', href: '/#open-source' },
	{ label: 'Fleet status', href: 'https://status.starhold.fyi', external: true },
	// HELIO-6: reads the fleet's signed status posts from public relays when the status page is down. github.io,
	// not a Starhold host, so the link still works when Starhold's own DNS does not.
	{ label: 'Outage reader', href: 'https://starholdsoftware.github.io/status-reader/', external: true },
	// STAR-310: what shipped, with an RSS feed.
	{ label: 'Changelog', href: '/changelog' },
	{ label: 'Contact', href: '/contact' }
];

export const legal: NavItem[] = [
	{ label: 'Terms', href: '/legal/terms' },
	{ label: 'Privacy', href: '/legal/privacy' },
	{ label: 'Refunds', href: '/legal/refunds' }
];

/** Patreon only, as a plain link (ruling 5). Discord links live on the Shush and
 *  Starbot pages, never in the footer. */
export const backTheWork: NavItem = {
	label: 'Back the work',
	href: 'https://www.patreon.com/cw/Quadstronaut',
	external: true
};

/** Closing line, exactly as in the brief. */
export const closingLine = 'Starhold · Sovereign systems, built and operated. · Est. 2026';
