// STAR-301: everything on /peridot that waits on a person's answer lives here, so filling it in
// later is a one-line edit in this file and nowhere else.
//
// Names are added ONLY on the owner's instruction (PERI-11). Never add, guess or infer a name,
// and never publish the person who inspired the app without the owner's explicit instruction.

/** Supporters to thank by name, each exactly as that person asked to appear. Empty until the owner supplies names. */
export const PERIDOT_SUPPORTERS: readonly string[] = [];

/** The dedication line. Same default as the app (about_content.dart). Change only on the owner's instruction. */
export const PERIDOT_DEDICATION = 'For the friend who asked me to build this.';

/** The one Patreon link on the page. Link text is the plain name: a thank you, never an ask. */
export const PATREON_URL = 'https://www.patreon.com/cw/Quadstronaut';
export const PATREON_LINK_TEXT = 'Starhold on Patreon';

/** Google Play address. Null until the app is listed (PERI-10); the page then says "Coming to Google Play." */
export const PERIDOT_PLAY_URL: string | null = null;
