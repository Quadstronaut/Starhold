// STAR-142: legal documents in both launch states, and their plain-text twins.
//   prelaunch : the sources are byte-for-byte what origin/master served before the switch existed.
//   launched  : the text the operator approved on 2026-11-13, pinned by the same hash Starhold Account's
//               release gate computes (gate.legal_hash), so the served text can be checked against it.
//   both      : /legal/<name>.txt is the same document as the HTML page, deterministic, text/plain.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from 'svelte/server';
import { APP_ROOT } from '../../acceptance/_helpers';
import { documentsByState } from './index';
import { htmlToText } from './text';

const KEYS = ['terms', 'privacy', 'refunds'] as const;

/** Mirror of starship.gate.legal_hash: LF, outer blanks stripped, trailing whitespace per line stripped. */
const legalHash = (s: string) =>
	createHash('sha256')
		.update(s.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n').map((l) => l.trimEnd()).join('\n'), 'utf8')
		.digest('hex');
const sha = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

// sha256 of the pre-launch page source (LF) as it stands on origin/master.
const PRELAUNCH_SOURCE_SHA: Record<(typeof KEYS)[number], string> = {
	terms: 'ab4ffa80499a67b737feb24277ca6c090f5cd521cbe3ad078103678b99068dac',
	privacy: 'f580fb408c315315df0d9ab65232b5084c0f0e4fa910c8e8e089c29d1819082c',
	refunds: '1f79596fef555af5d147845c626bce0c979d338393ee489491fb7ed9237b579b'
};

// The approved launch text, as legal_hash sees the served /legal/<name>.txt. Changing the wording changes these:
// that is the point. Re-approve, then update the hashes here and on production Starship (deploy/DEPLOY.md, Launch day).
const APPROVED_LAUNCH_HASH: Record<(typeof KEYS)[number], string> = {
	terms: '1cf193aaf9b845494bb005059d422db45d96cdc0072e99d0199342fa408c3ebe',
	privacy: 'd6768bd970bfbdfc6660d5412f1aeaef5a386cf85a5b6830b4a2892319069b1b',
	refunds: '32f9205ed3c603e7e9ba10264679f55d0989172b282fcdbee01bab69e92bf24e'
};

const textOf = (state: 'prelaunch' | 'launched', k: (typeof KEYS)[number]) =>
	htmlToText(render(documentsByState[state][k]).body);

/** What a reader sees: tags and comments gone, entities decoded, whitespace collapsed. */
const visible = (html: string) =>
	html
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<\/?(a|strong|em)\b[^>]*>/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();

/** The .txt with its own decoration (bullets, table bars, link targets) removed. */
const undecorated = (txt: string) =>
	txt
		.replace(/^(- |\d+\) )/gm, '')
		.replace(/ \((https?:\/\/[^)\s]+|[^)\s]+@[^)\s]+)\)/g, '')
		.replace(/ \| /g, ' ')
		.replace(/\s+/g, ' ')
		.trim();

describe('legal documents · pre-launch state is exactly today\'s text', () => {
	for (const k of KEYS)
		it(`${k}: source equals origin/master's page`, () => {
			const src = readFileSync(join(APP_ROOT, `src/lib/legal/${k}.prelaunch.svelte`), 'utf8').replace(/\r\n/g, '\n');
			expect(sha(src)).toBe(PRELAUNCH_SOURCE_SHA[k]);
		});
});

describe('legal documents · launched state', () => {
	for (const k of KEYS) {
		it(`${k}: approved text, hashed as the release gate hashes it`, () => {
			expect(legalHash(textOf('launched', k))).toBe(APPROVED_LAUNCH_HASH[k]);
		});
		it(`${k}: none of the pre-launch or early-access statements`, () => {
			const t = textOf('launched', k);
			// Whole phrases: "QNix has not opened" (the 24-month rule) is true at launch, not a closed-gate claim.
			for (const w of ['paused', 'under construction', 'no sign-in', 'not open', 'early access'])
				expect(t, w).not.toMatch(new RegExp('\\b' + w + '\\b', 'i'));
		});
	}
	it('dated 2026-11-13; pre-launch keeps master\'s date', () => {
		for (const k of KEYS) {
			expect(textOf('launched', k)).toContain('Last updated 2026-11-13');
			expect(textOf('prelaunch', k)).toContain('Last updated 2026-10-24');
		}
	});
	it('the privacy policy names Google as the sign-in provider', () => {
		expect(textOf('launched', 'privacy')).toContain('Google | Sign-in provider for the Starhold Account.');
		expect(textOf('prelaunch', 'privacy')).not.toContain('Sign-in provider');
	});
});

describe('legal documents · plain text twin', () => {
	for (const state of ['prelaunch', 'launched'] as const)
		for (const k of KEYS) {
			it(`${state}/${k}: text carries the same words as the HTML page`, () => {
				const html = render(documentsByState[state][k]).body;
				expect(undecorated(textOf(state, k))).toBe(visible(html));
			});
			it(`${state}/${k}: stable shape (LF, no trailing blanks, one final newline, deterministic)`, () => {
				const t = textOf(state, k);
				expect(t).not.toContain('\r');
				expect(t.split('\n').some((l) => l !== l.trimEnd())).toBe(false);
				expect(t.endsWith('\n') && !t.endsWith('\n\n')).toBe(true);
				expect(textOf(state, k)).toBe(t);
				expect(t).not.toMatch(/<|&amp;|&#/);
			});
		}
});

describe('legal documents · switch drives the page and the endpoint together', () => {
	afterEach(() => vi.doUnmock('../launch'));
	for (const launched of [false, true]) {
		it(`LAUNCHED=${launched}: endpoint serves text/plain and the active state's text`, async () => {
			vi.resetModules();
			vi.doMock('../launch', () => ({ LAUNCHED: launched, pick: <T>(off: T, on: T): T => (launched ? on : off) }));
			const { render: freshRender } = await import('svelte/server');
			const { legalTextResponse } = await import('./response');
			const { documents } = await import('./index');
			for (const k of KEYS) {
				const res = legalTextResponse(k);
				expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
				const body = await res.text();
				expect(body).toBe(htmlToText(freshRender(documents[k]).body));
				expect(body).toBe(textOf(launched ? 'launched' : 'prelaunch', k));
			}
		});
	}
});