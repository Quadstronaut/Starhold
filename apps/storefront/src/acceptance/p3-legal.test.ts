// STAR-146 · legal pages contract (ledger Q2/Q4/Q10/Q17/Q27/Q29/Q71/Q73).
// Raw source is read on purpose: the vendor-stub marker lives in an HTML comment.
import { describe, it, expect } from 'vitest';
import { read, templateText } from './_helpers';

const PAGES = {
	terms: 'src/routes/legal/terms/+page.svelte',
	privacy: 'src/routes/legal/privacy/+page.svelte',
	refunds: 'src/routes/legal/refunds/+page.svelte'
} as const;

const raw = (k: keyof typeof PAGES) => read(PAGES[k]);
const text = (k: keyof typeof PAGES) => templateText(raw(k)).replace(/ ([,.;])/g, '$1');

const CARVE_OUT = 'Nothing here limits rights you have under the consumer law where you live.';
const Q73 =
	'We never ask for your password, never send sign-in links by hand, and never look at your account unless you ask us to or the law requires it. Any access is logged.';
const Q71 =
	"If the report fails or isn't what we described, ask within 14 days and we refund it in full. EU/UK buyers keep their legal withdrawal rights.";

describe('legal pages · all three', () => {
	for (const k of Object.keys(PAGES) as (keyof typeof PAGES)[]) {
		it(`${k}: dated 2026-10-24, says Starhold not Starhold Software`, () => {
			expect(text(k)).toContain('Last updated 2026-10-24');
			expect(raw(k)).not.toMatch(/Starhold Software/);
		});
		it(`${k}: none of the retired or banned wording`, () => {
			for (const banned of [/Stripe/i, /Managed Ops/i, /hourly/i, /class[- ]action waiver/i, /continued use/i, /JoJo/i, /QuadstroNot/i, /QFlix/i, /\bcart\b/i, /gatus/i, /Postmark/i, /Turnstile/i, /Scaleway/i])
				expect(raw(k), String(banned)).not.toMatch(banned);
		});
	}
});

describe('terms', () => {
	it('keeps the LLC name line', () => {
		expect(text('terms')).toContain(
			'Copper Jerky LLC, an Arizona limited liability company doing business as Starhold'
		);
	});
	it('has the testing-period clause and the consumer-rights carve-out', () => {
		expect(text('terms')).toContain(
			'Starhold is under construction. Everything here is online for development and testing only, may change or break without notice, and is provided as-is with no warranty. Don\'t rely on it for anything important. Your privacy rights still apply.'
		);
		expect(text('terms')).toContain(CARVE_OUT);
	});
	it('venue, cap, informal step, merchant of record, Discord apps, donations', () => {
		const t = text('terms');
		expect(t).toContain('Pima County, Arizona');
		expect(t).toContain('the courts of the place where you live');
		expect(t).toMatch(/GREATER OF .*12 MONTHS.*US\$100/);
		expect(t).toContain('give us 30 days');
		expect(t).toContain('merchant of record');
		expect(t).toContain('your contract of sale is with the provider');
		expect(t).toContain('not membership in or access to any community');
		expect(t).toContain('buys no perks');
		expect(t).toContain('only to your misuse or illegal use');
		expect(t).toContain('does not count as agreeing');
		expect(t).toContain('refund the unused part');
	});
});

describe('privacy', () => {
	const t = () => text('privacy');
	it('has the operator-access sentence (Q73), address stub, US storage', () => {
		expect(t()).toContain(Q73);
		expect(t()).toContain('[POSTAL ADDRESS — pending PO box]');
		expect(t()).toContain('Data is stored in the United States');
		expect(t()).toContain('Umbermark, in early access with paid plans through Polar');
	});
	it('names exactly the wired vendors, with a transfer-mechanism stub each', () => {
		for (const v of ['Discord', 'Polar', 'Patreon', 'Backblaze B2', 'OVH']) expect(t()).toContain(v);
		expect(t().match(/\[transfer mechanism — lawyer\]/g)?.length).toBe(5);
	});
	it('carries the grep-able email-provider stub marker', () => {
		expect(raw('privacy')).toContain('<!-- VENDOR-STUB: email provider -->');
	});
	it('retention table rows with clock starts', () => {
		const rows: [string, string][] = [
			['Usage counts (anonymous)', '90 days'],
			['Abuse-prevention records', '1 year'],
			['Error logs', '30 days'],
			['Backups', 'within 30 days'],
			['Free scan reports', '30 days'],
			['Paid reports, unclaimed', '3 months'],
			['Contact messages', '90 days after we close the conversation'],
			['QNix notice list', '24 months'],
			['Purchase record', 'up to 7 years']
		];
		const src = raw('privacy');
		for (const [label, val] of rows) {
			const m = src.match(new RegExp(`<tr><td>${label.replace(/[()]/g, '\\$&')}</td><td>([^<]*)</td><td>([^<]*)`));
			expect(m, label).not.toBeNull();
			expect(m![1], label).toContain(val);
			expect(m![2].length, `${label} has a clock start`).toBeGreaterThan(3);
		}
		expect(t()).toContain('never more than 12 months from receipt');
	});
	it('pledge wording, no access logs, three-layer deletion, contact-form notice behaviour', () => {
		expect(t()).toContain('no third-party tracking and no per-person behaviour analytics');
		expect(t()).toContain('Our web servers keep no access logs');
		expect(t()).toContain('Anonymous');
		expect(t()).toContain('Pseudonymous');
		expect(t()).toContain('Deletion works in three layers');
		expect(t()).toContain('New invite request #id · product');
	});
});

describe('refunds', () => {
	it('one-off wording (Q71) and carve-out', () => {
		expect(text('refunds')).toContain(Q71);
		expect(text('refunds')).toContain(CARVE_OUT);
	});
	it('cancel and delete are separate choices, with the provider-processing note', () => {
		const t = text('refunds');
		expect(t).toContain('Run out the period');
		expect(t).toContain('Prorated refund now');
		expect(t).toContain('Delete now');
		expect(t).toContain('Delete at the end of the period');
		expect(t).toContain('refund issued, provider processing');
	});
});
