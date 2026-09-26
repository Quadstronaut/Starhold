import { describe, it, expect } from 'vitest';
import { quarterOf, nextQuarter } from './availability';

// Dates are constructed in UTC so the suite gives the same answer regardless of
// where it runs — a machine in UTC-8 must not decide it is still last quarter.
const utc = (iso: string) => new Date(iso + 'T12:00:00Z');

describe('quarterOf', () => {
	it.each([
		['2026-01-01', 1],
		['2026-03-31', 1],
		['2026-04-01', 2],
		['2026-06-30', 2],
		['2026-07-01', 3],
		['2026-09-30', 3],
		['2026-10-01', 4],
		['2026-12-31', 4]
	])('%s falls in Q%i', (iso, expected) => {
		expect(quarterOf(utc(iso)).quarter).toBe(expected);
	});

	it('labels the quarter with its year', () => {
		expect(quarterOf(utc('2026-08-24')).label).toBe('Q3 2026');
	});
});

describe('nextQuarter', () => {
	it('advances within the same year', () => {
		expect(nextQuarter(utc('2026-08-24'))).toEqual({ quarter: 4, year: 2026, label: 'Q4 2026' });
	});

	// The rollover is the case that would otherwise ship "Q5" or a stale year.
	it('rolls Q4 over into Q1 of the following year', () => {
		expect(nextQuarter(utc('2026-11-15'))).toEqual({ quarter: 1, year: 2027, label: 'Q1 2027' });
	});

	it('rolls over on the last instant of the year', () => {
		expect(nextQuarter(utc('2026-12-31'))).toEqual({ quarter: 1, year: 2027, label: 'Q1 2027' });
	});

	it('never produces a quarter outside 1–4, walking two years of months', () => {
		for (let m = 0; m < 24; m++) {
			const d = new Date(Date.UTC(2026, m, 15));
			const q = nextQuarter(d);
			expect(q.quarter).toBeGreaterThanOrEqual(1);
			expect(q.quarter).toBeLessThanOrEqual(4);
		}
	});

	it('is always one quarter ahead of the current one', () => {
		for (let m = 0; m < 12; m++) {
			const d = new Date(Date.UTC(2026, m, 10));
			const now = quarterOf(d);
			const next = nextQuarter(d);
			const distance = (next.year - now.year) * 4 + (next.quarter - now.quarter);
			expect(distance).toBe(1);
		}
	});
});
