// QNix "Notify me when QNix opens" (STAR-145, ledger Q48/Q66).
// Email only, encrypted to CONTACT_AGE_RECIPIENT, stored in qnix_interest.
// No Discord relay, by ruling: the address never leaves our server.
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { allow } from '$lib/server/rate-limit';
import { getDb, saveQnixInterest, DEFAULT_DB_PATH } from '$lib/server/contact-store';
import type { RequestHandler } from './$types';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'request body must be JSON');
	}
	const { email = '', website = '' } = body ?? {};
	if (website) return json({ ok: true }); // honeypot
	if (!allow(getClientAddress())) throw error(429, 'too many requests — try again in a few minutes');
	if (!env.CONTACT_AGE_RECIPIENT) throw error(503, 'Contact is temporarily unavailable');
	if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email))
		throw error(400, 'a valid email is required');
	try {
		await saveQnixInterest(getDb(env.CONTACT_DB_PATH || DEFAULT_DB_PATH), env.CONTACT_AGE_RECIPIENT, email);
	} catch (e) {
		console.error('qnix: storing address failed:', e instanceof Error ? e.name : 'error');
		throw error(503, 'Contact is temporarily unavailable');
	}
	return json({ ok: true });
};
