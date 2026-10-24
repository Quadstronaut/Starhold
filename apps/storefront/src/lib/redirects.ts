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

// Moved pages that have a real new home (ledger Q34/Q50): old QNix URLs -> /qnix, the old Shush page -> /shush.
export const MOVED_PATHS: Readonly<Record<string, string>> = {
	'/services/qnix': '/qnix',
	'/products/qnix': '/qnix',
	// Shush moved from /products/shushgame to /shush (STAR-145).
	'/products/shushgame': '/shush'
};

const REMOVED = new Set(REMOVED_PATHS);

/** Where a removed or moved path now lives, or null if the path was not touched. */
export function redirectFor(pathname: string): string | null {
	const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
	if (p in MOVED_PATHS) return MOVED_PATHS[p];
	return REMOVED.has(p) ? '/' : null;
}
