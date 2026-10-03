// Tier A · A5 — presence guardrails that can be checked without a browser.
import { describe, it, expect } from 'vitest';
import { read, exists, stripCssComments } from './_helpers';
import evidence from '../lib/content/evidence.json';

describe('A5 · presence assets and rules', () => {
	it('A5.1 self-hosted Michroma woff2 and its OFL licence are shipped', () => {
		expect(exists('static/fonts/michroma-latin.woff2')).toBe(true);
		expect(exists('static/fonts/OFL-Michroma.txt')).toBe(true);
	});

	it('A5.2 the no-third-party-tracking evidence row is verified', () => {
		const row = evidence.items.find((i) => i.id === 'no-third-party-tracking');
		expect(row, 'row exists').toBeTruthy();
		expect(row!.status).toBe('verified');
		expect(exists(row!.verifier.replace(/^apps\/storefront\//, ''))).toBe(true);
	});

	it('A5.3 animation-timeline appears only inside an @supports block in app.css', () => {
		const css = stripCssComments(read('src/app.css'));
		// Blank out every @supports (...) { ... } block (brace-balanced), then
		// nothing may remain that mentions animation-timeline as a declaration.
		let out = '';
		for (let i = 0; i < css.length; ) {
			if (css.startsWith('@supports', i)) {
				let depth = 0, j = css.indexOf('{', i);
				for (; j < css.length; j++) {
					if (css[j] === '{') depth++;
					else if (css[j] === '}' && --depth === 0) break;
				}
				i = j + 1;
			} else out += css[i++];
		}
		expect(out).not.toMatch(/animation-timeline\s*:/);
		expect(css).toMatch(/animation-timeline\s*:/); // and it is actually used
	});
});
