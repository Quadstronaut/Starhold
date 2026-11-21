// ─────────────────────────────────────────────────────────────────────────────
// THE YEARLY PLANS SWITCH (SHIP-6). One constant, the only place to flip.
//
//   YEARLY_PLANS = false   today: the pricing page shows monthly prices only, byte for byte as before
//                          (src/routes/pricing/pricing.yearly.test.ts holds it to a golden copy).
//   YEARLY_PLANS = true    the pricing page adds one line per product with the yearly price, "charged once
//                          a year", and the saving as a plain fact. No badge, no pre-selection: buying
//                          happens on the Starhold Account, where monthly stays the first button.
//
// Switch on only together with the Starhold Account (Starship STARSHIP_YEARLY_PLANS=1 and the yearly
// Polar products in STARSHIP_POLAR_PRODUCTS_YEARLY), and only once the operator has confirmed the prices
// and the yearly refund rule is in the published Terms and Refund Policy. Keep the shape
// `export const YEARLY_PLANS = <bool>;`.
// ─────────────────────────────────────────────────────────────────────────────
export const YEARLY_PLANS = false;

/** One plan as the pricing page names it: its monthly price (must match the availability line) and its yearly one. */
export type YearlyPlan = { plan: string; monthly: number; yearly: number };

/**
 * Working yearly prices in USD: ten months for twelve. The operator has NOT confirmed them; this table is
 * the one place to change them (Starship's catalog.yaml `yearly_price_cents` must say the same).
 * Starbot is absent on purpose: its website plans have no yearly option yet, and its Discord prices never do.
 */
export const YEARLY_PRICES: Record<string, YearlyPlan[]> = {
	umbermark: [
		{ plan: 'Solo', monthly: 5, yearly: 50 },
		{ plan: 'Pro', monthly: 19, yearly: 190 },
		{ plan: 'Agency', monthly: 49, yearly: 490 }
	],
	zenithmark: [
		{ plan: 'Monitor', monthly: 5, yearly: 50 },
		{ plan: 'Monitor 5', monthly: 19, yearly: 190 }
	],
	render: [
		{ plan: 'Hobby', monthly: 5, yearly: 50 },
		{ plan: 'Pro', monthly: 19, yearly: 190 },
		{ plan: 'Scale', monthly: 49, yearly: 490 }
	],
	status: [
		{ plan: 'Private', monthly: 5, yearly: 50 },
		{ plan: 'MSP', monthly: 19, yearly: 190 }
	]
};
export const SUITE_YEARLY: YearlyPlan = { plan: 'Starhold Suite', monthly: 49, yearly: 490 };

const fact = (p: YearlyPlan) => `${p.plan} $${p.yearly} a year instead of $${p.monthly * 12}`;

/** The yearly sentence for a product, built only from YEARLY_PRICES. Null when it has no yearly plans. */
export function yearlyText(id: string): string | null {
	const plans = YEARLY_PRICES[id];
	if (!plans?.length) return null;
	return `Or pay yearly, charged once a year: ${plans.map(fact).join('; ')}. Renews each year until you cancel.`;
}

/** The note shown under a product's prices: its own note, then the yearly sentence while the switch is on. */
export function noteWithYearly(id: string, note: string | undefined, on = YEARLY_PLANS): string | undefined {
	const y = on ? yearlyText(id) : null;
	if (!y) return note;
	return note ? `${note} ${y}` : y;
}

/** Text appended to the Suite line ("" while the switch is off, so the line is exactly what it was). */
export function suiteYearlySuffix(on = YEARLY_PLANS): string {
	return on
		? ` Or $${SUITE_YEARLY.yearly} a year, charged once a year, instead of $${SUITE_YEARLY.monthly * 12} for 12 monthly payments. Renews each year until you cancel.`
		: '';
}
