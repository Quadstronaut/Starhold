// Hangar hosting content: what the $19/app/month product includes, what it does not, and how onboarding works.
// Price lives in rates.ts (hangarHostingAppMonthlyUsd); no price literal in the page template.
// Marketing route, so first person singular only (acceptance A2.4 bans "we"/"our").

export const SUMMARY =
	"I run your containerized app, static site or bot on Starhold's own servers: rootless containers, nightly backups, TLS, a public status page, patched hosts. Flat, nothing metered. You keep your code and your data; I keep it running.";

export const INCLUDED: readonly string[] = [
	'Rootless containers on Starhold-run servers',
	'Nightly backups',
	'TLS certificates, issued and renewed',
	'A public status page',
	'Patched hosts',
	'Discord support role'
];

export const NOT_INCLUDED: readonly string[] = [
	'No managed databases. I do not run or administer databases; bring an external one.',
	'No 24/7 SLA. Support is best-effort, business days.'
];

export const ONBOARDING: readonly string[] = [
	'Send the intake form.',
	'I containerize the app, or you hand me a compose file.',
	'It goes live within a week.'
];

/** Terms sentence shown on /legal/services and /legal/refunds so both say the same thing. */
export const BILLING_TERMS =
	'Hangar hosting is billed monthly, per app. You can cancel any time; nothing is prorated, and your data is exported on request within 14 days.';