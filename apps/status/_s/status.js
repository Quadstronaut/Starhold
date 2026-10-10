// status.starhold.fyi: reads the Gatus JSON API on this host and renders it.
// Spec §3.2–3.5. Rules this file keeps: never build a key (use the API's),
// never show "Up" for anything stale, missing or unreachable, and write the
// live-region text only when it changes.
const API = '/api/v1/endpoints';
const GROUPS = { web: 'Sites', products: 'Products', services: 'Services' };
const MIN = 6e4;
const BACKOFF = [60, 120, 300].map((s) => s * 1e3);
const BARS = 50;
const TEXT = {
	pending: 'Checking…',
	ok: 'All listed checks are up',
	degraded: '◐ Something is degraded',
	major: 'Major outage',
	unknown: 'Status unknown',
	api: "Can't reach the status API right now."
};
// Endpoints Gatus watches that are not in products.json. Spec B9's carve-out
// (owner ruling Q1) lets them appear only with this label, never as a product.
const NOT_FOR_SALE = new Set(['products_umbermark-starhold-app']);

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
// A malformed timestamp renders as "—" instead of throwing: one bad field must
// never turn a good 200 into the "can't reach the API" state.
const iso = (t) => {
	const d = new Date(t);
	return Number.isFinite(d.getTime()) ? d.toISOString() : '';
};
const hm = (t) => (iso(t) ? iso(t).slice(11, 16) + ' UTC' : '—');
const hms = (t) => (iso(t) ? iso(t).slice(11, 19) + ' UTC' : '—');
const ts = (r) => Date.parse(r?.timestamp);

const rows = new Map(); // key -> { el, ep }
let fails = 0;
let polls = 0;
let timer = 0;
let lastGood = 0; // newest result timestamp of the last good fetch
let figsAt = 0; // server time of the last uptime/response-time refresh: the "as of" stamp
let haveData = false;
let skew = 0; // server clock minus client clock, from each response's Date header

// Freshness is judged on the server's clock, not the visitor's: a visitor whose
// clock runs slow would otherwise read hours-old results as fresh, and "Up".
const now = () => Date.now() + skew;

// fetch
async function get(url, as = 'json') {
	const ctl = new AbortController();
	const t = setTimeout(() => ctl.abort(), 10e3);
	try {
		const res = await fetch(url, { signal: ctl.signal, cache: 'no-store', credentials: 'omit' });
		// Same origin, so Date is readable. A 500 still carries a usable clock.
		const d = Date.parse(res.headers.get('date') || '');
		if (Number.isFinite(d)) skew = d - Date.now();
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return as === 'json' ? await res.json() : (await res.text()).trim();
	} finally {
		clearTimeout(t);
	}
}

// freshness (§3.4)
function fresh(results, at) {
	if (!results.length) return false;
	let gap = 15 * MIN;
	if (results.length >= 2) {
		const d = [];
		for (let i = 1; i < results.length; i++) d.push(ts(results[i]) - ts(results[i - 1]));
		d.sort((a, b) => a - b);
		gap = Math.min(15 * MIN, Math.max(3 * MIN, d[d.length >> 1]));
	}
	// NaN (bad timestamp) compares false: not fresh, so never "Up".
	return at - ts(results[results.length - 1]) <= 3 * gap;
}

function classify(ep, at) {
	const r = ep.results;
	if (!r.length) return { state: 'none', chip: 'No data yet' };
	const last = r[r.length - 1];
	if (!fresh(r, at)) return { state: 'unknown', chip: `Unknown (last check ${hm(last.timestamp)})` };
	return last.success === true ? { state: 'ok', chip: 'Up' } : { state: 'down', chip: 'Down' };
}

const expects401 = (r) => /==\s*401/.test(r?.conditionResults?.[0]?.condition || '');

// rendering
function setText(el, text) {
	if (el && el.textContent !== text) el.textContent = text;
}

function setOverall(kind, text = TEXT[kind]) {
	const line = $('.state-line');
	line.dataset.overall = kind;
	setText($('[data-state-line]'), text);
	$('[data-api-help]').hidden = kind !== 'api';
}

