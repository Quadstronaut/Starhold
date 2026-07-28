/*
 * OPERATOR-EDITED CONFIG. Edit these numbers by hand.
 *
 * `payingMembers` is deliberately NOT derived from Plex shares. Deriving it
 * would silently count guest accounts, the beta seat, and every one-off demo
 * library as a "member" — the page would inflate its own social proof and the
 * operator would never notice. A typed number cannot drift.
 */

export type TierId = 1 | 2 | 3 | 4 | 5;

export interface Tier {
	id: TierId;
	/** Paying-member count at which this tier unlocks. Tier N unlocks at N. */
	unlocksAt: number;
	title: string;
	detail: string;
	/**
	 * Why this tier was already achieved before anyone joined.
	 *
	 * Load-bearing, not decorative: the endowed-progress effect (Nunes & Drèze
	 * 2006) only occurs when a REASON for the head start is displayed. Cards
	 * with a free stamp and no explanation performed no better than cards
	 * without one. Never render a pre-achieved tier without this string.
	 */
	preAchievedReason?: string;
}

/** Paying members today. Beta seat is tracked separately and is NOT counted. */
export const payingMembers = 1;

/**
 * Shown above the ladder. Deliberately unnamed — this page sits on a public,
 * guessable URL and naming a real member exposes them without their consent.
 */
export const betaSeat = 'filled';

export const tiers: Tier[] = [
	{
		id: 1,
		unlocksAt: 1,
		title: 'Torrents + Usenet',
		detail: 'Two sources, not one. If one drought hits, the other still delivers.',
		preAchievedReason: 'Landed before anyone joined. You start one rung up.'
	},
	{
		id: 2,
		unlocksAt: 2,
		title: 'Maximum storage space',
		detail: 'The box gets bigger. Nothing gets squeezed out early again.'
	},
	{
		id: 3,
		unlocksAt: 3,
		title: 'Dedicated .com + Android app',
		detail:
			'Sideloaded phone to phone. No app store, no metrics, no tracking. Just a push when your request finishes downloading.'
	},
	{
		id: 4,
		unlocksAt: 4,
		title: 'Longer retention + 4K',
		detail: 'Things stay around longer, and they arrive sharper.'
	},
	{
		id: 5,
		unlocksAt: 5,
		title: 'Bring a mooch',
		detail: 'A guest account for your tag-along. Plex only, no requests.'
	}
];
