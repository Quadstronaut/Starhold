// ─────────────────────────────────────────────────────────────────────────────
// THE STARBOT SWITCH (STARBOT-28). One constant, the only place to flip.
//
//   STARBOT_AVAILABLE = false   Starbot is not open: the card says "Not open yet." and its button is disabled.
//   STARBOT_AVAILABLE = true    Starbot is open: "Add to Discord" links to the dashboard.
//
// Everything on the storefront that differs between the two states reads this constant.
// The static apps (hangar, docs, docs/shared) cannot import it, so their wording lives in
// deploy/launch-overlay/starbot-pairs.mjs and `node deploy/starbot-switch.mjs --apply` moves them
// (it matches `export const STARBOT_AVAILABLE = <bool>;`, so keep that shape).
// Launch also needs: the Starbot dashboard switch (STARBOT_AVAILABLE=true in its env), the Starship gate for
// product starbot, and the new Polar products. Flip this, run --apply, deploy.
// ─────────────────────────────────────────────────────────────────────────────
export const STARBOT_AVAILABLE = true;

/** Where the Add button goes once Starbot is open. */
export const STARBOT_ADD_URL = 'https://dash.starhold.app';

/** The single availability line. Mirror of the "starbot" key in docs/shared/availability.json. */
export const STARBOT_AVAILABILITY = STARBOT_AVAILABLE
	? 'Open: free to add; Plus $5, Pro $19 a month, two servers each'
	: 'Not open yet.';

/** The primary button's text. While closed it is shown disabled. */
export const STARBOT_ACTION = STARBOT_AVAILABLE ? 'Add to Discord' : 'Add to Discord: opening soon';
