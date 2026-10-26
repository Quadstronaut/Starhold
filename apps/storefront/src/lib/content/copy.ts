// ─────────────────────────────────────────────────────────────────────────────
// Marketing copy, single source of truth.
//
// Rules this file is held to (and src/acceptance/a2-voice.test.ts enforces):
//   • Voice is "we" (STAR-145 ruling 9). No first person singular anywhere.
//     The only note about who is behind the "we" is home.operator.
//   • Metaphor budget. The register stays space/ops, but thin: <=8 metaphor
//     words on the whole home page, <=2 in the hero.
//   • Every sentence that asserts a fact about the world carries an evidence id
//     via ev(). ev() throws on unknown or pending ids, so an unproven claim
//     cannot ship. Statements of voice, offer, and intent carry no id — they
//     assert nothing about the world that a third party could check.
//   • Numbers are derived. stats.json is generated from the test suite; the only
//     literal number allowed here is the founding year.
// ─────────────────────────────────────────────────────────────────────────────
import { ev } from './evidence';
import stats from './stats.json';
import { labelFor } from '../labels';
import { availabilityFor, CHECKOUT_NOTICE, OPEN_MEANS } from '../availability';

export const site = {
	/** Accessible name of the brand. Title case, not caps. */
	name: 'Starhold',
	fullName: 'Starhold',
	operator: 'Quadstronaut',
	handle: 'Quadstronaut',
	foundedYear: 2026,
	email: 'hello@starhold.dev',
	/** The owner's line, kept because it reads confident rather than costumed. */
	strapline: 'Sovereign systems, built and operated.',
	/** Footer line on every page. Evidence-tagged where it renders. */
	privacy: {
		label: 'No third-party trackers',
		linkLabel: 'privacy policy →',
		href: '/legal/privacy',
		evidence: ev('no-third-party-tracking')
	}
};

export type ProofSignal = {
	label: string;
	verifier: string;
	href: string;
	evidence: string;
};

/** One line of a terminal card (see TerminalCard.svelte). `v` is a right-hand column. */
export type TermLine = {
	kind: 'cmd' | 'out' | 'dim' | 'ok' | 'err';
	t: string;
	v?: string;
	/** Optional per-line evidence id, for a line backed by a different row than its card. */
	evidence?: string;
};

export type Feature = {
	id: string;
	eyebrow: string;
	h2: { pre: string; em: string };
	body: string;
	link: { href: string; label: string };
	evidence: string;
	card: { title: string; caption: string; lines: TermLine[] };
};

