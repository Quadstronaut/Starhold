// ─────────────────────────────────────────────────────────────────────────────
// THE LAUNCH SWITCH (STAR-142). One constant, the only place to flip.
//
//   LAUNCHED = false  today's wording: invitation only, checkout paused.
//   LAUNCHED = true   launch wording: every gate open, sign in, paid plans on sale.
//
// Everything on the storefront that differs between the two states reads
// pick(offValue, onValue) from here. Other places that follow this constant:
//   * brand/errors/build.mjs and deploy/launch-overlay.mjs read this exact line
//     (they match `export const LAUNCHED = <bool>;`, so keep that shape).
//   * apps/hangar and apps/docs are static: their launch text lives in
//     deploy/launch-overlay/*.json and is applied at build time (deploy/DEPLOY.md,
//     "Launch day").
// Flip it, run the proof in deploy/DEPLOY.md, deploy. Nothing else to hand-edit.
// ─────────────────────────────────────────────────────────────────────────────
export const LAUNCHED = false;

/** Pick the value for the current state. Both arguments are plain data. */
export function pick<T>(off: T, on: T): T {
	return LAUNCHED ? on : off;
}

/** Starhold Account (the Starship service): Google sign-in, plans, export, delete. */
export const ACCOUNT_URL = 'https://starship.starhold.app';