function groupSection(group) {
	let sec = $(`.group[data-group="${CSS.escape(group)}"]`);
	if (!sec) {
		sec = document.createElement('section');
		sec.className = 'group';
		sec.dataset.group = group;
		const id = `g-x-${group.replace(/[^\w-]/g, '-')}`;
		sec.setAttribute('aria-labelledby', id);
		sec.innerHTML = `<div class="group-head"><h3></h3><p class="group-sum" data-group-sum></p></div><div class="rows" data-rows></div>`;
		$('h3', sec).id = id;
		$('h3', sec).textContent = group || 'Other';
		// Unknown groups by name; the ungrouped "Other" bucket goes last.
		const rank = (g) => g || '￿';
		const host = $('[data-extra-groups]');
		const after = $$('.group', host).find((g) => rank(g.dataset.group) > rank(group));
		host.insertBefore(sec, after || null);
	}
	return sec;
}

function makeRow(ep) {
	const el = $('#row-tpl').content.firstElementChild.cloneNode(true);
	const a = $('[data-name]', el);
	a.href = `/endpoints/${encodeURIComponent(ep.key)}`;
	a.textContent = ep.name;
	el.dataset.key = ep.key;
	const bar = $('[data-bar]', el);
	for (let i = 0; i < BARS; i++) bar.append(Object.assign(document.createElement('span'), { className: 'pill' }));
	return el;
}

function renderRow(row, ep, at) {
	const { el } = row;
	row.ep = ep;
	const r = ep.results;
	const last = r[r.length - 1];
	const c = classify(ep, at);
	el.dataset.state = c.state;
	const chip = $('[data-chip]', el);
	chip.dataset.state = c.state;
	setText(chip, c.chip);
	setText($('[data-host]', el), last?.hostname || '—');
	const note = $('[data-note]', el);
	const noteText = NOT_FOR_SALE.has(ep.key) ? 'Pre-launch · not for sale' : expects401(last) ? 'Rejects unauthenticated requests' : '';
	note.hidden = !noteText;
	setText(note, noteText);

	// Heartbeat: right-aligned, empty slots on the old side.
	const shown = r.slice(-BARS);
	const pills = $$('.pill', el);
	const pad = BARS - shown.length;
	pills.forEach((p, i) => {
		const res = shown[i - pad];
		// Pills record history (pass/fail), not health, so they never carry "ok".
		p.dataset.state = res ? (res.success === true ? 'pass' : 'fail') : 'none';
		// The newest stands tall only while it is current; a stale latest is just history.
		p.toggleAttribute('data-newest', !!res && i === BARS - 1 && (c.state === 'ok' || c.state === 'down'));
	});
	const pass = shown.filter((x) => x.success === true).length;
	const latest = last ? `, latest ${hm(last.timestamp)}` : '';
	$('[data-bar]', el).setAttribute('aria-label', `Last ${shown.length} checks: ${pass} passed, ${shown.length - pass} failed${latest}`);
	setText($('[data-beat-sum]', el), shown.length ? `${pass} of ${shown.length} passed · latest ${hm(last.timestamp)}` : 'No checks yet');

	// Recent checks: last 10, newest first.
	const body = $('[data-recent]', el);
	body.replaceChildren(
		...r.slice(-10).reverse().map((x) => {
			const tr = document.createElement('tr');
			const http = expects401(x) && x.status === 401 ? '401 (expected: auth enforced)' : String(x.status ?? '—');
			const cells = [hms(x.timestamp), x.success === true ? 'Pass' : 'Fail', http, `${Math.round((Number(x.duration) || 0) / 1e6)} ms`];
			cells.forEach((t, i) => {
				const td = document.createElement('td');
				td.textContent = t;
				if (i === 1) td.dataset.r = x.success === true ? 'pass' : 'fail';
				tr.append(td);
			});
			return tr;
		})
	);
}

