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
	capabilities: copy.capabilities,
	work: copy.work,
	principles: copy.principles,
	operator: copy.operator,
	contact: copy.contact,
	automation: copy.automation,
	customBots: copy.customBots,
	qnix: copy.qnix,
	shushgame: copy.shushgame,
	site: copy.site
}).join('\n');

const EVIDENCE_CLAIMS = evidence.items.map((i) => i.claim).join('\n');
const SURFACE = [COPY_STRINGS, marketingText(), EVIDENCE_CLAIMS].join('\n');

/** The home page as a reader meets it: hero + the seven sections below it. */
const HOME_TEXT = collectStrings({
	home: copy.home,
	capabilities: copy.capabilities.items,
	work: copy.work.items,
	principles: copy.principles,
	operatorTeaser: { lede: copy.operator.lede, certs: copy.operator.certs, day: copy.operator.dayJob },
	chrome: { strapline: copy.site.strapline, hangar: 'Hangar' }
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

	it('A2.4 first person singular: no corporate we/our/ours', () => {
		expect(findTerms(SURFACE, ['we', 'our', 'ours', "we're", "we've", "we'll"])).toEqual([]);
	});

	it('A2.5 Kyle Green is named on the home page and on the operator page', () => {
		expect(HOME_TEXT).toContain('Kyle Green');
		expect(collectStrings(copy.operator).join('\n')).toContain('Kyle Green');
		expect(copy.site.operator).toBe('Kyle Green');
	});

	it('A2.6 metaphor budget: <=8 on the home page, <=2 in the hero', () => {
		expect(countTerms(HOME_TEXT, METAPHORS)).toBeLessThanOrEqual(8);
		expect(countTerms(HERO_TEXT, METAPHORS)).toBeLessThanOrEqual(2);
	});

	it('A2.7 commerce wording stays plain', () => {
		const cart = templateText(read('src/routes/cart/+page.svelte'));
		expect(cart).toMatch(/checkout|continue to payment/i);
		expect(findTerms(cart, BANNED_COSPLAY)).toEqual([]);
		// the intake button is a verb a human uses, not a radio operator
		expect(findTerms(templateText(read('src/lib/components/IntakeForm.svelte')), BANNED_COSPLAY)).toEqual([]);
	});

	it('A2.8 copy.ts is the SSOT and "Add to cart" survives verbatim', () => {
		expect(read('src/lib/content/copy.ts').length).toBeGreaterThan(500);
		expect(copy.home.hero.h1.length).toBeGreaterThan(0);
		expect(templateText(read('src/lib/components/BotConfigurator.svelte'))).toContain('Add to cart');
	});
});
