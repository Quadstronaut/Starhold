import { redirect, type Handle } from '@sveltejs/kit';
import { redirectFor } from '$lib/redirects';

// Pages removed in STAR-145 answer with a permanent 301 to the home page, so old
// links and search results do not 404. The map lives in src/lib/redirects.ts.
export const handle: Handle = async ({ event, resolve }) => {
	const to = redirectFor(event.url.pathname);
	if (to) redirect(301, to);
	return resolve(event);
};
