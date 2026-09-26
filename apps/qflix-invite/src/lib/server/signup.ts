import { appendFile, stat } from 'node:fs/promises';
import { env } from '$env/dynamic/private';

/*
 * Signup capture. This box is public and abusable, so nothing here trusts its
 * input and nothing here holds a credential that could invite a Plex user.
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
	// eslint-disable-next-line no-control-regex
	if (/[\u0000-\u001f\u007f]/.test(e)) return false;
	return /^[^@]+@[^@.]+(\.[^@.]+)+$/.test(e);
}

const WINDOW_MS = 60_000;

/*
 * Generous on purpose. ADDRESS_HEADER is set, so this buckets by real client
 * IP rather than by Caddy — but a rink's wifi and carrier CGNAT still collapse
 * a whole room onto one address. A tight limit would turn away the sixth
 * person in the queue, which costs far more than the abuse it prevents. The
 * disk cap in recordSignup is the control that actually bounds damage.
 */
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();

/** Fixed-window limiter, per IP. In-memory is fine for a single container. */
export function rateLimit(ip: string, now = Date.now()): boolean {
	// Keys are never otherwise removed, so the Map would grow for the lifetime
	// of the process. Sweep expired buckets once it gets large.
	if (hits.size > 10_000) {
		for (const [k, v] of hits) {
			if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
		}
	}

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

/** Longest a submitted title may be once stored. */
export const MAX_TITLE = 120;

/**
 * Hard ceiling on the signups file.
 *
 * Anonymous input appends here, and this box's root volume is shared with
 * every other site Caddy fronts. Without a cap, a handful of rotating IPs
 * could fill the disk and take the whole host down — the signup form would be
 * the cheapest lever on the machine. Refusing to write is the right failure.
 */
export const MAX_SIGNUPS_BYTES = 5 * 1024 * 1024;

/**
 * Strip control characters and clamp. Applied to any free text we store.
 *
 * The newline strip earns its keep twice: it keeps signups.jsonl to one record
 * per line, and it stops a submitted title from composing multi-line Discord
 * messages that impersonate other alerts arriving on the same webhook.
 */
export function cleanText(raw: string, max: number): string {
	// eslint-disable-next-line no-control-regex
	return raw.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export async function recordSignup(s: Signup): Promise<void> {
	const line = JSON.stringify(s) + '\n';
	const { size } = await stat(signupsPath()).catch(() => ({ size: 0 }));
	if (size + line.length > MAX_SIGNUPS_BYTES) {
		throw new Error('signups file at cap');
	}
	await appendFile(signupsPath(), line, 'utf8');
}

/**
 * Ping the operator. Never throws: a dead webhook must not cost a signup that
 * has already been written to disk.
 */
export async function notify(s: Signup): Promise<void> {
	const url = env.DISCORD_WEBHOOK_URL;
	if (!url) return;

	// Backticks would break out of the code span below; mentions are disarmed
	// at the API level rather than by filtering, so "@everyone" in a title is
	// delivered as text and pings nobody.
	const safeTitle = (s.title ?? '').replace(/`/g, "'");
	const what = s.kind === 'demo' ? `**demo** request — one title: ${safeTitle}` : '**seat claim**';

	try {
		await fetch(url, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				content: `QFlix ${what}\n\`${s.email}\``,
				allowed_mentions: { parse: [] }
			}),
			// Without this, undici waits 5 minutes for headers. A webhook that
			// accepts the connection and then stalls would leave the visitor
			// staring at a disabled "Sending…" button that never resolves.
			signal: AbortSignal.timeout(4000)
		});
	} catch {
		/* already on disk — nothing here is worth failing the request for */
	}
}
