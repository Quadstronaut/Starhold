/*
 * Consumes stats.json, which the seedbox rsyncs to this box hourly.
 *
 * Everything here is defensive on purpose: the page must render even when the
 * file is missing, truncated mid-rsync, or hours stale. A recruiting page that
 * 500s because a cron job died is worse than one showing yesterday's numbers.
 */

export interface LibraryCount {
	name: string;
	items: number;
}

/*
 * Only `generatedAt` is required. Every metric is optional because the
 * collectors have different reliability: Plex and the disk quota are read
 * directly, while request totals and monitor counts depend on services that
 * may be unreachable. A tile with no data is simply not rendered — the page
 * never shows a zero it did not measure, and never a figure it cannot source.
 */
export interface Stats {
	/** ISO 8601, UTC. Written by qflix-stats.py at emit time. */
	generatedAt: string;
	libraries: LibraryCount[];
	films?: number;
	series?: number;
	episodes?: number;
	diskBytes?: number;
	requestsFulfilled?: number;
	medianFillMinutes?: number;
	monitorsUp?: number;
	monitorsTotal?: number;
	canaries?: number;
	tests?: number;
	apps?: number;
}

/** Beyond this the page stops saying "just now" and shows a plain timestamp. */
export const STALE_AFTER_MINUTES = 360;

function num(v: unknown): number | null {
	return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

/**
 * Parse the raw JSON payload. Returns null on anything malformed rather than
 * throwing — callers render an absent proof wall instead of an error page.
 */
export function parseStats(raw: unknown): Stats | null {
	if (typeof raw !== 'object' || raw === null) return null;
	const r = raw as Record<string, unknown>;

	const generatedAt = r.generated_at;
	if (typeof generatedAt !== 'string' || Number.isNaN(Date.parse(generatedAt))) return null;

	const mon = (r.monitors ?? {}) as Record<string, unknown>;
	const opt = (v: number | null) => (v === null ? undefined : v);

	const libsRaw = Array.isArray(r.libraries) ? r.libraries : [];
	const libraries: LibraryCount[] = [];
	for (const l of libsRaw) {
		if (typeof l !== 'object' || l === null) continue;
		const e = l as Record<string, unknown>;
		const items = num(e.items);
		if (typeof e.name === 'string' && items !== null) libraries.push({ name: e.name, items });
	}

	return {
		generatedAt,
		libraries,
		films: opt(num(r.films)),
		series: opt(num(r.series)),
		episodes: opt(num(r.episodes)),
		diskBytes: opt(num(r.disk_bytes)),
		requestsFulfilled: opt(num(r.requests_fulfilled)),
		medianFillMinutes: opt(num(r.median_fill_minutes)),
		monitorsUp: opt(num(mon.up)),
		monitorsTotal: opt(num(mon.total)),
		canaries: opt(num(r.canaries)),
		tests: opt(num(r.tests)),
		apps: opt(num(r.apps))
	};
}

export interface Freshness {
	minutesAgo: number;
	stale: boolean;
	/** Ready to render. Never a lie — stale data says so. */
	label: string;
}

/**
 * Describe how old the stats are.
 *
 * Under six hours this reads as a relative nudge ("updated 23m ago") which
 * signals a live system. Past six hours it switches to an absolute timestamp:
 * hiding staleness behind a vague relative string would be the one dishonest
 * thing on the page.
 */
export function freshness(generatedAt: string, now: Date = new Date()): Freshness {
	const then = Date.parse(generatedAt);
	if (Number.isNaN(then)) return { minutesAgo: 0, stale: true, label: 'timestamp unavailable' };

	const minutesAgo = Math.max(0, Math.floor((now.getTime() - then) / 60_000));
	const stale = minutesAgo >= STALE_AFTER_MINUTES;

	if (stale) {
		const d = new Date(then);
		const date = d.toISOString().slice(0, 10);
		const time = d.toISOString().slice(11, 16);
		return { minutesAgo, stale, label: `last updated ${date} ${time} UTC` };
	}

	if (minutesAgo < 1) return { minutesAgo, stale, label: 'updated just now' };
	if (minutesAgo < 60) return { minutesAgo, stale, label: `updated ${minutesAgo}m ago` };

	const hours = Math.floor(minutesAgo / 60);
	return { minutesAgo, stale, label: `updated ${hours}h ago` };
}

/** Bytes to a short human string. Binary units — this is disk, not marketing. */
export function formatSize(bytes: number): string {
	const TB = 1024 ** 4;
	const GB = 1024 ** 3;
	if (bytes >= TB) return `${(bytes / TB).toFixed(1)} TB`;
	return `${Math.round(bytes / GB)} GB`;
}

/** Thousands separators. Exact figures only — never round for effect. */
export function formatCount(n: number): string {
	return n.toLocaleString('en-US');
}

/** "42m" under an hour, else "1.4h". Used for median request fill time. */
export function formatDuration(minutes: number): string {
	if (minutes < 60) return `${Math.round(minutes)}m`;
	return `${(minutes / 60).toFixed(1)}h`;
}
