import { heroPool, pickHero } from '$lib/heroes';
import type { PageServerLoad } from './$types';

// STAR-166 hero pool: pick on the server only. A universal (+page.ts) load would run
// again in the browser during hydration and pick a different entry than the HTML the
// <picture> already started loading; a server load is serialised once and reused.
// Client-side navigation back to the home page asks the server again (__data.json),
// so every visit re-rolls. ?hero=<id> forces one entry.
export const load: PageServerLoad = ({ url }) => ({
	hero: pickHero(heroPool, url.searchParams.get('hero')).id
});