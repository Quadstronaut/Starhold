// STAR-146 · legal pages contract (ledger Q2/Q4/Q10/Q17/Q27/Q29/Q71/Q73).
// Raw source is read on purpose: the vendor-stub marker lives in an HTML comment.
import { describe, it, expect } from 'vitest';
import { read, templateText } from './_helpers';

const PAGES = {
	terms: 'src/lib/legal/terms.launched.svelte',
	privacy: 'src/lib/legal/privacy.launched.svelte',
	refunds: 'src/lib/legal/refunds.launched.svelte'
} as const;

const raw = (k: keyof typeof PAGES) => read(PAGES[k]);
const text = (k: keyof typeof PAGES) => templateText(raw(k)).replace(/ ([,.;])/g, '$1');

const CARVE_OUT = 'Nothing here limits rights you have under the consumer law where you live.';
const Q73 =
	'We never ask for your password, never send sign-in links by hand, and never look at your account unless you ask us to or the law requires it. Any access is logged.';
// Launch wording (approved 2026-11-13; shown only when LAUNCHED is true): none of the pre-launch "paused / testing / no sign-in" statements may remain.
const PRELAUNCH = /checkout is paused|nothing is for sale|when it reopens|under construction|testing period|no sign-in is open|until starhold account exists|once the account opens|once plans open/i;
const Q71 =
	"If the report fails or isn't what we described, ask within 14 days and we refund it in full. EU/UK buyers keep their legal withdrawal rights.";

const POLAR_USES_STRIPE = 'uses Stripe to process card payments';

describe('legal pages · all three', () => {
	for (const k of Object.keys(PAGES) as (keyof typeof PAGES)[]) {
		// All three amended 2026-11-17 (LEGAL-3) and again 2026-11-19 (LEGAL-4, operator approved): renewal, sanctions, copyright, Starbot data, Cloudflare delivery.
		const dated = '2026-11-19';
		it(`${k}: dated ${dated}, says Starhold not Starhold Software`, () => {
			expect(text(k)).toContain(`Last updated ${dated}`);
			expect(raw(k)).not.toMatch(/Starhold Software/);
		});
		it(`${k}: no pre-launch wording`, () => {
			expect(text(k)).not.toMatch(PRELAUNCH);
		});
		it(`${k}: none of the retired or banned wording`, () => {
			for (const banned of [/Stripe/i, /Managed Ops/i, /hourly/i, /class[- ]action waiver/i, /continued use/i, /JoJo/i, /QuadstroNot/i, /QFlix/i, /\bcart\b/i, /gatus/i, /Postmark/i, /Turnstile/i, /Scaleway/i])
				// Postmark (email) and Cloudflare Turnstile (bot check on the scan forms) are wired and are named in the
				// Privacy Policy only (STAR-271, STAR-278).
				// Stripe is named once per document, only as Polar's card processor (LEGAL-4, operator ruling 2026-11-19;
				// source https://polar.sh/legal/payment-processor-partners). Starhold has no Stripe account in the flow.
				if (!(k === 'privacy' && ['Postmark', 'Turnstile'].includes(banned.source))) expect(raw(k).replace(POLAR_USES_STRIPE, ''), String(banned)).not.toMatch(banned);
		});
		it(`${k}: names Stripe once, as Polar's card processor`, () => {
			expect(text(k)).toContain(POLAR_USES_STRIPE);
			expect(raw(k).match(/Stripe/g)).toHaveLength(1);
		});
	}
});