// A row whose data could not be rendered says so rather than taking the page down.
function brokenRow(row) {
	row.el.dataset.state = 'unknown';
	const chip = $('[data-chip]', row.el);
	chip.dataset.state = 'unknown';
	setText(chip, 'Unknown');
	$$('.pill', row.el).forEach((p) => {
		p.dataset.state = 'none';
		p.removeAttribute('data-newest');
	});
}

function renderGroups() {
	for (const sec of $$('.group')) {
		const list = $$('.check', sec);
		// A group the API no longer lists (Q7 could remove one) disappears; it is never shown empty.
		sec.hidden = haveData && !list.length;
		const up = list.filter((x) => x.dataset.state === 'ok').length;
		setText($('[data-group-sum]', sec), list.length ? `${up} of ${list.length} up` : '');
	}
}

function renderTerm(eps, staleSince) {
	const box = $('[data-term]');
	const line = (cls, t, v = '') => {
		const p = document.createElement('p');
		p.className = `ln ${cls}`;
		p.innerHTML = '<span class="t"></span><span class="v"></span>';
		p.firstChild.textContent = t;
		p.lastChild.textContent = v;
		return p;
	};
	const out = [];
	if (eps?.length) {
		out.push(line('dim', 'key', 'success  duration'));
		for (const ep of eps.slice(0, 3)) {
			const l = ep.results?.[ep.results.length - 1];
			const v = l ? `${String(l.success).padEnd(7)}  ${Math.round((Number(l.duration) || 0) / 1e6)} ms` : 'no data';
			out.push(line(staleSince ? 'dim' : l?.success === true ? 'ok' : l ? 'err' : 'dim', ep.key, v));
		}
	}
	// "stale since" only ever follows good data; with none it is still "no data yet" (§3.3 row 6).
	if (staleSince) out.push(line('dim', `stale since ${hm(staleSince)}`));
	if (!out.length) out.push(line('dim', 'no data yet'));
	box.replaceChildren(...out);
}

// uptimes and response times (every 5th good poll, and the first after a failure)
async function figures() {
	figsAt = now(); // the figures are "as of" the moment they were requested
	await Promise.all(
		[...rows.entries()].map(async ([key, { el }]) => {
			const k = encodeURIComponent(key);
			const pct = async (d) => {
				try {
					const v = Number(await get(`${API}/${k}/uptimes/${d}`, 'text'));
					return Number.isFinite(v) && v >= 0 && v <= 1 ? `${(v * 100).toFixed(2)}%` : '—';
				} catch {
					return '—';
				}
			};
			const [a, b, c, rt] = await Promise.all([
				pct('24h'),
				pct('7d'),
				pct('30d'),
				get(`${API}/${k}/response-times/24h`, 'text').then(
					(v) => (/^\d+$/.test(v) ? `${v} ms` : '—'),
					() => '—'
				)
			]);
			[['24h', a], ['7d', b], ['30d', c]].forEach(([d, v]) => setFig($(`[data-up="${d}"]`, el), v));
			setFig($('[data-rt]', el), rt);
		})
	);
}

function setFig(fig, v) {
	fig.removeAttribute('data-asof');
	fig.dataset.v = v;
	setText(fig, v);
}

// The "as of" prefix belongs to the failure state only (§3.4): good data clears it at once.
function clearAsOf() {
	for (const fig of $$('[data-asof]')) setFig(fig, fig.dataset.v);
}

// poll
async function poll() {
	clearTimeout(timer);
	const btn = $('[data-refresh]');
	btn.setAttribute('aria-busy', 'true');
	let ok = false;
	try {
		const data = await get(`${API}/statuses?page=1&pageSize=${BARS}`);
		if (!Array.isArray(data)) throw new Error('bad JSON');
		ok = true;
		apply(data);
	} catch {
		// Only a failed fetch is "can't reach the API"; apply() contains its own row errors.
		if (!ok) failed();
	}
	btn.removeAttribute('aria-busy');
	const recovered = ok && fails > 0;
	fails = ok ? 0 : fails + 1;
	if (ok && (polls++ % 5 === 0 || recovered)) figures();
	schedule(ok ? MIN : BACKOFF[Math.min(fails - 1, BACKOFF.length - 1)]);
}

