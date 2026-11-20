import { heroPool, pickHero } from '#lib/heroes.js';

// STAR-166 hero pool, STAR-299 on every page that has a hero. Pick on the server only:
// a universal load would run again in the browser during hydration and pick a different
// entry than the HTML the <picture> already started loading. Client-side navigation asks
// the server again (__data.json), so every visit re-rolls. ?hero=<id> forces one entry.
export function loadHero(url: URL): { hero: string } {
	return { hero: pickHero(heroPool, url.searchParams.get('hero')).id };
}
