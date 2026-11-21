// In-memory sliding-window limiter. Single container, modest traffic —
// a Map is plenty; revisit if the sidecar ever scales horizontally.
//
// Privacy (STAR-305): "Spam-control IP addresses are held in memory for 10
// minutes and are lost on restart." So no address may outlive its window:
// every check sweeps the whole map, and a timer set for the next expiry
// sweeps it again when no one posts. The map only ever holds addresses
// seen in the last WINDOW_MS, so it cannot grow without bound.
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_PER_WINDOW = 5;

const hits = new Map<string, number[]>();
let timer: ReturnType<typeof setTimeout> | undefined;

// Drop every timestamp older than the window, and every address left with none.
function sweep(now: number): void {
	for (const [ip, times] of hits) {
		const recent = times.filter((t) => now - t < WINDOW_MS);
		if (recent.length === 0) hits.delete(ip);
		else if (recent.length !== times.length) hits.set(ip, recent);
	}
}

// One timer for the earliest expiry in the map; re-armed after each sweep.
// unref() so the timer never keeps the process alive on shutdown.
function schedule(now: number): void {
	if (timer !== undefined) clearTimeout(timer);
	timer = undefined;
	let oldest = Infinity;
	for (const times of hits.values()) if (times[0] < oldest) oldest = times[0];
	if (oldest === Infinity) return;
	const delay = Math.max(0, oldest + WINDOW_MS - now);
	timer = setTimeout(() => {
		const t = Date.now();
		sweep(t);
		schedule(t);
	}, delay);
	(timer as { unref?: () => void }).unref?.();
}

export function allow(ip: string, now = Date.now()): boolean {
	sweep(now);
	const recent = hits.get(ip) ?? [];
	if (recent.length >= MAX_PER_WINDOW) {
		schedule(now);
		return false;
	}
	recent.push(now);
	hits.set(ip, recent);
	schedule(now);
	return true;
}

// test/ops hook — current number of tracked IPs
export function trackedIps(): number {
	return hits.size;
}

// test hook — whether an address is held in memory right now
export function isTracked(ip: string): boolean {
	return hits.has(ip);
}
