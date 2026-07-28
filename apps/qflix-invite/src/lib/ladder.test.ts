import { describe, it, expect } from 'vitest';
import { buildLadder } from './ladder';
import { tiers } from './seats';

describe('buildLadder', () => {
	it('always marks tier 1 achieved, even at zero paying members', () => {
		const rows = buildLadder(tiers, 0);
		expect(rows[0].state).toBe('achieved');
	});

	it('carries a non-empty reason on the pre-achieved tier', () => {
		// The endowed-progress effect requires a stated reason for the head
		// start. Rendering tier 1 green without one buys nothing.
		const rows = buildLadder(tiers, 0);
		expect(rows[0].reason).toBeTruthy();
		expect(rows[0].reason!.length).toBeGreaterThan(10);
	});

	it('marks tier 2 as next at one paying member, exactly one away', () => {
		const rows = buildLadder(tiers, 1);
		expect(rows[1].state).toBe('next');
		expect(rows[1].membersAway).toBe(1);
	});

	it('leaves only one tier in the next state', () => {
		const rows = buildLadder(tiers, 1);
		expect(rows.filter((r) => r.state === 'next')).toHaveLength(1);
	});

	it('locks tiers beyond the next one', () => {
		const rows = buildLadder(tiers, 1);
		expect(rows[2].state).toBe('locked');
		expect(rows[4].state).toBe('locked');
	});

	it('achieves everything at five paying members', () => {
		const rows = buildLadder(tiers, 5);
		expect(rows.every((r) => r.state === 'achieved')).toBe(true);
	});

	it('never reports a negative membersAway', () => {
		const rows = buildLadder(tiers, 9);
		expect(rows.every((r) => r.membersAway >= 0)).toBe(true);
	});

	it('preserves tier order', () => {
		const rows = buildLadder(tiers, 3);
		expect(rows.map((r) => r.id)).toEqual([1, 2, 3, 4, 5]);
	});
});
