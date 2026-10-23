import type { Load } from '@sveltejs/kit';
import { contact } from '$lib/content/copy';

const INTENTS = ['quote', 'hosting', 'invite'] as const;
type Intent = (typeof INTENTS)[number] | 'contact';

// /contact?intent=quote preselects the quote flow. Read on the server as well as
// the client so the right form ships in the first HTML response — the hero CTA
// must work with JavaScript switched off.
// intent=invite (STAR-134) is the invitation request; &product=<id> preselects
// the service, and an id that is not in the list is ignored rather than trusted.
export const load: Load = ({ url }) => {
	const i = url.searchParams.get('intent');
	const intent: Intent = (INTENTS as readonly string[]).includes(i ?? '') ? (i as Intent) : 'contact';
	const p = url.searchParams.get('product');
	const product = contact.products.some((x) => x.id === p) ? (p as string) : '';
	return { intent, product };
};
