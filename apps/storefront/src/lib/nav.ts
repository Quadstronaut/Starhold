// Navigation SSOT. The header, the mobile drawer, and the footer all render
// from these arrays — there is exactly one place to add or rename a link.
import { DISCORD_INVITE } from './site-links';

export type NavItem = {
	label: string;
	href: string;
	/** true when the href leaves starhold.dev (gets rel=noopener + a hint) */
	external?: boolean;
};

/** Primary navigation. 4–5 items, no more — a solo operator's site does not
 *  need a mega-menu, and every extra item costs the 10-second evaluator.
 *  */
export const primary: NavItem[] = [
	{ label: 'Services', href: '/#fleet' },
	{ label: 'Principles', href: '/#principles' },
	{ label: 'Questions', href: '/#faq' },
	{ label: 'Contact', href: '/contact' }
];

/** The one visually distinct call to action that rides in the header. Every
 *  service is invitation only while it is under development. */
export const cta: NavItem = { label: 'Request an invite', href: '/contact?intent=invite' };

/** Utility cluster: the things that prove the site is real. */
export const utility: NavItem[] = [
	{ label: 'Docs', href: 'https://starhold.fyi', external: true },
	{ label: 'Status', href: 'https://status.starhold.fyi', external: true },
	{ label: 'Hangar', href: 'https://starhold.app', external: true }
];

export const legal: NavItem[] = [
	{ label: 'Terms', href: '/legal/terms' },
	{ label: 'Privacy', href: '/legal/privacy' },
	{ label: 'Refunds', href: '/legal/refunds' }
];

/** Where to back the work and where to talk about it. Rendered by the footer
 *  only — the header stays at four primary items plus the utility cluster.
 *  Discord joins the list the moment DISCORD_INVITE is non-empty; until then
 *  the site does not advertise a door that is not open. */
export const community: NavItem[] = [
	{ label: 'Patreon', href: 'https://www.patreon.com/cw/Quadstronaut', external: true },
	...(DISCORD_INVITE ? [{ label: 'Discord', href: DISCORD_INVITE, external: true }] : [])
];
