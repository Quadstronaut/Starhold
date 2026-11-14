// STAR-142: the three legal documents, one source per document per launch state.
//
// Each document exists twice, as a content component:
//   <name>.prelaunch.svelte  today's live text (checkout paused, no sign-in).
//   <name>.launched.svelte   the launch text the operator approved on 2026-11-13 (backing wording: 2026-11-14, STAR-272).
// pick() from ../launch chooses by the one launch switch. The HTML pages
// (routes/legal/<name>/+page.svelte) and the plain-text endpoints
// (routes/legal/<name>.txt/+server.ts) both read `documents` below, so the page
// and the text served to Starhold Account's release gate cannot drift apart.
import type { Component } from 'svelte';
import { pick } from '../launch';
import termsPre from './terms.prelaunch.svelte';
import termsOn from './terms.launched.svelte';
import privacyPre from './privacy.prelaunch.svelte';
import privacyOn from './privacy.launched.svelte';
import refundsPre from './refunds.prelaunch.svelte';
import refundsOn from './refunds.launched.svelte';

export type LegalKey = 'terms' | 'privacy' | 'refunds';
export const LEGAL_KEYS: readonly LegalKey[] = ['terms', 'privacy', 'refunds'];

export const documents: Record<LegalKey, Component> = {
	terms: pick(termsPre, termsOn),
	privacy: pick(privacyPre, privacyOn),
	refunds: pick(refundsPre, refundsOn)
};

/** Both states, for tests that must see each one regardless of the switch. */
export const documentsByState: Record<'prelaunch' | 'launched', Record<LegalKey, Component>> = {
	prelaunch: { terms: termsPre, privacy: privacyPre, refunds: refundsPre },
	launched: { terms: termsOn, privacy: privacyOn, refunds: refundsOn }
};