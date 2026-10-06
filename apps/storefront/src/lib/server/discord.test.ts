import { describe, it, expect } from 'vitest';
import { subscriptionCancelledEmbed, paymentFailedEmbed, type Embed } from './discord';

// Worst case: 25 bots (MAX_BOTS), each value at the 500-char Stripe metadata cap.
function bots(n: number, len = 500): Record<string, string> {
	const m: Record<string, string> = {};
	for (let i = 1; i <= n; i++) m[`bot_${i}`] = 'x'.repeat(len);
	return m;
}

function totalChars(e: Embed): number {
	return (
		e.title.length +
		(e.footer?.text.length ?? 0) +
		e.fields.reduce((n, f) => n + f.name.length + f.value.length, 0)
	);
}

const inv = { id: 'in_1', customer: 'cus_1', customer_email: 'a@example.com', amount_due: 100, attempt_count: 1 };

describe('alert embeds stay inside Discord limits', () => {
	for (const n of [0, 5, 20, 21, 22, 23, 24, 25]) {
		it(`${n} bots: payment-failed and cancel fit 25 fields and 6000 chars`, () => {
			const m = bots(n);
			const pf = paymentFailedEmbed({ ...inv, subscription_details: { metadata: m } });
			const sc = subscriptionCancelledEmbed({ id: 'sub_1', customer: 'cus_1', metadata: m });
			for (const e of [pf, sc]) {
				expect(e.fields.length).toBeLessThanOrEqual(25);
				expect(totalChars(e)).toBeLessThan(6000);
				for (const f of e.fields) expect(f.value.length).toBeLessThanOrEqual(1024);
			}
		});
	}

	it('adds an overflow summary when bots are dropped', () => {
		const pf = paymentFailedEmbed({ ...inv, subscription_details: { metadata: bots(25) } });
		const sc = subscriptionCancelledEmbed({ id: 'sub_1', metadata: bots(25) });
		// payment-failed: 5 fixed + 19 bots + summary = 25; cancel: 2 + 22 + summary = 25
		expect(pf.fields.at(-1)!.name).toBe('+ 6 more bots');
		expect(sc.fields.at(-1)!.name).toBe('+ 3 more bots');
		expect(pf.fields.length).toBe(25);
		expect(sc.fields.length).toBe(25);
	});

	it('adds no summary when every bot fits', () => {
		const sc = subscriptionCancelledEmbed({ id: 'sub_1', metadata: bots(23) });
		expect(sc.fields.length).toBe(25);
		expect(sc.fields.some((f) => f.name.startsWith('+'))).toBe(false);
	});
});
