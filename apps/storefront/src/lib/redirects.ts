// Permanent redirects for every page removed in STAR-145 (ledger Q9/Q14/Q25/Q38).
// Single source of truth; hooks.server.ts consumes it. All go to the home page.
export const REMOVED_PATHS: readonly string[] = [
	'/cart',
	'/cart/success',
	'/products/custom-bots',
	'/services',
	'/services/hosting',
	'/services/managed-ops',
	'/services/automation',
	'/services/fullstack',
	'/capabilities',
	'/work',
	'/rates',
	'/operator',
	'/about',
	'/legal/services',
	'/api/checkout',
	'/api/handoff',
	'/api/stripe/webhook'
];

const REMOVED = new Set(REMOVED_PATHS);

/** Where a removed path now lives, or null if the path was not removed. */
export function redirectFor(pathname: string): string | null {
	const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
	return REMOVED.has(p) ? '/' : null;
}
