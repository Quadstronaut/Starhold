import type { Tier, TierId } from './seats';

export type TierState = 'achieved' | 'next' | 'locked';

export interface LadderRow {
	id: TierId;
	title: string;
	detail: string;
	state: TierState;
	/** How many more paying members before this tier unlocks. Never negative. */
	membersAway: number;
	/** Present only on a pre-achieved tier. Must be rendered when present. */
	reason?: string;
}

/**
 * Pure: map the operator's tier config plus the current paying-member count
 * onto display rows.
 *
 * Tier 1 is achieved unconditionally — it landed before the first member did.
 * Every other tier N unlocks at N paying members. Exactly one unachieved tier
 * is marked `next`, because the goal-gradient effect works on the rung you can
 * see yourself reaching, not on a wall of locked ones.
 */
export function buildLadder(tiers: Tier[], payingMembers: number): LadderRow[] {
	let nextAssigned = false;

	return tiers.map((t) => {
		const achieved = t.id === 1 || payingMembers >= t.unlocksAt;

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
			reason: t.preAchievedReason
		};
	});
}
