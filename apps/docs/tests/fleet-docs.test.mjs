// Static checks over the built site (STAR-27 spec §5.2). No dependencies.
//   npm run build && npm run test:fleet
// The browser half lives in brand/e2e/docs.spec.ts; these catch the same
// regressions without a browser, straight from dist/ and src/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(APP, 'dist');
const NAV = JSON.parse(readFileSync(join(APP, 'src', 'fleet-nav.json'), 'utf8'));
const HERO_H1 = 'Privacy-first services, hosted and run for you.';

function walk(dir, out = []) {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		if (statSync(p).isDirectory()) walk(p, out);
		else out.push(p);
	}
	return out;
}
const read = (p) => readFileSync(p, 'utf8');
const page = (route) => read(join(DIST, route, 'index.html'));

test('dist exists (run npm run build first)', () => {
	assert.ok(existsSync(join(DIST, 'index.html')), 'dist/index.html missing');
});

test('no third-party hosts anywhere in dist (B3)', () => {
	const bad = /fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg|jsdelivr|typekit|fontawesome/;
	for (const f of walk(DIST).filter((f) => /\.(html|css|js|mjs)$/.test(f))) {
		assert.doesNotMatch(read(f), bad, f);
	}
});

test('the only font file is /fonts/michroma-latin.woff2, under 30 KB (B2)', () => {
	const fonts = walk(DIST).filter((f) => /\.(woff2?|ttf|otf|eot)$/.test(f));
	assert.deepEqual(
		fonts.map((f) => f.slice(DIST.length).replace(/\\/g, '/')),
		['/fonts/michroma-latin.woff2']
	);
	assert.ok(statSync(fonts[0]).size < 30 * 1024);
	for (const route of ['', 'services/umbermark']) {
		assert.match(page(route), /<link rel="preload" href="\/fonts\/michroma-latin\.woff2" as="font" type="font\/woff2" crossorigin/);
	}
});

test('no colour literal outside :root in the site CSS sources (B1)', () => {
	const files = walk(join(APP, 'src')).filter((f) => /\.(css|astro)$/.test(f) && !f.includes(join('styles', 'fleet')));
	for (const f of files) {
		const text = read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/:root[^{};]*\{[^{}]*\}/g, '');
		assert.doesNotMatch(text, /(?<!&)#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?)\(/, f);
		assert.doesNotMatch(text, /!important/, f);
	}
	assert.ok(!existsSync(join(APP, 'src', 'styles', 'blueprint.css')), 'blueprint.css is deleted');
});

test('dark only, no theme picker (B10)', () => {
	for (const route of ['', 'services/umbermark']) {
		const html = page(route);
		assert.match(html, /<html[^>]*data-theme="dark"/);
		assert.match(html, /<meta name="color-scheme" content="dark"/);
		assert.doesNotMatch(html, /<starlight-theme-select/);
		assert.doesNotMatch(html, /localStorage/);
	}
});

test('splash h1 is the hero promise, once, with id _top', () => {
	const html = page('');
	const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
	assert.equal(h1s.length, 1);
	assert.equal(h1s[0][1].trim(), HERO_H1);
	assert.match(h1s[0][0], /id="_top"/);
	assert.match(html, /<title>Start here \| Starhold docs<\/title>/);
});

test('fleet links come from fleet-nav.json and Docs is current', () => {
	for (const route of ['', 'services/qnix']) {
		const html = page(route);
		for (const l of NAV.fleet) assert.ok(html.includes(`href="${l.href}"`), `${route}: ${l.href}`);
		assert.ok(html.includes(`href="${NAV.cta.href.replace(/&/g, '&amp;')}"`) || html.includes(`href="${NAV.cta.href}"`));
		assert.match(html, /<a href="https:\/\/starhold\.fyi" aria-current="page">Docs<\/a>/);
		assert.match(html, /<footer class="fleet-footer[^"]*"[^>]*data-pagefind-ignore/);
	}
});

