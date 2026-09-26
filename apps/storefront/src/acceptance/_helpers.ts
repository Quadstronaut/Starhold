// Shared machinery for the Tier A acceptance suite.
//
// Design note: nothing here scans raw source text for copy violations. Comments
// and CSS would produce false positives (this file alone contains every banned
// word). Instead we (a) import the copy module and walk it for real strings, and
// (b) extract *template text* from .svelte files with script/style/comments and
// `{expressions}` removed. What is left is what a human actually reads.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
export const REPO_ROOT = resolve(APP_ROOT, '..', '..');
export const SRC = join(APP_ROOT, 'src');

export const read = (rel: string) => readFileSync(join(APP_ROOT, rel), 'utf8');
export const exists = (rel: string) => existsSync(join(APP_ROOT, rel));

/** Every file under src/ matching an extension, excluding this suite itself. */
export function srcFiles(exts: string[], dir = SRC, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		if (name === 'node_modules' || name.startsWith('.')) continue;
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			if (full.endsWith(`${sep}acceptance`)) continue; // the tests may say the banned words
			srcFiles(exts, full, out);
		} else if (exts.some((e) => name.endsWith(e))) {
			out.push(full);
		}
	}
	return out;
}

export const relative = (abs: string) => abs.slice(APP_ROOT.length + 1).split(sep).join('/');

// ── svelte helpers ───────────────────────────────────────────────────────────

const stripBlocks = (src: string) =>
	src
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/<style[\s\S]*?<\/style>/gi, '')
		.replace(/<!--[\s\S]*?-->/g, '');

/** Human-readable literal text of a component: no markup, no expressions. */
export function templateText(src: string): string {
	let out = stripBlocks(src).replace(/<[^>]*>/g, ' '); // tags (and attributes) go
	// {#each}, {expr}, {/if} … innermost first, so `${…}` inside a template
	// literal inside a mustache collapses too
	for (let i = 0; i < 6; i++) {
		const next = out.replace(/\$?\{[^{}]*\}/g, ' ');
		if (next === out) break;
		out = next;
	}
	return out
		.replace(/&[a-z]+;/gi, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Contents of every <style> block in a .svelte file. */
export function styleBlocks(src: string): string {
	return [...src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
}

// ── css helpers ──────────────────────────────────────────────────────────────

export const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '');

export type CssRule = { selector: string; body: string };

/** Leaf rules only (declarations, never at-rule wrappers). Good enough for a
 *  design-system lint and far cheaper than a real CSS parser. */
export function cssRules(css: string): CssRule[] {
	const clean = stripCssComments(css);
	return [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
		selector: m[1].trim(),
		body: m[2].trim()
	}));
}

/** Custom-property declarations inside :root. */
export function rootTokens(css: string): Record<string, string> {
	const root = cssRules(css).find((r) => r.selector === ':root');
	if (!root) return {};
	const out: Record<string, string> = {};
	for (const decl of root.body.split(';')) {
		const i = decl.indexOf(':');
		if (i === -1) continue;
		const name = decl.slice(0, i).trim();
		if (name.startsWith('--')) out[name] = decl.slice(i + 1).trim();
	}
	return out;
}

// ── colour ───────────────────────────────────────────────────────────────────

export function hexToRgb(hex: string): [number, number, number] {
	const h = hex.replace('#', '').trim();
	const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
	return [
		parseInt(full.slice(0, 2), 16),
		parseInt(full.slice(2, 4), 16),
		parseInt(full.slice(4, 6), 16)
	];
}