describe('terms', () => {
	it('keeps the LLC name line', () => {
		expect(text('terms')).toContain(
			'Copper Jerky LLC, an Arizona limited liability company doing business as Starhold'
		);
	});
	it('has the service-status clause and the consumer-rights carve-out', () => {
		expect(text('terms')).toContain(
			'Features may change as we build (see section 16). The services are provided as-is, as section 12 explains. Your privacy rights still apply.'
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
		// STAR-272 option C (operator, 2026-11-14): support, not a donation; a tier-named Discord role and nothing else.
		expect(t).toContain('it is support for the work, not a purchase, and it is not tax-deductible');
		expect(t).toContain('backers get a role in the Starhold Discord named after their tier, and nothing else');
		expect(t).toContain('There is no backer-only room; the Discord is open to everyone.');
		expect(t).toContain('Backing buys no product access, no discounts and no special support');
		expect(t).not.toMatch(/donation|no perks|patron-lounge/i);
		expect(t).toContain('only to your misuse or illegal use');
		expect(t).toContain('does not count as agreeing');
		expect(t).toContain('refund the unused part');
	});
	it('names the merchant of record, carves out open source (B1, M4, M7)', () => {
		const t = text('terms');
		expect(t).toContain('The merchant of record (today Polar) is the seller of record and issues refunds; we trigger them for you from our side.');
		expect(t).toContain('Our open-source code is covered by its own licence (for example MIT); these terms cover the hosted services.');
	});
});

describe('privacy', () => {
	const t = () => text('privacy');
	it('has the operator-access sentence (Q73), postal address, US storage', () => {
		expect(t()).toContain(Q73);
		expect(t()).toContain('Postal address: Copper Jerky LLC, 6917 W. Hedge Rose Dr, Tucson, AZ 85757, USA.');
		expect(t()).toContain('Data is stored in the United States');
		expect(t()).toContain('Each product (Umbermark, Zenithmark, Heliostat and Solatype) has its own privacy notice');
	});
	it('names exactly the wired vendors; no unfilled placeholders remain (STAR-142 B3)', () => {
		for (const v of ['Discord', 'Polar', 'Google', 'Porkbun', 'Patreon', 'Postmark', 'Cloudflare (Turnstile)', 'Cloudflare (R2)', 'Cloudflare (website delivery)', 'OVH']) expect(t()).toContain(v);
		expect(t()).not.toMatch(/\[[^\]]*(lawyer|pending|POSTAL|transfer mechanism)[^\]]*\]/i);
		// LEGAL-3 D6: Discord, Polar, Google, Patreon and Porkbun are independent controllers; the other four are processors.
		expect(t().match(/standard contractual terms \(see section 5\)/g)?.length).toBe(5);
		expect(t().match(/Its own controller, under its own privacy policy/g)?.length).toBe(5);
		expect(t()).toContain(
			'Transfers to our US processors rely on each processor\'s standard contractual terms; we are completing our transfer documentation with counsel.'
		);
	});
	it('names Google as sign-in provider and states only what is true about scopes and email', () => {
		expect(t()).toContain('Google learns that you signed in to Starhold');
		expect(t()).toContain('only if you tick the optional box to share it');
		expect(t()).toContain('We do not request your name, and we never receive your password.');
	});
	it('names the email provider; the stub marker is gone (STAR-271)', () => {
		expect(raw('privacy')).not.toContain('VENDOR-STUB');
		expect(t()).toContain('Postmark Email delivery.');
	});
	it('retention table rows with clock starts', () => {
		const rows: [string, string][] = [
			['Usage counts (anonymous)', '90 days'],
			['Abuse-prevention records', '24 hours to 1 year, depending on the product'],
			['Error logs', '30 days'],
			['Backups', 'within 30 days'],
			['Free scan reports', '30 days'],
			['Paid reports, unclaimed', '3 months'],
				['Starhold Account details', 'Until you delete the account'],
			['Contact messages', '90 days after we close the conversation'],
			['DysonSphere notice list', '24 months'],
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
		expect(t()).toContain(
			'We keep no request logs. Error logs can contain your IP for up to 30 days. Sign-in abuse limiting uses a keyed hash of your IP for 7 days. Admin access to account data through our tools is logged; that log is about us, not you.'
		);
		expect(t()).not.toContain('Our web servers keep no access logs');
		expect(t()).toContain('Anonymous');
		expect(t()).toContain('Pseudonymous');
		expect(t()).toContain('Deletion works in three layers');
		expect(t()).toContain('in a short notice reading "New message #id"');
		expect(t()).not.toMatch(/invite request|Invite requests|request for an invitation/i);
	});
	it('contact-form encryption and Discord boundary (M5)', () => {
		expect(t()).toContain(
			'Your message is encrypted with a public key before it is stored; only an offline key held by the operator can read it. Discord receives only the ticket number, in a short notice'
		);
	});
	it('export and delete are self-service, with the email fallback (B2)', () => {
		expect(t()).toContain('You can export and delete your data yourself from the account page. If you cannot, write to privacy@starhold.dev and we will do it within one month.');
		expect(t()).not.toMatch(/from the dashboard|we send your sign-in link/i);
	});
	it('email statement is true after launch and agrees with the DysonSphere notice (M6, STAR-271)', () => {
		expect(t()).toContain(
			'Our products send email through Postmark, from no-reply@starhold.app; replies go to hello@starhold.dev.'
		);
		// LEGAL-4: Starbot holds no address. The Starhold Account sends the plan-on-no-server notice (Starship df97479, Starbot 8731fe3).
		expect(t()).toContain('Starbot itself keeps no email address. Your Starhold Account holds your email address only if you chose to share it at sign-in. If a paid plan is on no server, the dashboard says so, and if your Starhold Account has your email address it sends you a service message about it: once each time that happens and, where we know the renewal date, once shortly before each renewal. It is not marketing.');
		expect(t()).not.toContain('Starbot sends no email');
		// Operator, 2026-11-19: nobody may read the row as "Starhold does not have your email".
		expect(t()).not.toContain('Starbot does not store your email address');
		expect(t()).toContain('Without a Starhold Account, or without a shared email address, you get the dashboard notice only.');
		expect(t()).not.toMatch(/starbot@starhold\.app|Starbot's service messages/);
		expect(t()).toContain('including the service messages your Starhold Account sends about a Starbot plan');
		// LEGAL-4, operator rulings 2026-11-19: two servers per paid subscription; Discord purchases.
		expect(t()).toContain('up to two for each paid subscription. One account can hold several subscriptions.');
		expect(t()).toContain('We receive no payment details from Discord.');
		expect(t()).not.toContain('the server it covers');
		expect(t()).toContain('We send only the email that is required to operate the service and maintain your account: sign-in and account notices, billing and refund notices, and alerts and updates you turned on, such as status-page subscriptions, monitoring alerts and score-drop alerts.');
		// LEGAL-3 D9: true before and after the Product updates box is switched on.
			expect(t()).toContain('We send no marketing email, upsells or newsletters unless you tick the Product updates box, which allows at most one email a month about Starhold products.');
			expect(t()).toContain('the unsubscribe link in every email');
			expect(t()).toContain('If you asked to be told when DysonSphere opens, we will email you once.');
		expect(t()).not.toContain('We do not send email yet');
	});
	it('Shush is marked as built today and Starbot as applying from the day it opens (M11, STARBOT-28)', () => {
		expect(t()).toContain('Shush as built today, and Starbot from the day it opens');
		expect(t()).toContain('This row applies from the day Starbot opens; Starbot is not available yet.');
		expect(t()).not.toMatch(/bot['’]s token|bot token is given|72 hours of paying/i);
		// LEGAL-4, operator ruling 2026-11-19: no bot tokens held; a removed server's data goes at once.
		expect(t()).toContain('Starbot never asks for a bot token and stores none.');
		expect(t()).toContain("If Starbot is removed from your server, that server's data is deleted right away, with no grace period.");
		expect(t()).not.toContain('48 hours later');
		expect(raw('privacy')).toMatch(/<tr><td>Starbot<\/td>/);
		expect(raw('privacy')).toMatch(/<tr><td>Shush<\/td>/);
	});
	it('Shush retention states the current rule, not the future one (B4)', () => {
		expect(t()).toContain('for thirty days, then it drops off');
		expect(t()).toContain('Erased 30 days after you use /hide-me in Discord, or after 12 months without playing.');
		expect(t()).toContain('/hide-me takes you off every list we show at once');
		expect(t()).not.toContain('rolls per round');
		expect(t()).not.toContain('in development');
	});
	it('says what the code does about cookies, Patreon data and Shush word counts (STAR-155)', () => {
		// Each sentence is backed by code: product cookie max-ages (90 days at most), QuadstroNot's 29 day sweep of
		// former patrons, Shush's per-day word counts and climb board.
		expect(t()).not.toContain('Our sites set no cookies');
		expect(t()).toContain('The Starhold websites (starhold.dev, starhold.fyi and starhold.app) set no cookies.');
		expect(t()).toContain('None lasts longer than 90 days, and none is used for advertising or tracking.');
		expect(t()).toContain('your Patreon user id, name, email, membership status, tier, pledge amount, last charge status, next charge date');
		expect(t()).toContain('While you are a patron, then deleted within 30 days');
		expect(t()).not.toContain('Patreon membership status and tier, if you back our work.');
		expect(t()).toContain('the words you type in the arena (including words read from images you post there), counted per day');
		expect(t()).toContain('A climb board shows your display name and lifetime XP.');
	});
});

describe('refunds', () => {
	it('has the self-service deletion rule with email fallback, and the merchant of record (B1, B2, M4)', () => {
		const t = text('refunds');
		expect(t).toContain('You can delete your account yourself from the account page. If you cannot, write to privacy@starhold.dev and we will do it within one month.');
		expect(t).toContain('The merchant of record (today Polar) is the seller of record and issues refunds; we trigger them for you from our side.');
	});
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
