import { nextQuarter } from '$lib/availability';

// Runs per request — the home page is server-rendered and not prerendered, so
// the availability quarter advances on its own and never needs a redeploy or a
// hand edit. See src/lib/availability.ts for why this is not baked into copy.
export const load = () => ({
	availableFrom: nextQuarter(new Date()).label
});
