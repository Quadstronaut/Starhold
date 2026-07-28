import { appendFile } from 'node:fs/promises';
import { env } from '$env/dynamic/private';

/*
 * Signup capture. This box is public and abusable, so nothing here trusts its
 * input and nothing here holds a credential that could invite a Plex user.
 * The seedbox pulls signups.jsonl and does the actual provisioning.
 */

export interface Signup {
	email: string;
	kind: 'member' | 'demo';
	/** Only present on the demo path — the one title they asked for. */
	title?: string;
	at: string;
}

/** Deliberately permissive: reject obvious junk, never argue with a real address. */
export function validEmail(raw: string): boolean {
	const e = raw.trim();
	if (e.length < 6 || e.length > 254) return false;
	if (/\s/.test(e)) return false;
	return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(e);
}

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

/** Fixed-window limiter, per IP. In-memory is fine for a single container. */
export function rateLimit(ip: string, now = Date.now()): boolean {
	const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
	if (recent.length >= MAX_PER_WINDOW) {
		hits.set(ip, recent);
		return false;
	}
	recent.push(now);
	hits.set(ip, recent);
	return true;
}

export function signupsPath(): string {
	return env.SIGNUPS_PATH || '/data/signups.jsonl';
}

export async function recordSignup(s: Signup): Promise<void> {
	await appendFile(signupsPath(), JSON.stringify(s) + '\n', 'utf8');
}

/**
 * Ping the operator. Never throws: a dead webhook must not cost a signup that
 * has already been written to disk.
 */
export async function notify(s: Signup): Promise<void> {
	const url = env.DISCORD_WEBHOOK_URL;
	if (!url) return;

	const what =
		s.kind === 'demo' ? `**demo** request — one title: ${s.title}` : '**seat claim**';

	try {
		await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ content: `QFlix ${what}\n\`${s.email}\`` })
		});
	} catch {
		/* already on disk — the pull job will find it */
	}
}