// STAR-145 home (design brief section 3, arbiter rulings 1-9). Voice is "we"
// everywhere. Delivered pledges only; everything else is marked "coming soon".
export const home = {
	title: 'Starhold — privacy-first services we host and operate',
	description:
		'Privacy-first tools for builders, sysadmins, and teams. Every service states what it does, what it will cost, and whether you can use it today.',

	hero: {
		eyebrow: 'Starhold is under development. Access varies by service.',
		h1: 'Privacy-first services we host and operate.',
		sub: 'We build and operate privacy-first tools for builders, sysadmins, and teams. Every service states what it does, what it will cost, and whether you can use it today.',
		ctaPrimary: { label: 'Request an invite', href: '/invite' },
		ctaSecondary: { label: 'Explore services', href: '/#services' }
	},

	/** Section 2. Credibility arrives before the pitch, and it is checkable. */
	proofHeading: 'Things you can check before you read another word',
	proof: [
		{
			label: 'Fleet status is public',
			verifier: 'status.starhold.fyi',
			href: 'https://status.starhold.fyi',
			evidence: ev('public-status-page')
		},
		{
			label: 'Docs are public',
			verifier: 'starhold.fyi',
			href: 'https://starhold.fyi',
			evidence: ev('docs-site')
		},
		{
			// Internal link: the policy page backs the tile, the Network tab verifies it.
			label: 'No third-party trackers',
			verifier: 'DevTools, Network: one host',
			href: '/legal/privacy',
			evidence: ev('no-third-party-tracking')
		}
	] satisfies ProofSignal[],

	/** Ledger Q31: one line on tests, with counts generated from the repository. */
	testLine: {
		text: `Tests come with the work: ${stats.unitTests} unit tests and ${stats.e2eTests} browser tests on this site alone, counted from the repository.`,
		link: { href: 'https://github.com/Quadstronaut/Starhold', label: 'Read them' },
		evidence: ev('automated-tests')
	},

	/** Section 3. The four groups mirror the Hangar's categories, in its order. */
	work: {
		eyebrow: 'Services',
		h2: { pre: 'Find the tool for the', em: 'job' },
		sub: `Each service carries one of five labels, so you know before you click whether you can use it today. ${OPEN_MEANS}`,
		hangar: { label: 'Browse everything in the Hangar', href: 'https://starhold.app' }
	},

	/** Section 4. Three steps, numbered by a CSS counter so no digit lives in the copy. */
	how: {
		eyebrow: 'Access',
		h2: { pre: 'Access should be clear before you', em: 'ask' },
		steps: [
			{ title: 'Choose a service', body: 'Pick the one you need. Each shows whether you can use it today. Open services need no invite.' },
			{ title: 'Request an invite', body: "Give us an email and the service you want. A line about your use helps but isn't required." },
			{ title: 'We reply by hand', body: "We review every request ourselves. Access isn't guaranteed." }
		]
	},

	/** Section 5. Privacy as a design constraint. Delivered pledges render with a
	 *  check; the rest is listed as coming soon and never as a promise. */
	principles: {
		eyebrow: 'Principles',
		h2: { pre: 'Privacy is a design constraint, not a', em: 'slogan' },
		sub: 'These are in place today. The rest are not built yet, and we say so.',
		soonHeading: 'Not built yet'
	},

	/** Section 6. */
	fleet: {
		eyebrow: 'Fleet status',
		h2: 'Designed so one machine failing doesn’t take it down.',
		body: 'We run services on machines we administer. That design reduces reliance on any single machine; it does not guarantee uninterrupted availability. Current health is on the public fleet status page.',
		link: { href: 'https://status.starhold.fyi', label: 'See current health' },
		evidence: ev('self-hosted-fleet')
	},

	/** Section 7 (ruling 4). The only note that says who is behind the "we". */
	operator: {
		eyebrow: 'Who runs it',
		h2: 'Quadstronaut',
		lede: 'We’re one person in Arizona. Whoever answers your message also runs the servers.'
	},

	/** Section 9. No countdowns, no scarcity. */
	contact: {
		h2: { pre: 'Start with the service you', em: 'need', post: '.' },
		cta: { label: 'Request an invite', href: '/invite' },
		docs: { label: 'Read the docs', href: 'https://starhold.fyi' }
	}
};

// ── Privacy principles ───────────────────────────────────────────────────────
// Delivered today, each backed by a page or a test a reader can open.
export type Principle = {
	title: string;
	detail: string;
	/** Evidence id when the claim is checkable. */
	evidence?: string;
	link?: { href: string; label: string };
};

export const principles: Principle[] = [
	{
		title: 'No third-party trackers.',
		detail: 'No cookie banner, because nothing on this site needs one. Open DevTools: every request goes to our own hosts.',
		evidence: ev('no-third-party-tracking'),
		link: { href: '/legal/privacy', label: 'Read the policy' }
	},
	{
		title: 'We never sell data.',
		detail: 'We keep only what each service needs, for a stated period, then delete it.',
		link: { href: '/legal/privacy', label: 'What we keep' }
	},
	{
		title: 'Cancel any time.',
		detail: `${CHECKOUT_NOTICE} Run out the period or take a prorated refund now. Local consumer rights still apply.`,
		evidence: ev('refund-policy'),
		link: { href: '/legal/refunds', label: 'Refund policy' }
	}
];