export function relativeLuminance(rgb: [number, number, number]): number {
	const [r, g, b] = rgb.map((v) => {
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
	const la = relativeLuminance(hexToRgb(a));
	const lb = relativeLuminance(hexToRgb(b));
	const [hi, lo] = la > lb ? [la, lb] : [lb, la];
	return (hi + 0.05) / (lo + 0.05);
}

// ── lexicons ─────────────────────────────────────────────────────────────────
//
// Matched case-insensitively on word boundaries against copy strings and
// template text — never against comments or code.

/** Costume words. The register survives; the LARP does not. */
export const BANNED_COSPLAY = [
	'res gesta',
	'par excellentiam',
	'mission control',
	'pre-flight',
	'preflight',
	'transmit',
	'transmitting',
	'transmission',
	'transmissions',
	'join the crew',
	'war stories',
	'classified',
	'shall remain nameless',
	'master of automation',
	'explore the fleet',
	'launch checkout',
	'on the manifest',
	'manifest',
	'tunnel-grade',
	'flown by',
	'hold your own star',
	'reach for the stars',
	'liftoff',
	'lift-off',
	'back to base',
	'start a mission',
	'live mission',
	'the crew'
];

/** Filler, superlatives, and self-awarded expertise. */
export const BANNED_FILLER = [
	'world-class',
	'world class',
	'cutting-edge',
	'best-in-class',
	'industry-leading',
	'industry leading',
	'seamless',
	'seamlessly',
	'synergy',
	'synergies',
	'passionate',
	'ninja',
	'rockstar',
	'rock star',
	'guru',
	'unparalleled',
	'unmatched',
	'premier',
	'state-of-the-art',
	'battle-tested',
	'enterprise-grade',
	'blazing',
	'blazingly',
	'game-changing',
	'game changer',
	'revolutionary',
	'next-generation',
	'next-gen',
	'turnkey',
	'holistic',
	'top-tier',
	'best of breed',
	'expert',
	'experts',
	'expertise',
	'master',
	'mastery',
	'veteran',
	'seasoned',
	'award-winning',
	'proven track record',
	'second to none'
];

/** Invented social proof, in every shape it usually arrives in. */
export const BANNED_SOCIAL_PROOF = [
	'trusted by',
	'our clients',
	'our customers',
	'our team',
	'the team',
	'meet the team',
	'our staff',
	'testimonial',
	'testimonials',
	'what our',
	'join thousands',
	'thousands of',
	'loved by',
	'as featured in',
	'as seen in',
	'happy customers',
	'satisfied customers',
	'clients served',
	'five-star',
	'5-star',
	'case studies from',
	'partners include'
];

/** Entity suffixes. None may appear on a marketing surface, in either
 *  direction: not for Starhold (Q7 unresolved) and not for the day-job
 *  employer (which is deliberately unnamed). */
export const BANNED_ENTITY_SUFFIX = [
	'inc',
	'inc.',
	'llc',
	'l.l.c.',
	'corp',
	'corp.',
	'corporation',
	'incorporated',
	'ltd',
	'ltd.',
	'limited',
	'gmbh',
	'plc',
	'pty',
	's.a.',
	'b.v.'
];

/** The metaphor budget list. These are allowed — they are just counted. */
export const METAPHORS = [
	'fleet',
	'mission',
	'missions',
	'sovereign',
	'sovereignty',
	'orbit',
	'orbital',
	'launch',
	'launches',
	'liftoff',
	'star',
	'stars',
	'starship',
	'hangar',
	'pad',
	'flight',
	'flying',
	'flown',
	'crew',
	'console',
	'pilot',
	'ship',
	'dock',
	'telemetry',
	'trajectory',
	'voyage',
	'cosmic',
	'galaxy',
	'constellation',
	'beacon',
	'rocket',
	'payload',
	'manifest',
	'navigator',
	'warp',
	'astronaut',
	'command deck'
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Word-boundary, case-insensitive. Handles multi-word phrases. */
export function findTerms(haystack: string, terms: string[]): string[] {
	const hits: string[] = [];
	for (const t of terms) {
		const re = new RegExp(`(?<![\\w-])${esc(t)}(?![\\w-])`, 'i');
		if (re.test(haystack)) hits.push(t);
	}
	return hits;
}

export function countTerms(haystack: string, terms: string[]): number {
	let n = 0;
	for (const t of terms) {
		const re = new RegExp(`(?<![\\w-])${esc(t)}(?![\\w-])`, 'gi');
		n += (haystack.match(re) ?? []).length;
	}
	return n;
}

/** Recursively collect every string in a plain object/array tree. */
export function collectStrings(value: unknown, out: string[] = []): string[] {
	if (typeof value === 'string') out.push(value);
	else if (Array.isArray(value)) for (const v of value) collectStrings(v, out);
	else if (value && typeof value === 'object')
		for (const v of Object.values(value)) collectStrings(v, out);
	return out;
}

/** Collect every value stored under an `evidence` key, at any depth. */
export function collectEvidenceRefs(value: unknown, out: Set<string> = new Set()): Set<string> {
	if (Array.isArray(value)) for (const v of value) collectEvidenceRefs(v, out);
	else if (value && typeof value === 'object')
		for (const [k, v] of Object.entries(value)) {
			if (k === 'evidence' && typeof v === 'string') out.add(v);
			else collectEvidenceRefs(v, out);
		}
	return out;
}

// ── the marketing surface ────────────────────────────────────────────────────

/** Routes whose rendered words are marketing. Legal + cart are excluded on
 *  purpose: there a legal entity is speaking, and "we" is correct there. */
export const MARKETING_ROUTES = [
	'src/routes/+page.svelte',
	'src/routes/work/+page.svelte',
	'src/routes/capabilities/+page.svelte',
	'src/routes/operator/+page.svelte',
	'src/routes/contact/+page.svelte',
	'src/routes/services/automation/+page.svelte',
	'src/routes/products/custom-bots/+page.svelte',
	'src/routes/products/qnix/+page.svelte',
	'src/routes/products/shushgame/+page.svelte'
];

/** Chrome that renders on every page, marketing included. */
export const CHROME = [
	'src/lib/components/Header.svelte',
	'src/lib/components/Footer.svelte',
	'src/lib/components/IntakeForm.svelte',
	'src/lib/components/BotConfigurator.svelte'
];

export function marketingText(): string {
	return [...MARKETING_ROUTES, ...CHROME].map((f) => templateText(read(f))).join('\n');
}
