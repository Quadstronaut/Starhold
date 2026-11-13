import { redirect } from '@sveltejs/kit';
import type { Load } from '@sveltejs/kit';
import { invite } from '#lib/content/copy.js';
import { LAUNCHED } from '#lib/launch.js';

// /invite?service=<id> preselects the service. Read on the server too so the
// right option ships in the first HTML response. An unknown id is ignored.
// Once LAUNCHED (lib/launch.ts) the invite flow is closed: every service is open,
// so /invite sends people to the service list. The page and form stay in the repo.
export const load: Load = ({ url }) => {
	if (LAUNCHED) redirect(307, '/#services');
	const s = url.searchParams.get('service');
	return { service: invite.services.some((x) => x.id === s) ? (s as string) : '' };
};
