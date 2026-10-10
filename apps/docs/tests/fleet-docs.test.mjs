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
const HERO_H1 = 'Setup guides and notes for the things Starhold ships.';

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
	for (const route of ['', 'bots/ordering']) {
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
	for (const route of ['', 'bots/ordering']) {
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
	for (const route of ['', 'bots/ordering', 'qnix']) {
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
	for (const route of ['', 'bots/ordering']) {
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

test('no first person plural on any page (R26)', () => {
	for (const f of pages()) {
		const hits = proseText(read(f)).match(/(?<![\w-])(we|we'll|we're|we've|us|our|ours|ourselves)(?![\w-])/gi);
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
	const qnix = page('qnix');
	assert.doesNotMatch(qnix, /products? run on|runs on QNix|this documentation site|real tenants/i);
	assert.match(qnix, /<meta name="description" content="[^"]*in development/i);
});

test('every checked page has an accent-word h2 (R29) and no accent word in an h1', () => {
	for (const route of ['', 'bots/ordering']) {
		const html = page(route);
		assert.match(html, /<h2\b[^>]*>[^<]*<span class="accent-word"/);
		for (const h1 of html.matchAll(/<h1\b[\s\S]*?<\/h1>/g)) assert.doesNotMatch(h1[0], /accent-word/);
	}
});
