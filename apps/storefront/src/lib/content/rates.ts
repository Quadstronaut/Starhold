// Single source of truth for published prices. Pages import these; no price literals in templates.
export const RATES = {
	personalHourlyUsd: 49,
	businessHourlyUsd: 149,
	managedOpsServerMonthlyUsd: 99
} as const;

/** Whole-dollar display string: usd(149) -> "$149". */
export function usd(n: number): string {
	return `$${n}`;
}
