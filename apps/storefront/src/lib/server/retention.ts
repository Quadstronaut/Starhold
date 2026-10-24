// Retention rules for the contact inbox and QNix list (STAR-145, ledger Q23/Q47/Q66).
//   messages:      90 days after closed_at, and never more than 12 months from created_at
//   qnix_interest: 24 months from created_at (the one notice email deletes it sooner, later)
// Pure over (db, now) so tests can run it on a fake clock. Returns counts only.
import type { Db } from './contact-store';

export const CLOSED_RETENTION_DAYS = 90;
export const MESSAGE_MAX_MONTHS = 12;
export const QNIX_MAX_MONTHS = 24;

const DAY_MS = 86_400_000;

/** `now` minus N calendar months, as an ISO string (UTC; day clamps like Date does). */
export function monthsAgo(now: Date, months: number): string {
	const d = new Date(now.getTime());
	d.setUTCMonth(d.getUTCMonth() - months);
	return d.toISOString();
}

export type PurgeCounts = { messages: number; qnix: number };

export function purge(db: Db, now: Date = new Date()): PurgeCounts {
	const closedCutoff = new Date(now.getTime() - CLOSED_RETENTION_DAYS * DAY_MS).toISOString();
	const messages = db
		.prepare('DELETE FROM messages WHERE (closed_at IS NOT NULL AND closed_at <= ?) OR created_at <= ?')
		.run(closedCutoff, monthsAgo(now, MESSAGE_MAX_MONTHS)).changes;
	const qnix = db
		.prepare('DELETE FROM qnix_interest WHERE created_at <= ?')
		.run(monthsAgo(now, QNIX_MAX_MONTHS)).changes;
	return { messages, qnix };
}
