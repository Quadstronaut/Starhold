import type { Tier, TierId } from './seats';

export type TierState = 'achieved' | 'next' | 'locked';

export interface LadderRow {
	id: TierId;
	title: string;
	detail: string;
	state: TierState;
	/** How many more paying members before this tier unlocks. Never negative. */
	membersAway: number;
	/** What earned this tier. Rendered only on an achieved row. */
	reason?: string;
}

/**
 * Pure: map the operator's tier config plus the current paying-member count
 * onto display rows.
 *
 * Tier N unlocks at N paying members — nothing is granted, every rung is
 * earned. Exactly one unachieved tier is marked `next`, because the
 * goal-gradient effect works on the rung a reader can see themselves
 * reaching, not on a wall of locked ones.
 */
export function buildLadder(tiers: Tier[], payingMembers: number): LadderRow[] {
	// seats.ts is hand-edited by the operator, so guard the edits they will
	// actually make. A duplicate id throws during hydration in production
	// while server-rendering fine — the page would look healthy to curl and be
	// dead in a real browser.
	if (!Number.isInteger(payingMembers) || payingMembers < 0) {
		throw new Error(`payingMembers must be a non-negative integer, got ${payingMembers}`);
	}
	if (new Set(tiers.map((t) => t.id)).size !== tiers.length) {
		throw new Error('duplicate tier id in seats.ts');
	}

	// Sort by threshold so a reordered array still marks the nearest rung next.
	const ordered = [...tiers].sort((a, b) => a.unlocksAt - b.unlocksAt);
	let nextAssigned = false;

	return ordered.map((t) => {
		const achieved = payingMembers >= t.unlocksAt;

		let state: TierState;
		if (achieved) {
			state = 'achieved';
		} else if (!nextAssigned) {
			state = 'next';
			nextAssigned = true;
		} else {
			state = 'locked';
		}

		return {
			id: t.id,
			title: t.title,
			detail: t.detail,
			state,
			membersAway: Math.max(0, t.unlocksAt - payingMembers),
			reason: t.achievedNote
		};
	});
}
