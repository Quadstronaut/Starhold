// STAR-145 · no-marketing check (ledger Q35 definition, design brief rulings).
// The home page carries no upsells, countdowns, or cross-promotion blocks, and
// loads no script from a third-party host.
import { describe, it, expect } from 'vitest';
import * as copy from '../lib/content/copy';
import { read, templateText, collectStrings, srcFiles, relative } from './_helpers';

const HOME_FILES = [
	'src/app.html',
	'src/routes/+layout.svelte',
	'src/routes/+page.svelte',
	'src/lib/components/Header.svelte',
	'src/lib/components/Footer.svelte',
	'src/lib/components/Faq.svelte',
	'src/lib/components/Heading.svelte',
	'src/lib/components/Wordmark.svelte',
	'src/lib/components/HeroArt.svelte'
];

describe('STAR-145 · no marketing on the home page', () => {
	it('loads no script from a third-party host', () => {
		const offenders: string[] = [];
		for (const f of HOME_FILES) {
			const src = read(f);
			// <script src="https://…"> or protocol-relative, any attribute order
			for (const m of src.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']?(?:https?:)?\/\/([^/"'\s>]+)/gi))
				offenders.push(`${f}: ${m[1]}`);
			// dynamic injection of a remote script
			if (/import\(\s*['"]https?:/.test(src)) offenders.push(`${f}: remote dynamic import`);
		}
		expect(offenders).toEqual([]);
		// the only script the home page emits itself is the inline FAQ JSON-LD
		const page = read('src/routes/+page.svelte');
		expect([...page.matchAll(/<script\b[^>]*>/g)].map((m) => m[0])).toEqual(['<script lang="ts">', '<script type="application/ld+json">']);
	});

	it('the home page, header and footer link out only to hosts we run or the stated destinations', () => {
		const text = [
			collectStrings({ home: copy.home, services: copy.services, faq: copy.faq, principles: copy.principles }).join('\n'),
			templateText(read('src/routes/+page.svelte'))
		].join('\n');
		const hosts = new Set([...text.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map((m) => m[1]));
		const allowed = [
			'starhold.app', 'umbermark.starhold.app', 'zenithmark.starhold.app', 'status.starhold.fyi',
			'starhold.fyi', 'github.com', 'shushgame.com'
		];
		expect([...hosts].filter((h) => !allowed.includes(h))).toEqual([]);
	});

	it('has no upsell, countdown, scarcity or cross-promotion language', () => {
		const text = [
			collectStrings({ home: copy.home, services: copy.services, faq: copy.faq, principles: copy.principles, comingSoon: copy.comingSoon }).join('\n'),
			templateText(read('src/routes/+page.svelte')),
			templateText(read('src/lib/components/Footer.svelte')),
			templateText(read('src/lib/components/Header.svelte'))
		].join('\n');
		const BANNED = [
			/limited[- ]time/i, /countdown/i, /hurry/i, /act now/i, /don'?t miss/i, /last chance/i, /only \w+ (left|spots?|seats?)/i,
			/\bupgrade\b/i, /\bupsell/i, /% off\b/i, /\bdiscount\b/i, /\bpromo(tion)?\b/i, /\bnewsletter\b/i, /subscribe to/i,
			/featured work/i, /also from starhold/i, /you might also/i, /spots? (left|remaining)/i, /ends (in|on|soon)/i
		];
		expect(BANNED.filter((re) => re.test(text)).map(String)).toEqual([]);
	});

	it('has no countdown or timer code and no featured-product block on the home page', () => {
		const page = read('src/routes/+page.svelte');
		expect(page).not.toMatch(/setInterval|setTimeout|Date\.now|new Date\(/);
		expect(page).not.toMatch(/DeviceMockup|id="featured"/);
	});

	it('the Shush page does not cross-link to other Starhold products', () => {
		const t = collectStrings(copy.shush).join('\n') + templateText(read('src/routes/shush/+page.svelte'));
		expect(t).not.toMatch(/umbermark|zenithmark|render|starbot|qnix/i);
	});

	it('nothing under src/ pulls a third-party script host', () => {
		const bad = /<script[^>]+src\s*=\s*["']https?:\/\/(?!localhost)/i;
		expect(srcFiles(['.svelte', '.html']).filter((f) => bad.test(read(relative(f)))).map(relative)).toEqual([]);
	});
});
