// Shared product status labels (STAR-145, ledger Q15/Q33/Q59/Q61).
// One fixed vocabulary of five labels (four once LAUNCHED, see launch.ts), used everywhere a product shows a status.
// Mirror of docs/shared/labels.json (vendored by the docs and Hangar builders);
// src/lib/labels.test.ts fails if the two drift apart.
import { pick } from './launch';

export const LABEL_OPEN_FREE = 'Open · free';
export const LABEL_OPEN_PAID = 'Open · early access, paid plans';
export const LABEL_OPEN = 'Open'; // launch wording (STAR-142): replaces the invitation and early-access labels
export const LABEL_OPEN_PAID_LAUNCHED = 'Open · paid plans'; // launch wording for products that sell paid plans (operator, 2026-11-13)
export const LABEL_INVITE_ONLY = 'Invitation only';
export const LABEL_IN_DEVELOPMENT = 'In development';
export const LABEL_RETIRED = 'Retired';

/** The labels in use, and the only values a product label may take (five before launch, four after). */
const PRE_LAUNCH_LABELS = [
	LABEL_OPEN_FREE,
	LABEL_OPEN_PAID,
	LABEL_INVITE_ONLY,
	LABEL_IN_DEVELOPMENT,
	LABEL_RETIRED
] as const;
const LAUNCHED_LABELS = [
	LABEL_OPEN_FREE,
	LABEL_OPEN,
	LABEL_OPEN_PAID_LAUNCHED,
	LABEL_IN_DEVELOPMENT,
	LABEL_RETIRED
] as const;

export type Label = (typeof PRE_LAUNCH_LABELS)[number] | typeof LABEL_OPEN
	| typeof LABEL_OPEN_PAID_LAUNCHED;

export const LABELS: readonly Label[] = pick<readonly Label[]>(PRE_LAUNCH_LABELS, LAUNCHED_LABELS);

/** Per-product label, keyed by product id (matches static/products.json ids). */
export const PRODUCT_LABELS: Record<string, Label> = pick<Record<string, Label>>(
	{
		umbermark: LABEL_OPEN_PAID,
		zenithmark: LABEL_OPEN_FREE,
		render: LABEL_INVITE_ONLY,
		status: LABEL_INVITE_ONLY,
		account: LABEL_IN_DEVELOPMENT, // Starhold Account
		starbot: LABEL_IN_DEVELOPMENT,
		shushgame: LABEL_OPEN_FREE,
		qnix: LABEL_IN_DEVELOPMENT,
		'hangar-hosting': LABEL_RETIRED,
		'custom-bots': LABEL_RETIRED
	},
	{
		umbermark: LABEL_OPEN_PAID_LAUNCHED,
		zenithmark: LABEL_OPEN,
		render: LABEL_OPEN_PAID_LAUNCHED,
		status: LABEL_OPEN_PAID_LAUNCHED,
		account: LABEL_OPEN, // Starhold Account: sign in with Google at ACCOUNT_URL
		starbot: LABEL_IN_DEVELOPMENT,
		shushgame: LABEL_OPEN_FREE,
		qnix: LABEL_IN_DEVELOPMENT,
		'hangar-hosting': LABEL_RETIRED,
		'custom-bots': LABEL_RETIRED
	}
);

export function labelFor(id: string): Label {
	const l = PRODUCT_LABELS[id];
	if (!l) throw new Error(`no status label for product ${id}`);
	return l;
}