function schedule(ms) {
	clearTimeout(timer);
	if (document.visibilityState === 'visible') timer = setTimeout(poll, ms);
}

// Gatus omits `group` for an ungrouped endpoint (json omitempty); normalise once.
function normalise(ep) {
	return {
		...ep,
		key: String(ep?.key ?? ''),
		name: String(ep?.name ?? ep?.key ?? ''),
		group: String(ep?.group ?? ''),
		results: Array.isArray(ep?.results) ? ep.results.filter((x) => x && typeof x === 'object') : []
	};
}

function apply(data) {
	const at = now();
	const order = (g) => (g in GROUPS ? Object.keys(GROUPS).indexOf(g) : 9);
	const eps = data
		.filter((ep) => ep && typeof ep === 'object' && ep.key != null)
		.map(normalise)
		.sort((a, b) => order(a.group) - order(b.group) || a.group.localeCompare(b.group));
	const seen = new Set();
	for (const ep of eps) {
		seen.add(ep.key);
		let row = rows.get(ep.key);
		try {
			if (!row) {
				row = { el: makeRow(ep) };
				rows.set(ep.key, row);
				$('[data-rows]', groupSection(ep.group)).append(row.el);
			}
			renderRow(row, ep, at);
		} catch {
			if (row) brokenRow(row);
		}
	}
	for (const [key, row] of rows) if (!seen.has(key)) row.el.remove(), rows.delete(key);
	$$('.rows-note').forEach((n) => n.remove());
	haveData = true;
	clearAsOf();

	const states = [...rows.values()].map((r) => r.el.dataset.state);
	const down = states.filter((s) => s === 'down').length;
	const unsure = states.some((s) => s !== 'ok' && s !== 'down');
	if (!states.length) setOverall('unknown');
	else if (down && down * 2 >= states.length) setOverall('major');
	else if (down) setOverall('degraded');
	else if (unsure) setOverall('unknown');
	else setOverall('ok');

	const stamps = eps.flatMap((e) => (e.results.length ? [ts(e.results[e.results.length - 1])] : [])).filter(Number.isFinite);
	const newest = Math.max(0, ...stamps);
	lastGood = newest || lastGood;
	setText($('[data-latest]'), newest ? hms(newest) : '—');
	if (newest) $('[data-latest]').setAttribute('datetime', iso(newest));
	renderTerm(eps);
	renderGroups();
}

function failed() {
	setOverall('api');
	for (const { el } of rows.values()) {
		el.dataset.state = 'stale';
		const chip = $('[data-chip]', el);
		chip.dataset.state = 'stale';
		setText(chip, 'Stale');
		$$('.pill', el).forEach((p) => {
			p.dataset.state = 'none';
			p.removeAttribute('data-newest');
		});
		// Figures are stamped with when they were fetched, not with the newest result.
		for (const fig of $$('[data-v]', el)) {
			if (fig.dataset.v === '—' || fig.hasAttribute('data-asof') || !figsAt) continue;
			fig.setAttribute('data-asof', '');
			fig.textContent = '';
			fig.append(Object.assign(document.createElement('span'), { className: 'asof', textContent: `as of ${hm(figsAt)}` }), fig.dataset.v);
		}
	}
	if (!haveData) $$('.rows-note').forEach((n) => setText(n, 'No data: the status API did not answer.'));
	renderTerm(haveData ? [...rows.values()].map((r) => r.ep) : null, haveData ? lastGood || now() : 0);
	renderGroups();
}

// boot
function boot() {
	setOverall('pending');
	const btn = $('[data-refresh]');
	btn.hidden = false;
	btn.addEventListener('click', () => poll());
	// These lines describe live behaviour, so they exist only once JS runs (§3.7).
	for (const el of $$('[data-js-only]')) el.hidden = false;
	for (const sec of $$('.group')) {
		const box = $('[data-rows]', sec);
		box.append(Object.assign(document.createElement('p'), { className: 'rows-note', textContent: TEXT.pending }));
	}
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') poll();
		else clearTimeout(timer);
	});
	poll();
}

boot();
