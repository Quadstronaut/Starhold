// One availability line per service (STAR-142 pass 1, B1).
// Mirror of docs/shared/availability.json (vendored by the docs and Hangar pages);
// src/lib/availability.test.ts fails if the two drift apart.
export const CHECKOUT_NOTICE =
	'Checkout is paused; nothing is for sale today. These rules apply when it reopens.';
export const OPEN_MEANS = 'Open means you can use it now, during testing; it is still under development.';

/** Availability line per product id (same ids as labels.ts). */
export const AVAILABILITY: Record<string, string> = {
	umbermark: 'Free scans open; purchases paused',
	zenithmark: 'Open',
	render: 'Free tier open; sign-in and checkout closed',
	status: 'Public pages open; sign-in closed',
	shushgame: 'Open',
	starbot: 'In development',
	qnix: 'Interest form only'
};

export function availabilityFor(id: string): string {
	const a = AVAILABILITY[id];
	if (!a) throw new Error(`no availability line for product ${id}`);
	return a;
}
