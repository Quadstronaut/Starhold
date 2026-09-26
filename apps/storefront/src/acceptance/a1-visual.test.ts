// Tier A · A1 — design-system contract.
// Static analysis of the token layer and of everything that consumes it.
import { describe, it, expect } from 'vitest';
import {
	read,
	srcFiles,
	relative,
	cssRules,
	rootTokens,
	stripCssComments,
	styleBlocks,
	contrast
} from './_helpers';
import { readFileSync } from 'node:fs';

const APP_CSS = read('src/app.css');
const TOKENS = rootTokens(APP_CSS);

/** app.css with the :root block (the one legal home for hex) removed. */
const cssOutsideRoot = stripCssComments(APP_CSS).replace(/:root\s*\{[^{}]*\}/g, '');

/** A hex colour literal: # then 3–8 hex digits not followed by more word chars.
 *  `#fleet`, `#app-shell`, `#operator` do not match — they are id selectors. */
const HEX = /#[0-9a-fA-F]{3,8}(?![0-9a-zA-Z-])/g;

const px = (v: string) => (v.trim().endsWith('px') ? parseFloat(v) : NaN);

describe('A1 · design tokens', () => {
	it('A1.1 :root declares the full required token contract', () => {
		const required = [
			'--bg',
			'--surface',
			'--border',
			'--text',
			'--text-muted',
			'--accent',
			'--accent-ink',
			'--focus',
			'--radius-sm',
			'--measure'
		];
		expect(required.filter((t) => !(t in TOKENS))).toEqual([]);
	});

	it('A1.2 type scale has >=7 steps with sane ratios and a 16-18px body step', () => {
		const steps = Object.entries(TOKENS)
			.filter(([k]) => /^--fs-\d+$/.test(k))
			.sort((a, b) => Number(a[0].slice(5)) - Number(b[0].slice(5)))
			.map(([, v]) => px(v));

		expect(steps.length).toBeGreaterThanOrEqual(7);
		expect(steps.every(Number.isFinite)).toBe(true);
		expect(Math.min(...steps)).toBeGreaterThanOrEqual(12);
		expect(Math.max(...steps)).toBeGreaterThanOrEqual(36);
		expect(steps.some((s) => s >= 16 && s <= 18)).toBe(true);

		for (let i = 1; i < steps.length; i++) {
			const ratio = steps[i] / steps[i - 1];
			expect(ratio, `step ${i}: ${steps[i - 1]} -> ${steps[i]}`).toBeGreaterThanOrEqual(1.08);
			expect(ratio, `step ${i}: ${steps[i - 1]} -> ${steps[i]}`).toBeLessThanOrEqual(1.45);
		}
	});

	it('A1.3 spacing scale has >=6 steps on a 4px base', () => {
		const steps = Object.entries(TOKENS)
			.filter(([k]) => /^--sp-\d+$/.test(k))
			.map(([, v]) => px(v));
		expect(steps.length).toBeGreaterThanOrEqual(6);
		expect(steps.every((s) => Number.isFinite(s) && s % 4 === 0)).toBe(true);
	});

	it('A1.4 the retired brick red appears nowhere in src', () => {
		const retired = '#b2' + '2222'; // assembled so this assertion is not its own violation
		const offenders = srcFiles(['.svelte', '.css', '.ts', '.html', '.svg'])
			.filter((f) => readFileSync(f, 'utf8').toLowerCase().includes(retired))
			.map(relative);
		expect(offenders).toEqual([]);
	});

	it('A1.5 contrast-critical tokens are hex and meet WCAG', () => {
		const critical = ['--bg', '--text', '--text-muted', '--accent', '--accent-ink', '--focus'];
		for (const t of critical) expect(TOKENS[t], t).toMatch(/^#[0-9a-fA-F]{3,8}$/);

		expect(contrast(TOKENS['--text'], TOKENS['--bg'])).toBeGreaterThanOrEqual(7);
		expect(contrast(TOKENS['--text-muted'], TOKENS['--bg'])).toBeGreaterThanOrEqual(4.5);
		expect(contrast(TOKENS['--accent-ink'], TOKENS['--accent'])).toBeGreaterThanOrEqual(4.5);
		expect(contrast(TOKENS['--focus'], TOKENS['--bg'])).toBeGreaterThanOrEqual(3);
	});

	it('A1.6 no h1/h2/h3 rule applies uppercase or wide tracking', () => {
		const offenders: string[] = [];
		for (const file of ['src/app.css', ...srcFiles(['.svelte']).map(relative)]) {
			const css = file.endsWith('.css') ? read(file) : styleBlocks(read(file));
			for (const rule of cssRules(css)) {
				const headingRule = rule.selector
					.split(',')
					.some((s) => /(^|[\s>+~])h[123]\b/.test(' ' + s.trim()));
				if (!headingRule) continue;
				if (/text-transform\s*:\s*uppercase/i.test(rule.body))
					offenders.push(`${file}: ${rule.selector} uppercases a heading`);
				const ls = rule.body.match(/letter-spacing\s*:\s*(-?[\d.]+)em/i);
				if (ls && Math.abs(parseFloat(ls[1])) >= 0.03)
					offenders.push(`${file}: ${rule.selector} tracks headings at ${ls[1]}em`);
			}
		}
		expect(offenders).toEqual([]);
	});

	it('A1.7 uppercase is confined to micro-type utility selectors', () => {
		const MICRO = ['.eyebrow', '.kicker', '.label', '.tag', '.badge'];
		const offenders: string[] = [];
		for (const file of ['src/app.css', ...srcFiles(['.svelte']).map(relative)]) {
			const css = file.endsWith('.css') ? read(file) : styleBlocks(read(file));
			for (const rule of cssRules(css)) {
				if (!/text-transform\s*:\s*uppercase/i.test(rule.body)) continue;
				const ok = rule.selector
					.split(',')
					.every((s) => MICRO.includes(s.trim()));
				if (!ok) offenders.push(`${file}: ${rule.selector}`);
			}
		}
		expect(offenders).toEqual([]);
	});

	it('A1.8 no hex literal exists outside the :root token block', () => {
		const offenders: string[] = [];

		const strayInAppCss = cssOutsideRoot.match(HEX) ?? [];
		if (strayInAppCss.length) offenders.push(`src/app.css: ${strayInAppCss.join(', ')}`);

		for (const file of srcFiles(['.svelte'])) {
			const stray = stripCssComments(styleBlocks(readFileSync(file, 'utf8'))).match(HEX) ?? [];
			if (stray.length) offenders.push(`${relative(file)}: ${stray.join(', ')}`);
		}
		expect(offenders).toEqual([]);
	});

	it('A1.9 no static inline style attribute remains in routes or components', () => {
		const offenders = srcFiles(['.svelte'])
			.filter((f) => /\sstyle\s*=\s*"/.test(readFileSync(f, 'utf8')))
			.map(relative);
		expect(offenders).toEqual([]);
	});

	it('A1.10 no third-party font or CDN reference in source', () => {
		const bad = /fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg\.com|jsdelivr|typekit|use\.fontawesome|@import\s+url\(\s*['"]?https?:/i;
		const offenders = srcFiles(['.svelte', '.css', '.ts', '.html'])
			.filter((f) => bad.test(readFileSync(f, 'utf8')))
			.map(relative);
		expect(offenders).toEqual([]);
	});

	it('A1.11 a :focus-visible rule defines an outline of at least 2px', () => {
		const rules = cssRules(APP_CSS).filter((r) => r.selector.includes(':focus-visible'));
		expect(rules.length).toBeGreaterThan(0);
		const widths = rules
			.map((r) => r.body.match(/outline\s*:\s*([\d.]+)px/i))
			.filter(Boolean)
			.map((m) => parseFloat(m![1]));
		expect(widths.length).toBeGreaterThan(0);
		expect(Math.max(...widths)).toBeGreaterThanOrEqual(2);
	});

	it('A1.12 --measure constrains prose to a readable line length', () => {
		const m = TOKENS['--measure'];
		const ch = m.match(/^([\d.]+)ch$/);
		const p = m.match(/^([\d.]+)px$/);
		if (ch) {
			expect(parseFloat(ch[1])).toBeGreaterThanOrEqual(55);
			expect(parseFloat(ch[1])).toBeLessThanOrEqual(80);
		} else if (p) {
			expect(parseFloat(p[1])).toBeGreaterThanOrEqual(560);
			expect(parseFloat(p[1])).toBeLessThanOrEqual(760);
		} else {
			throw new Error(`--measure must be ch or px, got ${m}`);
		}
		// and it must actually be used to bound prose
		expect(APP_CSS).toMatch(/\.prose\s*\{[^}]*max-width:\s*var\(--measure\)/);
	});
});
