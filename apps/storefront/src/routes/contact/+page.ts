import type { Load } from '@sveltejs/kit';

// /contact?intent=quote preselects the quote flow. Read on the server as well as
// the client so the right form ships in the first HTML response — the hero CTA
// must work with JavaScript switched off.
export const load: Load = ({ url }) => ({
	intent: (() => {
		const i = url.searchParams.get('intent');
		return i === 'quote' || i === 'hosting' ? i : ('contact' as const);
	})()
});
