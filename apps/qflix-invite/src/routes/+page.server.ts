import { readFile } from 'node:fs/promises';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { parseStats } from '$lib/stats';
import { validEmail, rateLimit, recordSignup, notify, type Signup } from '$lib/server/signup';
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
		const form = await request.formData();

		// Honeypot. Bots fill every field they find; humans never see this one.
		// Report success so the bot stops retrying.
		if (String(form.get('website') ?? '').trim() !== '') {
			return { ok: true };
		}

		if (!rateLimit(getClientAddress())) {
			return fail(429, { error: 'Too many tries. Give it a minute.' });
		}

		const email = String(form.get('email') ?? '').trim();
		if (!validEmail(email)) {
			return fail(400, { error: "That doesn't look like an email address." });
		}

		const title = String(form.get('title') ?? '').trim();
		const kind: Signup['kind'] = title ? 'demo' : 'member';

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

		await notify(signup);
		return { ok: true, kind };
	}
};
