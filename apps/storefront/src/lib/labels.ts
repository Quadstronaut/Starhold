// Shared product status labels (STAR-145, ledger Q15/Q33/Q59/Q61).
// One fixed vocabulary of five labels, used everywhere a product shows a status.
// Mirror of docs/shared/labels.json (vendored by the docs and Hangar builders);
// src/lib/labels.test.ts fails if the two drift apart.
export const LABEL_OPEN_FREE = 'Open · free';
export const LABEL_OPEN_PAID = 'Open · early access, paid plans';
export const LABEL_INVITE_ONLY = 'Invitation only';
export const LABEL_IN_DEVELOPMENT = 'In development';
export const LABEL_RETIRED = 'Retired';

/** The five labels, and the only values a product label may take. */
export const LABELS = [
	LABEL_OPEN_FREE,
	LABEL_OPEN_PAID,
	LABEL_INVITE_ONLY,
	LABEL_IN_DEVELOPMENT,
	LABEL_RETIRED
] as const;

export type Label = (typeof LABELS)[number];

/** Per-product label, keyed by product id (matches static/products.json ids). */
export const PRODUCT_LABELS: Record<string, Label> = {
	umbermark: LABEL_OPEN_PAID,
	zenithmark: LABEL_OPEN_FREE,
	render: LABEL_OPEN_PAID,
	status: LABEL_OPEN_PAID,
	account: LABEL_IN_DEVELOPMENT, // Starhold Account
	starbot: LABEL_IN_DEVELOPMENT,
	shushgame: LABEL_OPEN_FREE,
	qnix: LABEL_IN_DEVELOPMENT,
	'hangar-hosting': LABEL_RETIRED,
	'custom-bots': LABEL_RETIRED
};

export function labelFor(id: string): Label {
	const l = PRODUCT_LABELS[id];
	if (!l) throw new Error(`no status label for product ${id}`);
	return l;
}
