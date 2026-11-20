import { error } from '@sveltejs/kit';
import { audienceFor } from '#lib/content/catalog.js';
import { loadHero } from '#lib/server/hero-load.js';
import type { PageServerLoad } from './$types';

// STAR-299: one page per entry in the audience list. An id that is not in the list is a 404,
// so a new audience gets its page by being added to the list and nothing else.
export const load: PageServerLoad = ({ params, url }) => {
	if (!audienceFor(params.audience)) error(404, 'Not found');
	return { audience: params.audience, ...loadHero(url) };
};
