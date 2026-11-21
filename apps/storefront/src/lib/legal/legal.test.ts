// STAR-142: legal documents in both launch states, and their plain-text twins.
//   prelaunch : the sources are byte-for-byte what origin/master served before the switch existed.
//   launched  : the text the operator approved on 2026-11-13, with Terms section 9 and the two Patreon rows of the
//               Privacy Policy as approved on 2026-11-14 (STAR-272 option C: a tier-named Discord role, nothing else), pinned by the same hash Starhold Account's
//               release gate computes (gate.legal_hash), so the served text can be checked against it.
//               Privacy Policy amended after launch (STAR-271, DRAFT until the operator approves): Postmark named as the
//               email provider, the invite-request rows removed, dated 2026-11-14.
//               Amended 2026-11-17 (operator approved): the QNix notice renamed DysonSphere (QNIX-45) and a
//               voicemail line with 90-day retention added (STAR-292).
//               Amended 2026-11-15 (STAR-155, operator approved): cookies, the Patreon data held and its 30 day
//               deletion, and the Shush row now say what the code does.
//               Amended 2026-11-17 (LEGAL-3, operator approved, all three documents): postal address, Google mailbox and
//               Porkbun as recipients, independent controllers relabelled, minimum age 16, "within one month",
//               purchase-record basis, account and abuse retention rows, deletion timing, Product updates email, Turnstile.
//               Amended 2026-11-19 (STARBOT-28, operator standing approval): Starbot is one shared bot. The Privacy row says it
//               applies from the day Starbot opens; the bot-token deadline is removed from the Refund Policy.
//               Amended 2026-11-19 (LEGAL-4, operator ruling): Privacy only. Starbot stores no bot token; when Starbot is
//               removed from a server, that server's data is deleted right away (was 48 hours later).
//               Amended 2026-11-19 (LEGAL-4, second pass): Privacy only. Up to two servers per paid subscription, purchases
//               inside Discord, and Starbot sends no email (its Postmark mentions removed).
//               Amended 2026-11-19 (LEGAL-4, third pass, all three documents): Polar is named as the seller and Stripe as
//               the card processor Polar uses (https://polar.sh/legal/payment-processor-partners).
//               Amended 2026-11-19 (LEGAL-4, fourth pass): Privacy only. A paid Starbot plan on no server: the Starhold
//               Account sends a service message; Starbot still stores no address.
//               Amended 2026-11-19 (LEGAL-4, fifth pass): Privacy only. The Starbot row says the Starhold Account holds
//               the email address if it was shared at sign-in; no shared address means the dashboard notice only.
//               Amended 2026-11-20 (STARBOT-45, operator approved): Terms section 8a Starbot; Privacy Starbot row says a removed
//               server stops at once and its data, backup copy included, goes within about five minutes.
//               Amended 2026-11-20 (STARBOT-45, operator approved): Privacy Starbot row opens with "This row applies to
//               Starbot." (was "This row applies from the day Starbot opens; Starbot is not available yet.").
//               Amended 2026-11-20 (STARBOT-45, operator: implement, lawyer reviews the live site): Privacy Starbot
//               retention cell says the backup copy goes once (self-delete included); Refunds says a plan bought inside
//               Discord is refunded under Discord's rules, through Discord.
//               Amended 2026-11-20 at the Starbot open (STARBOT-45): Privacy section heading and note no longer say the
//               Starbot row applies "from the day Starbot opens".
//               Amended 2026-11-21 (SHIP-6, DRAFT, NOT YET APPROVED OR PUBLISHED): Terms section 6 and the Refund Policy
//               say a plan is monthly or yearly, a yearly plan renews once a year with an email about 30 days before,
//               moving between monthly and yearly is cancel-then-start, and a yearly prorated refund covers the unused year.
//               Amended 2026-11-21 (SHIP-6, operator ruling on upgrades): an upgrade is charged in full and starts that
//               day; the old plan's unused part is refunded pro rata with nothing held back; yearly -> monthly is cancel-then-start.
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
	terms: '21e50247c66fedaa8ce65a2e6532629f73de01779f140183914736606be6f372',
	privacy: '8d2d9ef6bf9de0652321f1d0819ce191a313b8f7d4ba04fc8a1ad34d77cd11b8',
	refunds: '41d8837e8e4cd9a6f639a7f6776d45beee9a02c0cee93da7cf4d29a091bc6877'
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
	// SHIP-6 (yearly plans, DRAFT held for the operator's yearly refund ruling): Terms and Refunds dated 2026-11-21.
	const LAUNCHED_DATE: Record<(typeof KEYS)[number], string> = { terms: '2026-11-21', privacy: '2026-11-19', refunds: '2026-11-21' };
	it('dated (LEGAL-4, SHIP-6); pre-launch keeps master\'s date', () => {
		for (const k of KEYS) {
			expect(textOf('launched', k)).toContain('Last updated ' + LAUNCHED_DATE[k]);
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