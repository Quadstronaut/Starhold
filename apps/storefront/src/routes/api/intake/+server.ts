// Contact / invite intake (STAR-145, ledger Q23/Q47/Q65).
// Flow: honeypot -> rate limit -> fail closed without CONTACT_AGE_RECIPIENT ->
// validate -> encrypt (age) -> SQLite -> notice-only Discord ping (id + product).
// Name, email and body are never logged and never sent to Discord.
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { allow } from '$lib/server/rate-limit';
import { postDiscord, noticeText } from '$lib/server/discord';
import { getDb, saveMessage, DEFAULT_DB_PATH } from '$lib/server/contact-store';
import { contact } from '$lib/content/copy';
import type { RequestHandler } from './$types';

// 'invite' is /contact?intent=invite: a request to be let into one of the
// invitation-only services. (QNix interest has its own endpoint: /api/qnix.)
const KINDS = ['contact', 'invite'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'request body must be JSON');
	}

	const { kind, name = '', email = '', message = '', product = '', website = '' } = body ?? {};
	// honeypot first — bot hits must not burn rate-limit slots that a real
	// user behind the same NAT would then be denied
	if (website) return json({ ok: true }); // pretend success, store nothing
	if (!allow(getClientAddress())) throw error(429, 'too many requests — try again in a few minutes');
	// fail closed: with no public key we must not store (or relay) plaintext
	if (!env.CONTACT_AGE_RECIPIENT) throw error(503, 'Contact is temporarily unavailable');
	if (typeof kind !== 'string' || !KINDS.includes(kind)) throw error(400, 'unknown intake kind');
	if (typeof email !== 'string' || !EMAIL_RE.test(email)) throw error(400, 'a valid email is required');
	// An invite request needs a service and an email; the use line is optional.
	if (kind === 'invite') {
		if (!contact.products.some((p) => p.id === product && p.id !== 'unsure'))
			throw error(400, 'choose a service');
		if (typeof message !== 'string' || message.length > 4000) throw error(400, 'message must be at most 4000 characters');
	} else if (typeof message !== 'string' || message.trim().length < 10 || message.length > 4000)
		throw error(400, 'message must be 10–4000 characters');

	// product must come from our own list; anything else is dropped, not trusted
	const picked = contact.products.find((p) => p.id === product);

	let id: number;
	try {
		id = await saveMessage(getDb(env.CONTACT_DB_PATH || DEFAULT_DB_PATH), env.CONTACT_AGE_RECIPIENT, {
			product: picked?.id ?? '',
			kind,
			name: String(name).slice(0, 100),
			email,
			message: message.trim()
		});
	} catch (e) {
		// message text deliberately omitted from the log line
		console.error('intake: storing message failed:', e instanceof Error ? e.name : 'error');
		throw error(503, 'Contact is temporarily unavailable');
	}

	// The message is safely stored; a Discord outage must not lose it or fail the form.
	if (env.DISCORD_WEBHOOK_INTAKE) {
		try {
			await postDiscord(env.DISCORD_WEBHOOK_INTAKE, noticeText(kind, id, picked?.label));
		} catch (e) {
			console.error('intake: discord notice failed:', e instanceof Error ? e.message : 'error');
		}
	}
	return json({ ok: true });
};