test('search index never holds the chrome', () => {
	const fragments = walk(join(DIST, 'pagefind')).filter((f) => f.endsWith('.pf_fragment'));
	assert.ok(fragments.length > 0, 'pagefind index built');
	// Fragments are gzipped; the meta check is that every page is indexed from
	// main[data-pagefind-body] and the footer and band opt out.
	for (const route of ['', 'services/umbermark']) {
		const html = page(route);
		assert.match(html, /<main[^>]*data-pagefind-body/);
		assert.match(html, /class="fleet-scope fyi-close[^"]*" data-pagefind-ignore/);
	}
});

// Voice and lexicon over EVERY built page, not only check 7's two (R26, B8, B9).
// The lexicons are read from the storefront's _helpers.ts as text, the same way
// brand/check-drift.mjs reads them, so there is one list. Code is exempt: a
// Kubernetes "manifest" or a git "master" inside <code> is a literal, not prose.
const HELPERS = read(join(APP, '..', 'storefront', 'src', 'acceptance', '_helpers.ts'));
const lexicon = (name) => {
	const m = HELPERS.match(new RegExp(`export const ${name}\\s*=\\s*\\[([\\s\\S]*?)\\];`));
	assert.ok(m, `_helpers.ts: ${name} not found`);
	return [...m[1].matchAll(/'([^']*)'/g)].map((x) => x[1]);
};
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const termRe = (t) => new RegExp(`(?<![\\w-])${esc(t)}(?![\\w-])`, 'i');
const proseText = (html) =>
	html
		.replace(/<(script|style|svg|pre|code|template)\b[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&#39;|&rsquo;|&#x27;/g, "'")
		.replace(/&[a-z#0-9]+;/gi, ' ')
		.replace(/\s+/g, ' ');
const pages = () => walk(DIST).filter((f) => f.endsWith('index.html') && !f.includes(join(DIST, 'pagefind')));

// STAR-152 (arbiter ruling 9): "we" voice everywhere, so first person singular is the banned form.
// Dated log entries before 2026-10-24 are history and stay untouched (Q41).
test('no first person singular on any page', () => {
	for (const f of pages().filter((f) => !/2026-0[67]-/.test(f))) {
		const hits = proseText(read(f)).replace(/"[^"]*"|“[^”]*”|&quot;.*?&quot;/g, ' ').match(/(?<![\w-])(I|I'll|I'm|I've|my|me|mine|myself)(?![\w-])/g);
		assert.equal(hits, null, `${f.slice(DIST.length)}: ${hits}`);
	}
});

test('no banned lexicon in prose on any page (B8)', () => {
	const banned = ['BANNED_COSPLAY', 'BANNED_FILLER', 'BANNED_SOCIAL_PROOF', 'BANNED_ENTITY_SUFFIX'].flatMap(lexicon);
	for (const f of pages()) {
		const text = proseText(read(f));
		assert.deepEqual(banned.filter((t) => termRe(t).test(text)), [], f.slice(DIST.length));
	}
});

test('only true claims: one person, QNix in development, no incident promise (B9)', () => {
	for (const f of pages()) {
		const text = proseText(read(f));
		assert.doesNotMatch(text, /\b(build|Starhold|support|dev) team\b/i, `${f.slice(DIST.length)}: Starhold is one person`);
		assert.doesNotMatch(text, /incident (status|history)/i, `${f.slice(DIST.length)}: the status page has no incident reports`);
	}
	const qnix = page('services/qnix');
	assert.doesNotMatch(qnix, /products? run on|runs on QNix|this documentation site|real tenants/i);
	assert.match(qnix, /<meta name="description" content="[^"]*in development/i);
});

test('every checked page has an accent-word h2 (R29) and no accent word in an h1', () => {
	for (const route of ['', 'services/umbermark']) {
		const html = page(route);
		assert.match(html, /<h2\b[^>]*>[^<]*<span class="accent-word"/);
		for (const h1 of html.matchAll(/<h1\b[\s\S]*?<\/h1>/g)) assert.doesNotMatch(h1[0], /accent-word/);
	}
});

// STAR-142 pass 1 -----------------------------------------------------------
// One availability line per service, read from docs/shared/availability.json
// (the storefront mirrors it; hangar and docs carry it as text, and this test
// is the drift check on the docs side).
const AVAIL = JSON.parse(read(join(APP, '..', '..', 'docs', 'shared', 'availability.json')));
const SERVICE_PAGES = {
	umbermark: 'services/umbermark',
	zenithmark: 'services/zenithmark',
	render: 'services/render',
	status: 'services/status',
	starbot: 'services/starbot',
	shushgame: 'services/shushgame',
	qnix: 'services/qnix'
};

test('every service page shows its availability line from availability.json', () => {
	assert.deepEqual(Object.keys(SERVICE_PAGES).sort(), Object.keys(AVAIL.products).sort());
	for (const [id, route] of Object.entries(SERVICE_PAGES)) {
		const text = proseText(page(route));
		assert.ok(text.includes(`Availability: ${AVAIL.products[id]}.`), `${route}: availability line for ${id}`);
	}
});

test('the services table and the splash shelf show every product availability line', () => {
	const table = proseText(page('services'));
	for (const line of Object.values(AVAIL.products)) assert.ok(table.includes(line), `services table: ${line}`);
	const shelf = [...page('').matchAll(/<p class="availability">([^<]+)<\/p>/g)].map((m) => m[1]);
	const expected = Object.entries(AVAIL.products).filter(([id]) => id !== 'qnix').map(([, v]) => v);
	assert.deepEqual(shelf.sort(), expected.sort(), 'one availability line per shelf tile (QNix is not on the shelf)');
});

test('purchase and plan sentences carry the checkout state (B1)', () => {
	for (const route of ['', 'services', 'services/umbermark', 'services/render', 'services/status']) {
		assert.ok(proseText(page(route)).includes(AVAIL.checkoutNotice), `${route || 'splash'}: checkout state`);
	}
	assert.ok(proseText(page('')).includes(AVAIL.openMeans), 'splash says what Open means');
	assert.ok(proseText(page('services')).includes(AVAIL.openMeans), 'services index says what Open means');
});

test('export, delete and sign-in are described as they are today (B2)', () => {
	for (const f of pages()) {
		const text = proseText(read(f));
		assert.doesNotMatch(text, /from the dashboard|we send your sign-in link|and we send your link/i, f.slice(DIST.length));
	}
	for (const route of ['services/render', 'services/status', 'services/umbermark']) {
		assert.ok(proseText(page(route)).replace(/ ([,.;])/g, '$1').includes('by request to privacy@starhold.dev, done by hand within 30 days'), route);
	}
});

test('Shush retention states today\'s rule on every page that mentions it (B4)', () => {
	for (const route of ['services/shushgame', 'shushgame/points-roles-shop']) {
		const text = proseText(page(route));
		assert.ok(text.includes('Names stay on the public list until you ask us to remove them'), route);
		assert.ok(text.includes('A 30-day automatic expiry is in development.'), route);
	}
});

test('no Patreon, no who-runs-it, no "Starhold Software" outside dated history (M9, m2, m4)', () => {
	for (const f of pages().filter((f) => !/2026-0[67]-/.test(f))) {
		const raw = read(f);
		const text = proseText(raw);
		assert.ok(!raw.includes('patreon.com'), `${f.slice(DIST.length)}: Patreon link`);
		assert.doesNotMatch(text, /Back the work/, f.slice(DIST.length));
		assert.doesNotMatch(text, /one person in Arizona/, f.slice(DIST.length));
		assert.doesNotMatch(text, /Starhold Software/, f.slice(DIST.length));
		assert.doesNotMatch(text, /\bShushgame\b/, `${f.slice(DIST.length)}: say Shush`);
	}
});

test('Starbot is described as built today, not as keeping nothing (M11)', () => {
	const text = proseText(page('services/starbot'));
	assert.doesNotMatch(text, /keeps nothing/i);
	assert.match(text, /As built today, Starbot keeps/);
});