// Tier A · A2 — voice contract.
// Sources of truth: the copy module (imported, so no comments are scanned) and
// the literal template text of every marketing surface.
import { describe, it, expect } from 'vitest';
import * as copy from '../lib/content/copy';
import evidence from '../lib/content/evidence.json';
import {
	read,
	templateText,
	marketingText,
	collectStrings,
	findTerms,
	countTerms,
	BANNED_COSPLAY,
	BANNED_FILLER,
	BANNED_SOCIAL_PROOF,
	METAPHORS
} from './_helpers';

/** Every marketing string in copy.ts, minus the stats import re-export. */
const COPY_STRINGS = collectStrings({
	home: copy.home,
	principles: copy.principles,
	contact: copy.contact,
	services: copy.services,
	faq: copy.faq,
	invite: copy.invite,
	account: copy.account,
	comingSoon: copy.comingSoon,
	qnix: copy.qnix,
	shush: copy.shush,
	site: copy.site
}).join('\n');

const EVIDENCE_CLAIMS = evidence.items.map((i) => i.claim).join('\n');
const SURFACE = [COPY_STRINGS, marketingText(), EVIDENCE_CLAIMS].join('\n');

/** The home page as a reader meets it: hero + the seven sections below it. */
const HOME_TEXT = collectStrings({
	home: copy.home,
	services: copy.services,
	faq: copy.faq,
	comingSoon: copy.comingSoon,
	principles: copy.principles,
	chrome: { strapline: copy.site.strapline, hangar: 'Hangar', status: 'Fleet status' }
}).join('\n');

const HERO_TEXT = collectStrings(copy.home.hero).join('\n');

describe('A2 · voice', () => {
	it('A2.1 the cosplay lexicon is gone from every marketing surface', () => {
		expect(findTerms(SURFACE, BANNED_COSPLAY)).toEqual([]);
	});

	it('A2.2 no filler, superlatives, or self-awarded expertise', () => {
		expect(findTerms(SURFACE, BANNED_FILLER)).toEqual([]);
	});

	it('A2.3 no invented social proof, team language, or client counts', () => {
		expect(findTerms(SURFACE, BANNED_SOCIAL_PROOF)).toEqual([]);
		// no numeric client/customer/project counts either
		expect(SURFACE).not.toMatch(/\b\d+\s*\+?\s*(clients?|customers?|projects?|companies)\b/i);
	});

	it('A2.4 we voice: the home page says "we", and no first person singular appears anywhere', () => {
		// STAR-145 ruling 9 inverts the old rule. "we" is the voice; "I", "me",
		// "my" and friends are not used on any marketing surface, including the
		// Who runs it note (which says "We're one person in Arizona").
		expect(HOME_TEXT).toMatch(/(?<![\w-])we(?![\w-])/i);
		const singular = ['I', "I'm", "I've", "I'll", "I'd", 'me', 'my', 'mine', 'myself'];
		// case-sensitive for "I" so that "i" inside words and lists cannot trip it
		// FAQ questions are the visitor's own words (What can I use today?), so they are exempt.
		let scanned = SURFACE;
		for (const item of copy.faq.items) scanned = scanned.replace(item.q, '');
		const hits = singular.filter((t) =>
			new RegExp("(?<![\\w-])" + t.replace(/'/g, "['’]") + "(?![\\w-])", t === 'I' || t.startsWith("I'") ? '' : 'i').test(scanned)
		);
		expect(hits).toEqual([]);
	});

	it('A2.4b the only note about who is behind the we is the Who runs it section', () => {
		expect(copy.home.operator.lede).toBe('We’re one person in Arizona. Whoever answers your message also runs the servers.');
		const elsewhere = collectStrings({ hero: copy.home.hero, services: copy.services, faq: copy.faq, principles: copy.principles }).join('\n');
		expect(elsewhere).not.toMatch(/one person/i);
	});
	it('A2.5 the operator goes by Quadstronaut', () => {
		expect(HOME_TEXT).toContain('Quadstronaut');
		expect(collectStrings(copy.home.operator).join('\n')).toContain('Quadstronaut');
		expect(copy.site.operator).toBe('Quadstronaut');
	});

	// Regression guard: LinkedIn never appears on any marketing surface.
	it('A2.9 LinkedIn never appears anywhere on the marketing surface', () => {
		expect(SURFACE).not.toMatch(/linkedin/i);
	});

	it('A2.6 metaphor budget: <=8 on the home page, <=2 in the hero', () => {
		expect(countTerms(HOME_TEXT, METAPHORS)).toBeLessThanOrEqual(8);
		expect(countTerms(HERO_TEXT, METAPHORS)).toBeLessThanOrEqual(2);
	});

	it('A2.7 commerce wording stays plain', () => {
		// the intake button is a verb a human uses, not a radio operator
		expect(findTerms(templateText(read('src/lib/components/IntakeForm.svelte')), BANNED_COSPLAY)).toEqual([]);
	});

	it('A2.10 pass-1 wording: honest state, will-cost, DevTools scope, Open means, one availability line each (STAR-142)', () => {
		expect(HOME_TEXT).toContain('Checkout is paused; nothing is for sale today. These rules apply when it reopens.');
		expect(HOME_TEXT).toContain('what it will cost');
		expect(HOME_TEXT).not.toContain('what it costs');
		expect(HOME_TEXT).toContain('Open DevTools: every request goes to our own hosts.');
		expect(HOME_TEXT).toContain('Open means you can use it now, during testing; it is still under development.');
		expect(HOME_TEXT).not.toMatch(/Coming soon/);
		expect(collectStrings(copy.shush).join('\n')).toContain('Names stay on the public list until you ask us to remove them');
		const lines = copy.serviceItems.map((s) => s.availability);
		expect(lines.every((l) => l.length > 0)).toBe(true);
		expect(copy.serviceItems.find((s) => s.id === 'umbermark')!.availability).toBe('Free scans open; purchases paused');
		expect(copy.serviceItems.find((s) => s.id === 'umbermark')!.note).toBeUndefined();
	});

	it('A2.8 copy.ts is the SSOT', () => {
		expect(read('src/lib/content/copy.ts').length).toBeGreaterThan(500);
		expect(copy.home.hero.h1.length).toBeGreaterThan(0);
	});
});
