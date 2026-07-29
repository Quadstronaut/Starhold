import { readFile } from 'node:fs/promises';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { parseStats } from '$lib/stats';
import {
	validEmail,
	rateLimit,
	recordSignup,
	notify,
	cleanText,
	MAX_TITLE,
	type Signup
} from '$lib/server/signup';
import type { Actions, PageServerLoad } from './$types';

const STATS_PATH = () => env.STATS_PATH || '/data/stats.json';

export const load: PageServerLoad = async () => {
	// Missing or malformed stats must not take the page down. The proof wall
	// simply doesn't render and everything else still converts.
	try {
		const raw = await readFile(STATS_PATH(), 'utf8');
		return { stats: parseStats(JSON.parse(raw)) };
	} catch {
		return { stats: null };
	}
};

export const actions: Actions = {
	default: async ({ request, getClientAddress }) => {
		// A malformed multipart body throws here; any scanner hitting the
		// endpoint would otherwise produce a 500.
		let form: FormData;
		try {
			form = await request.formData();
		} catch {
			return fail(400, { error: "That didn't come through. Try again." });
		}

		// getClientAddress() THROWS when ADDRESS_HEADER is configured (it is) but
		// the header is absent — true of any request that reaches the container
		// directly rather than through Caddy, including health checks.
		let ip = 'unknown';
		try {
			ip = getClientAddress();
		} catch {
			/* fall through on 'unknown' — one shared bucket is fine for these */
		}

		// Honeypot. Bots fill every field they find; humans never see this one.
		// Report success so the bot stops retrying — but log it, because a false
		// positive here silently swallows a real signup and we would otherwise
		// never know it happened.
		const trap = String(form.get('hp_ref_2') ?? '').trim();
		if (trap !== '') {
			console.warn('[honeypot] dropped', ip, String(form.get('email') ?? '').slice(0, 100));
			return { ok: true };
		}

		// Validate before spending limiter budget: a cold-handed typo should not
		// eat the allowance for everyone else behind the same wifi.
		const email = String(form.get('email') ?? '').trim();
		if (!validEmail(email)) {
			return fail(400, { error: "That doesn't look like an email address." });
		}

		if (!rateLimit(ip)) {
			return fail(429, { error: 'Too many tries. Give it a minute.' });
		}

		// Intent is carried explicitly, never inferred from whether the title
		// box happens to be filled. Inferring it meant someone who tapped "Send
		// me the test title" and missed the field got recorded as a $50 seat
		// claim — which resolves in the worst possible conversation.
		const title = cleanText(String(form.get('title') ?? ''), MAX_TITLE);
		const kind: Signup['kind'] = form.get('kind') === 'demo' ? 'demo' : 'member';
		if (kind === 'demo' && !title) {
			return fail(400, { error: 'Name one title to test with.' });
		}

		const signup: Signup = {
			email,
			kind,
			...(title ? { title } : {}),
			at: new Date().toISOString()
		};

		try {
			await recordSignup(signup);
		} catch {
			return fail(500, { error: "Couldn't save that. Text me instead." });
		}

		// Not awaited: the record is already durable, and a slow webhook must
		// never hold up the response the visitor is waiting on.
		void notify(signup);
		return { ok: true, kind };
	}
};
