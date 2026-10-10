// starhold.app live chips (spec §4.4). Reads /_status on this origin: the dedi
// Caddy proxies that one path to Gatus's public list, newest result only.
// Rules: "Up" only when the latest result passed AND is fresh; anything missing,
// failed to load or stale reads "Unknown", never green. No storage, no cookies.

// Tile → Gatus key. QNix is "Coming soon" and has no chip, so it is not here.
const KEYS = {
	shushgame: 'products_shushgame-com',
	umbermark: 'products_umbermark-starhold-app',
	store: 'web_starhold-dev',
	docs: 'web_starhold-fyi',
	status: 'web_status-starhold-fyi'
};

const OK_DELAY = 60e3;
const BACKOFF = [60e3, 120e3, 300e3];
const TIMEOUT = 10e3;
const MIN = 60e3;

let failures = 0;
let timer = 0;

const hhmm = (ts) => new Date(ts).toISOString().slice(11, 16) + ' UTC';

// Freshness (spec §3.4): fresh if within 3 × the median gap between results,
// the gap clamped to [3, 15] min. With fewer than 2 results there is no gap to
// measure (always the case here: /_status carries one result per endpoint), so
// the window is a flat 15 min = 3 × the slowest Gatus interval (300 s). Using
// 3 × the 15-min clamp instead would let a chip read "Up" for 45 min after the
// last check, which breaks the page's own "never Up without a recent check".
const SINGLE_WINDOW = 15 * MIN;
function fresh(results, now) {
	const last = results[results.length - 1];
	const times = results.map((r) => Date.parse(r.timestamp)).filter(Number.isFinite);
	let window = SINGLE_WINDOW;
	if (times.length >= 2) {
		const d = times.slice(1).map((t, i) => t - times[i]).sort((a, b) => a - b);
		window = 3 * Math.min(15 * MIN, Math.max(3 * MIN, d[Math.floor(d.length / 2)]));
	}
	const t = Date.parse(last.timestamp);
	return Number.isFinite(t) && now - t <= window;
}

function paint(tile, state, text, checked) {
	const chip = document.querySelector(`[data-chip="${tile}"]`);
	const when = document.querySelector(`[data-checked="${tile}"]`);
	if (!chip) return;
	if (chip.dataset.state !== state || chip.textContent !== text) {
		chip.dataset.state = state;
		chip.textContent = text;
	}
	if (when) when.textContent = checked ? `checked ${checked}` : '';
}

function render(list) {
	const now = Date.now();
	const byKey = new Map(Array.isArray(list) ? list.map((e) => [e && e.key, e]) : []);
	for (const [tile, key] of Object.entries(KEYS)) {
		const results = byKey.get(key)?.results;
		const last = Array.isArray(results) ? results[results.length - 1] : null;
		if (!last) {
			paint(tile, 'unknown', 'Unknown', '');
			continue;
		}
		const at = Date.parse(last.timestamp);
		const checked = Number.isFinite(at) ? hhmm(at) : '';
		if (!fresh(results, now)) paint(tile, 'stale', checked ? `Unknown (last check ${checked})` : 'Unknown', '');
		else if (last.success === true) paint(tile, 'ok', 'Up', checked);
		else paint(tile, 'down', 'Down', checked);
	}
}

const allUnknown = () => Object.keys(KEYS).forEach((t) => paint(t, 'unknown', 'Unknown', ''));

async function poll() {
	clearTimeout(timer);
	const ctl = new AbortController();
	const cut = setTimeout(() => ctl.abort(), TIMEOUT);
	try {
		const res = await fetch('/_status', { signal: ctl.signal, cache: 'no-store', credentials: 'omit' });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const data = await res.json();
		if (!Array.isArray(data)) throw new Error('bad payload');
		render(data);
		failures = 0;
	} catch {
		allUnknown();
		failures++;
	} finally {
		clearTimeout(cut);
	}
	schedule();
}

function schedule() {
	clearTimeout(timer);
	if (document.visibilityState !== 'visible') return; // resumes on visibilitychange
	const delay = failures ? BACKOFF[Math.min(failures, BACKOFF.length) - 1] : OK_DELAY;
	timer = setTimeout(poll, delay);
}

document.addEventListener('visibilitychange', () => {
	if (document.visibilityState === 'visible') poll();
	else clearTimeout(timer);
});

// JS is on: replace the no-JS line with a pending chip, then load.
Object.keys(KEYS).forEach((t) => paint(t, 'pending', 'Checking…', ''));
poll();
