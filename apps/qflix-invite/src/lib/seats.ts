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
	 * Optional note shown under an achieved tier, saying what earned it.
	 *
	 * Naming the cause is what makes the row read as momentum rather than
	 * decoration — a reader who cannot tell why a rung went green has no
	 * reason to believe the next one will.
	 */
	achievedNote?: string;
}

/** Paying members today. Beta seat is tracked separately and is NOT counted. */
export const payingMembers = 1;

/**
 * Automated tests in the QFlix repo, from `grep -c 'def test_' tests/`.
 *
 * Hand-maintained rather than collected: the test suite lives in the QFlix
 * repo and never lands on the seedbox, so the hourly stats job has nothing to
 * count. Safe to let drift — tests get added far more often than deleted, so a
 * stale figure understates rather than overstates. Re-run the grep and bump it
 * when you think of it.
 */
export const testsPassing = 1299;

/**
 * Apps in the QFlix stack, from `manifest/apps.yaml`.
 *
 * The manifest is the single source of truth and never lands on the seedbox,
 * so this is hand-maintained too. Counts every class — the UCC-installed apps
 * plus the systemd services, cron jobs and libraries. `~/.apps` on the box
 * shows only 33 because it holds just the UCC subset.
 */
export const appsInStack = 35;

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
		detail: 'Two sources, not one — torrents and Usenet. When one comes up empty, the other usually has it.',
		achievedNote: 'Unlocked when the first member joined.'
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
