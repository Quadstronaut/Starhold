// One availability line per service (STAR-142 pass 1, B1).
// Mirror of docs/shared/availability.json (vendored by the docs and Hangar pages);
// src/lib/availability.test.ts fails if the two drift apart.
import { pick } from './launch';
import { STARBOT_AVAILABILITY } from './starbot';

export const CHECKOUT_NOTICE = pick(
	'Checkout is paused; nothing is for sale today. These rules apply when it reopens.',
	'Paid plans are on sale. These rules apply to every purchase.'
);
export const OPEN_MEANS = pick(
	'Open means you can use it now, during testing; it is still under development.',
	'Open means you can use it now. Sign in with a Starhold Account; free tiers are available and paid plans are on sale.'
);
/** The Suite is a plan, not a product: its line lives beside the product lines, not in them.
 * Mirror of the "suite" key in docs/shared/availability.json. */
export const SUITE_LINE = "Starhold Suite: every tool's middle plan for $49 a month";

/** Availability line per product id (same ids as labels.ts). */
export const AVAILABILITY: Record<string, string> = pick(
	{
		umbermark: 'Free scans open; purchases paused',
		zenithmark: 'Open',
		render: 'Free tier open; sign-in and checkout closed',
		status: 'Public pages open; sign-in closed',
		shushgame: 'Open',
		echo: 'Open: free, no account',
		starbot: STARBOT_AVAILABILITY,
		dysonsphere: 'Interest form only'
	},
	{
		umbermark: 'Open: free scans; report $5 one-off; Solo $5, Pro $19, Agency $49 a month',
		zenithmark: 'Open: free scorecard; monitoring $5 or $19 a month',
		render: 'Open: free tier; Hobby $5, Pro $19, Scale $49 a month',
		status: 'Open: free tier; Private $5, MSP $19 a month',
		shushgame: 'Open',
		echo: 'Open: free, no account',
		starbot: STARBOT_AVAILABILITY,
		dysonsphere: 'Interest form only'
	}
);

export function availabilityFor(id: string): string {
	const a = AVAILABILITY[id];
	if (!a) throw new Error(`no availability line for product ${id}`);
	return a;
}