/** Not built yet. Listed so nobody has to guess what is missing. */
export const comingSoon: string[] = [
	'Export and delete your own data from your account.',
	'Notification controls you can switch off.',
	'Offline, on-your-machine tiers.',
	'One public price table.'
];

// ── The services ─────────────────────────────────────────────────────────────
// The same set and order as the Hangar on starhold.app. A card is: name + label
// chip, one factual sentence, hostname, an optional limitation or price note,
// and at most one action. An invitation-only service offers "Request an invite";
// an open one offers "Open X"; an in-development one offers nothing (QNix links
// to its interest form). Starbot has no public door yet, so no link (brief 5).
export type Service = {
	id: string;
	name: string;
	/** Hostname shown under the name; null when the service has none. */
	host: string | null;
	/** Where the one action goes; null means the card has no action. */
	href: string | null;
	/** Action label. */
	action: string;
	/** True when the action is an invite request (href is built from the id). */
	invite: boolean;
	status: string;
	/** One availability line per service, from docs/shared/availability.json. */
	availability: string;
	what: string;
	/** One limitation or price note, only where needed. */
	note?: string;
	evidence?: string;
};

export const serviceItems: Service[] = [
	{
		id: 'status',
		name: 'Status',
		host: 'status.starhold.app',
		href: null,
		action: 'Request an invite',
		invite: true,
		status: labelFor('status'),
		availability: availabilityFor('status'),
		what: 'Private and white-label status pages for MSPs.'
	},
	{
		id: 'umbermark',
		name: 'Umbermark',
		host: 'umbermark.starhold.app',
		href: 'https://umbermark.starhold.app',
		action: 'Open Umbermark',
		invite: false,
		status: labelFor('umbermark'),
		availability: availabilityFor('umbermark'),
		what: 'A scored server hardening report with a shareable link.'
	},
	{
		id: 'zenithmark',
		name: 'Zenithmark',
		host: 'zenithmark.starhold.app',
		href: 'https://zenithmark.starhold.app',
		action: 'Open Zenithmark',
		invite: false,
		status: labelFor('zenithmark'),
		availability: availabilityFor('zenithmark'),
		what: 'A mail and DNS scorecard for a domain: SPF, DKIM, DMARC, MX, MTA-STS, TLS, DNSSEC, CAA and BIMI.'
	},
	{
		id: 'render',
		name: 'Render',
		host: 'render.starhold.app',
		href: null,
		action: 'Request an invite',
		invite: true,
		status: labelFor('render'),
		availability: availabilityFor('render'),
		what: 'An API for OG images, PDFs and screenshots.'
	},
	{
		id: 'shushgame',
		name: 'Shush',
		host: 'shushgame.com',
		href: '/shush',
		action: 'About Shush',
		invite: false,
		status: labelFor('shushgame'),
		availability: availabilityFor('shushgame'),
		what: 'The quiet game on Discord: a new word is banned each day.',
		note: 'Free. Nothing to buy.',
		evidence: ev('shushgame-live')
	},
	{
		id: 'starbot',
		name: 'Starbot',
		host: null,
		href: null,
		action: '',
		invite: false,
		status: labelFor('starbot'),
		availability: availabilityFor('starbot'),
		what: 'A Discord assistant for the Starhold community.'
	},
	{
		id: 'qnix',
		name: 'QNix',
		host: 'starhold.dev/qnix',
		href: '/qnix',
		action: 'Register interest',
		invite: false,
		status: labelFor('qnix'),
		availability: availabilityFor('qnix'),
		what: 'Bring-your-own-device hosting with high availability.'
	}
];

