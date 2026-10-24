// Navigation SSOT. The header, the mobile drawer, and the footer all render
// from these arrays — there is exactly one place to add or rename a link.
// Shape follows the STAR-145 design brief section 2 and arbiter rulings 5-7.

export type NavItem = {
	label: string;
	href: string;
	/** true when the href leaves starhold.dev (gets rel=noopener) */
	external?: boolean;
};

const HANGAR: NavItem = { label: 'Hangar', href: 'https://starhold.app', external: true };
const DOCS: NavItem = { label: 'Docs', href: 'https://starhold.fyi', external: true };

/** Header: Services · Principles · Questions · Hangar · Docs, then the CTA.
 *  No "Sign in" and no /account link until sign-in works (ruling 7). */
export const primary: NavItem[] = [
	{ label: 'Services', href: '/#services' },
	{ label: 'Principles', href: '/#principles' },
	{ label: 'Questions', href: '/#faq' },
	HANGAR,
	DOCS
];

/** The one visually distinct call to action that rides in the header. */
export const cta: NavItem = { label: 'Request an invite', href: '/invite' };

/** Footer, first row: the header links plus fleet status and contact. */
export const footerSite: NavItem[] = [
	...primary,
	{ label: 'Fleet status', href: 'https://status.starhold.fyi', external: true },
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
