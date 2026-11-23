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

// PERI-15: download + "official sources" section. OFF until the owner says go (new icon PERI-10,
// release go-ahead, Play Console key check). While false, /peridot renders exactly as before; a
// test pins that against a captured copy. Turning it on needs every value below filled in: a
// test refuses `true` while any is still null.

/** Master switch for the download and official-sources sections. */
export const PERIDOT_DOWNLOAD_ENABLED = false;

/** Public signing certificate of every official copy (Play and sideload). Fingerprints are public. */
export const PERIDOT_CERT_SHA256 =
	'91:1E:4D:E3:4F:CD:D2:DA:9C:71:D1:FB:FB:43:88:DC:3E:B8:04:4A:AE:59:AA:52:01:86:9C:52:C7:BA:89:A4';

/** The release being offered. All null until a release is approved; fill from SHA256SUMS.txt. */
export const PERIDOT_RELEASE: {
	version: string;
	build: number;
	apkUrl: string;
	apkFileName: string;
	apkSha256: string;
} | null = null;

/** Other official sources. Null = not live, so the page does not mention them. Add only real, owner-approved ones. */
export const PERIDOT_OTHER_SOURCES: {
	githubRelease: string | null;
	zapstore: string | null;
	obtainium: string | null;
} = { githubRelease: null, zapstore: null, obtainium: null };