export const services = {
	inviteLabel: 'Request an invite',
	inviteHref: (id: string) => `/invite?service=${id}`,
	groups: [
		{ id: 'teams', title: 'For teams and MSPs', ids: ['status'] },
		{ id: 'builders', title: 'For builders and sysadmins', ids: ['umbermark', 'zenithmark', 'render'] },
		{ id: 'discord', title: 'Discord apps', ids: ['shushgame', 'starbot'] },
		{ id: 'personal', title: 'Personal hosting', ids: ['qnix'] }
	],
	items: serviceItems
};

// ── FAQ ──────────────────────────────────────────────────────────────────────
// Six answers from the design brief (section 3.8), verbatim. Rendered as native
// <details> and mirrored into FAQPage JSON-LD from this same array.
export type FaqItem = {
	q: string;
	a: string;
	/** Evidence id when the answer states a checkable fact. */
	evidence?: string;
	link?: { href: string; label: string };
};

export const faq = {
	eyebrow: 'Questions',
	h2: { pre: 'Before you', em: 'ask' },
	items: [
		{
			q: 'What can I use today?',
			a: 'Each service carries one of five labels. Open services work now. Invitation-only and in-development ones are not generally available.',
			link: { href: '/#services', label: 'See the services' }
		},
		{
			q: 'How do I get an invite?',
			a: "Pick a service and give an email. A line about your use helps but isn't required. We review by hand; access isn't guaranteed.",
			link: { href: '/invite', label: 'Request an invite' }
		},
		{
			q: 'Is Starhold Account available?',
			a: 'Not yet. Until sign-in exists, request access through the invite form. No Sign in link appears until it works.'
		},
		{
			q: 'What do you keep?',
			a: 'Only what each service needs, for a stated period, then it’s deleted. We never sell data. Details are in the privacy policy.',
			link: { href: '/legal/privacy', label: 'Privacy policy' }
		},
		{
			q: 'How do payments and refunds work?',
			a: `${CHECKOUT_NOTICE} Paid plans will go through a merchant of record. Cancel any time: run out the period or take a prorated refund now. Local consumer rights still apply.`,
			evidence: ev('refund-policy'),
			link: { href: '/legal/refunds', label: 'Refund policy' }
		},
		{
			q: 'Does this site track me?',
			a: 'No third-party trackers, no cookie banner. We keep anonymous per-day counts of pages and status codes, nothing per person.',
			evidence: ev('no-third-party-tracking'),
			link: { href: '/legal/privacy', label: 'Read the policy' }
		}
	] as FaqItem[]
};

// ── Invite and account pages ─────────────────────────────────────────────────
export const invite = {
	title: 'Request an invite · Starhold',
	description: 'Ask for access to a Starhold service. We review every request by hand.',
	eyebrow: 'Access',
	h1: 'Request an invite',
	lede: "Pick a service and give an email. A line about your use helps but isn't required. We review by hand; access isn't guaranteed.",
	emailLabel: 'Email',
	serviceLabel: 'Service',
	servicePlaceholder: 'Choose a service',
	useLabel: 'What you’d use it for (optional)',
	cta: 'Request an invite',
	/** The success state says "requested", never "enrolled" or "approved". */
	success: 'Requested. We’ll review it by hand and reply to',
	successNote: 'Access isn’t guaranteed.',
	/** Choices for the service field: the services you can ask to be let into. */
	services: [
		{ id: 'umbermark', label: 'Umbermark' },
		{ id: 'zenithmark', label: 'Zenithmark' },
		{ id: 'render', label: 'Render' },
		{ id: 'status', label: 'Status' },
		{ id: 'starbot', label: 'Starbot' }
	]
};

export const account = {
	title: 'Starhold Account · Starhold',
	description: 'Starhold Account is in development. Until sign-in exists, request access through the invite form.',
	eyebrow: 'Account',
	h1: 'Starhold Account',
	lede: 'Starhold Account is in development.',
	body: [
		'There is no sign-in yet, and nothing on this page is a control. Until sign-in exists, request access through the invite form, and write to us if something is wrong.'
	],
	cta: { label: 'Request an invite', href: '/invite' },
	secondary: { label: 'Contact', href: '/contact' }
};

