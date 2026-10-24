import type { Load } from '@sveltejs/kit';
import { invite } from '$lib/content/copy';

// /invite?service=<id> preselects the service. Read on the server too so the
// right option ships in the first HTML response. An unknown id is ignored.
export const load: Load = ({ url }) => {
	const s = url.searchParams.get('service');
	return { service: invite.services.some((x) => x.id === s) ? (s as string) : '' };
};
