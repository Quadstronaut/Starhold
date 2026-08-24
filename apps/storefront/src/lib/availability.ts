// Availability line — "taking work for <the next quarter>".
//
// This is a hiring signal, and a stale one is worse than none: a page still
// advertising Q1 in September reads as abandoned. So the quarter is derived
// from the clock on every request (the home page is server-rendered and not
// prerendered) rather than typed into copy and forgotten.
//
// The function is pure and takes the date as an argument so it can be tested
// across the year-end rollover without faking the system clock.

export type Quarter = {
	/** 1–4 */
	quarter: number;
	year: number;
	/** e.g. "Q4 2026" */
	label: string;
};

/** The quarter `date` falls in. January–March is Q1. */
export function quarterOf(date: Date): Quarter {
	// getUTCMonth() is 0-indexed, so months 0–2 are Q1.
	const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
	const year = date.getUTCFullYear();
	return { quarter, year, label: `Q${quarter} ${year}` };
}

/** The quarter after the one `date` falls in, rolling Q4 over into Q1 of the next year. */
export function nextQuarter(date: Date): Quarter {
	const { quarter, year } = quarterOf(date);
	const rollsOver = quarter === 4;
	const q = rollsOver ? 1 : quarter + 1;
	const y = rollsOver ? year + 1 : year;
	return { quarter: q, year: y, label: `Q${q} ${y}` };
}