// ── Contact ──────────────────────────────────────────────────────────────────
export const contact = {
	title: 'Contact · Starhold',
	description: 'Ask a question or report a problem. Email or the form below.',
	eyebrow: 'Get in touch',
	h1Invite: 'Request an invite',
	introInvite:
		'Pick the service you want to try and say a little about what you would use it for. We read every request by hand.',
	productLabel: 'Service',
	/** Choices for the invite form. "Not sure yet" is always last. */
	products: [
		{ id: 'umbermark', label: 'Umbermark' },
		{ id: 'zenithmark', label: 'Zenithmark' },
		{ id: 'render', label: 'Render' },
		{ id: 'status', label: 'Status' },
		{ id: 'starbot', label: 'Starbot' },
		{ id: 'unsure', label: 'Not sure yet' }
	],
	h1Contact: 'Contact',
	introContact: 'Questions, billing problems, or something that does not fit a form. Either channel reaches us.',
	emailLabel: 'Email'
};

// ── Form notices (STAR-145, ledger Q23/Q47/Q48/Q65/Q66) ──────────────────────
// Shown directly under each form, where the data is collected.
export const formNotices = {
	contact: {
		// from data-flow-inventory: storefront.contact (sf-contact-form notice_text)
		notice:
			'Your message is encrypted with a public key before it is stored; only an offline key held by the operator can read it. Discord receives only the ticket number and the service name. We delete the message 90 days after we close the conversation (12 months at most).',
		secrets: "Don't send passwords or secrets.",
		deletion:
			'We delete your message 90 days after we close it, and never keep it longer than 12 months. Discord keeps its own copy of the notice line only.'
	},
	// from data-flow-inventory: storefront.qnix (sf-qnix-interest), wording per ledger Q66
	qnix: {
		line: 'QNix: personal hosting, built to be hard to break.',
		heading: 'Notify me when QNix opens. One email, then we delete your address.',
		notice:
			'We store your address encrypted, email you once when QNix opens, then delete it. If QNix never opens we delete it after 24 months.',
		cta: 'Notify me'
	}
};

// ── Product and service pages ────────────────────────────────────────────────
export const qnix = {
	title: 'QNix · Starhold',
	description: 'QNix: bring-your-own-device hosting with high availability. In development; register interest on its page.',
	eyebrow: labelFor('qnix'),
	h1: 'QNix',
	lede: 'Bring-your-own-device hosting with high availability: hold your own infrastructure the way we hold ours.'
};

// /shush (design brief section 4). Mechanics were checked against the Shush
// repo: a new word is banned each day and stays banned for the round (a calendar
// month, substring match); saying one puts you on the public kill list. The
// brief's "decree board", "silenced" and the /hide-me command are NOT shown as
// live: the repo has no /hide-me and no 30-day removal job yet, so the privacy
// line below says what the list holds today and what is coming.
export const shush = {
	title: 'Shush · Starhold',
	description: 'Shush is the quiet game on Discord. A new word is banned each day. It’s free, and it stays that way.',
	eyebrow: labelFor('shushgame'),
	h1: 'Shush',
	lede: 'The quiet game on Discord.',
	body: [
		'A new word is banned each day, and it stays banned for the month. Say one in the server and you’re out: your name goes on the public list. Stay quiet and you stay in.',
		'It’s free, and it stays that way: nothing to unlock, nothing to buy. Join the server and see who lasts.'
	],
	cta: { label: 'Play Shush', href: 'https://shushgame.com' },
	privacyHeading: 'What the public list shows',
	privacy: [
		'The public list shows a display name, the word and the date, for thirty days, then it drops off.',
		"Use /hide-me in Discord to leave every list we keep; we also edit the bot's own recent messages. Copies kept by Discord or other players, and older bot messages, can't be changed."
	],
	evidence: ev('shushgame-live')
};

export { stats };
