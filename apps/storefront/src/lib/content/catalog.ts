// ─────────────────────────────────────────────────────────────────────────────
// STAR-299: who each product is for, and the two views built from that.
//
// ONE list of audiences (AUDIENCES) and ONE list of products (serviceItems in
// copy.ts). Everything on the site that groups products is derived from these:
//   • the home page "By who it's for" view  = one section per audience
//   • the home page "Everything" table      = one row per product, tagged with
//                                             every audience that names it
//   • /for/<id>                              = one page per audience
//   • the header and footer audience links
// Adding an audience (say "Gamers", if a game is ever built) is ONE new entry in
// AUDIENCES. Nothing else needs editing.
//
// Prices are never typed here. Each product's price line is its availability
// line (lib/availability.ts), and package totals are added up from TIER_USD,
// which catalog.test.ts holds to those same lines.
// ─────────────────────────────────────────────────────────────────────────────
import { serviceItems, comingSoon, type Service } from './copy';
import { SUITE_LINE } from '../availability';
import { pick, ACCOUNT_URL } from '../launch';

/** The price steps every paid product shares (operator, 2026-11: entry, middle, Suite). */
export type Tier = 'free' | 'entry' | 'middle' | 'suite';
export const TIER_USD: Record<Tier, number> = { free: 0, entry: 5, middle: 19, suite: 49 };
export const TIER_LABEL: Record<Tier, string> = {
	free: 'free tier',
	entry: 'entry plan',
	middle: 'middle plan',
	suite: 'Starhold Suite'
};

/** One product as an audience meets it: the outcome in plain words first, the product name second. */
export type AudienceItem = {
	/** A serviceItems id. */
	service: string;
	outcome: string;
	body: string;
};

/** A package is a recommended set of EXISTING plans. It has no price of its own (operator ruling 2026-11-19). */
export type Package = {
	name: string;
	body: string;
	plans: { service: string; tier: Tier }[];
	/** True for the Suite: one plan that covers every tool, priced by SUITE_LINE. */
	suite?: boolean;
};

export type Audience = {
	/** URL slug: /for/<id>. */
	id: string;
	/** Short name: section label, table tag, nav link. */
	label: string;
	navLabel: string;
	heading: string;
	intro: string;
	items: AudienceItem[];
	packages: Package[];
	/** Show the "what we don't do yet" list on this audience's page. */
	notYet?: boolean;
};

export const AUDIENCES: Audience[] = [
	{
		id: 'home',
		label: 'Home',
		navLabel: 'For home',
		heading: 'For you at home',
		intro: 'Most of what we sell today is for businesses and teams, and we would rather say so. This is what we have for home right now.',
		items: [
			{
				service: 'shushgame',
				outcome: 'A word game for friends on Discord',
				body: 'A new word is banned every day. Say it in the chat and you are out. Nothing to unlock and nothing to buy.'
			},
			{
				service: 'starbot',
				outcome: 'A Discord bot for your server',
				body: 'One shared bot that we run, for a club, a game group or friends.'
			},
			{
				service: 'dysonsphere',
				outcome: 'Personal hosting',
				body: 'In development. Nothing to use yet. Its page has an interest form.'
			}
		],
		packages: [
			{
				name: 'Free at home',
				body: 'What is open for home today costs nothing.',
				plans: [{ service: 'shushgame', tier: 'free' }]
			}
		]
	},
	{
		id: 'small-business',
		label: 'Small business',
		navLabel: 'Small business',
		heading: 'For a small business',
		intro: 'You do not need an IT department to know your email and website are set up properly. Start with a free check.',
		items: [
			{
				service: 'zenithmark',
				outcome: 'Is my email set up safely?',
				body: 'Type your web address and get a graded report: could someone send email pretending to be you, and what should be fixed. Hand the fixes to whoever looks after your website.'
			},
			{
				service: 'status',
				outcome: 'Show customers what is working',
				body: 'A page at your own link that says what is working and what is not, so customers do not have to call to ask.'
			},
			{
				service: 'umbermark',
				outcome: 'Is the server behind my website safe?',
				body: 'A scored report on how safely a Linux server is set up, with a link you can send to whoever looks after it.'
			}
		],
		packages: [
			{
				name: 'Check first',
				body: 'Find out where you stand before you pay for anything.',
				plans: [
					{ service: 'zenithmark', tier: 'free' },
					{ service: 'status', tier: 'free' },
					{ service: 'umbermark', tier: 'free' }
				]
			},
			{
				name: 'Keep watch',
				body: 'The free checks, plus daily watching of your email setup.',
				plans: [
					{ service: 'zenithmark', tier: 'entry' },
					{ service: 'status', tier: 'free' },
					{ service: 'umbermark', tier: 'free' }
				]
			}
		]
	},
	{
		id: 'teams',
		label: 'Teams',
		navLabel: 'Teams',
		heading: 'For teams and people who look after servers',
		intro: 'Security reports, mail and DNS monitoring, status pages for your clients, and an image and PDF API. Each has a free tier, then the same price steps.',
		notYet: true,
		items: [
			{
				service: 'umbermark',
				outcome: 'Server security reports',
				body: 'A scored hardening report for a Linux server, with a link you can share.'
			},
			{
				service: 'zenithmark',
				outcome: 'Mail and DNS monitoring',
				body: 'A scorecard for a domain’s mail and DNS setup. Paid plans keep watching it.'
			},
			{
				service: 'status',
				outcome: 'Status pages for your clients',
				body: 'Private and white-label status pages for the services you run.'
			},
			{
				service: 'render',
				outcome: 'Images, PDFs and screenshots by API',
				body: 'An API that makes Open Graph images, PDFs and screenshots inside your own application.'
			}
		],
		packages: [
			{
				name: 'One tool at a time',
				body: 'Start each tool on its free tier and move one up when you need more.',
				plans: [
					{ service: 'umbermark', tier: 'entry' },
					{ service: 'zenithmark', tier: 'free' },
					{ service: 'status', tier: 'free' },
					{ service: 'render', tier: 'free' }
				]
			},
			{
				name: 'Starhold Suite',
				body: 'One bill for every tool. Only worth it if you use three or more.',
				suite: true,
				plans: [
					{ service: 'umbermark', tier: 'middle' },
					{ service: 'zenithmark', tier: 'middle' },
					{ service: 'status', tier: 'middle' },
					{ service: 'render', tier: 'middle' }
				]
			}
		]
	}
];

const SERVICES = new Map(serviceItems.map((s) => [s.id, s]));

export function serviceFor(id: string): Service {
	const s = SERVICES.get(id);
	if (!s) throw new Error(`catalog names an unknown product: ${id}`);
	return s;
}

export function audienceFor(id: string): Audience | undefined {
	return AUDIENCES.find((a) => a.id === id);
}

export const audienceHref = (a: Audience) => `/for/${a.id}`;

/** Does the product have a plan that costs nothing? A fact about the product, not a price. */
const FREE_TIER: Record<string, boolean | null> = {
	status: true,
	umbermark: true,
	zenithmark: true,
	render: true,
	shushgame: true,
	starbot: true,
	dysonsphere: null // no plans of any kind yet
};

/** Lowest dollar amount in a price line, or null when it names none. */
function lowestPrice(line: string | undefined): number | null {
	const found = [...(line ?? '').matchAll(/\$(\d+)/g)].map((m) => Number(m[1]));
	return found.length ? Math.min(...found) : null;
}

export type ProductRow = {
	id: string;
	name: string;
	status: string;
	does: string;
	/** Labels of every audience that names this product, in AUDIENCES order. */
	audiences: string[];
	free: 'Yes' | 'No' | 'Not yet';
	startsAt: string;
	link: { href: string; label: string; external: boolean } | null;
	/** Shown instead of a link when the product cannot be opened yet. */
	closed: string | null;
};

/** The "Everything" table: one row per product, then the Suite. Read from the product list and AUDIENCES only. */
export function productRows(): ProductRow[] {
	const rows: ProductRow[] = serviceItems.map((s) => {
		// The price line is the availability line; a closed product keeps its prices in its note.
		const low = lowestPrice(s.availability) ?? lowestPrice(s.note);
		const free = FREE_TIER[s.id] ?? null;
		const href = s.invite ? null : s.href;
		return {
			id: s.id,
			name: s.name,
			status: s.status,
			does: s.what,
			audiences: AUDIENCES.filter((a) => a.items.some((i) => i.service === s.id)).map((a) => a.label),
			free: free === null ? 'Not yet' : free ? 'Yes' : 'No',
			startsAt: low !== null ? `From $${low}` : free ? 'Free' : 'No price yet',
			link: href ? { href, label: s.action, external: !href.startsWith('/') } : null,
			closed: href ? null : s.availability
		};
	});
	rows.push({
		id: 'suite',
		name: 'Starhold Suite',
		status: '',
		does: `${SUITE_LINE}.`,
		audiences: AUDIENCES.filter((a) => a.packages.some((p) => p.suite)).map((a) => a.label),
		free: 'No',
		startsAt: `$${TIER_USD.suite} a month`,
		link: pick(null, { href: `${ACCOUNT_URL}/account/subscriptions`, label: 'Get the Suite', external: true }),
		closed: pick('Not on sale yet.', null)
	});
	return rows;
}

/** What a package adds up to each month, from the shared price steps. The Suite is one plan at its own price. */
export function packageMonthlyUsd(p: Package): number {
	return p.suite ? TIER_USD.suite : p.plans.reduce((sum, plan) => sum + TIER_USD[plan.tier], 0);
}

// ── Open source ──────────────────────────────────────────────────────────────
// Its own section: outside both product views and outside every audience, so no
// audience tags and no price. Operator wording 2026-11-19: both are listed with
// "source coming soon". No repository link, no release date and no licence promise.
// Peridot is not released yet, so it says "coming soon" and never that it is available.
export type OpenSourceProject = { id: string; name: string; what: string; state: string; source: string };

export const OPEN_SOURCE: OpenSourceProject[] = [
	{
		id: 'peridot',
		name: 'Peridot',
		what: 'A private period tracker for Android. Everything stays on your phone.',
		state: 'Free. Coming soon.',
		source: 'Source coming soon.'
	},
	{
		id: 'circle',
		name: 'Circle',
		what: 'A tool that has AI assistants from different companies work on the same task together.',
		state: 'In development.',
		source: 'Source coming soon.'
	}
];

/** A thank you, never an ask: no link and no button beside it. */
export const OPEN_SOURCE_THANKS = 'Our Patreon supporters paid for the time to build these. Thank you.';

// ── What we don't do yet ─────────────────────────────────────────────────────
// Shown on /for/teams and /pricing. Every line must be true on the day it ships;
// each names where the fact comes from. Drop a line the day it stops being true.
export const NOT_YET = {
	heading: { pre: 'What we don’t do', em: 'yet' },
	sub: 'Better you read this here than find out later.',
	items: [
		// copy.ts home.how: "Sign in with Google ... There is no separate password."
		'Sign-in is with a Google account only. There is no email and password sign-in.',
		// lib/site-links.ts: the phone line is voicemail only and is answered by email.
		'No live phone support. We answer by email and through the contact form.',
		// copy.ts home.fleet: "it does not guarantee uninterrupted availability".
		'No uptime guarantee. Current health is on the public status page.',
		// copy.ts comingSoon: the "Not built yet" list, already held to the same rule.
		...comingSoon
	]
};

// ── The Products page (the Hangar, folded in) ────────────────────────────────
// First built as "How it runs"; the operator named it Products on 2026-11-20, so it leads
// with the products themselves and keeps the evidence below as supporting sections.
// Public facts only: this file is mirrored. No machine names, addresses or internal
// detail; every checkable line carries an evidence id where it renders.
export const PRODUCTS_PAGE = {
	title: 'Products · Starhold',
	description: 'Every Starhold product: what it is, whether you can use it today, and where to open it.',
	eyebrow: 'Products',
	h1: 'Products',
	lede: 'Everything we make: what each product is, whether you can use it today, and where to open it.',
	list: { pre: 'Every', em: 'product' },
	listSub: 'One line each. The status label says whether you can use it today.',
	running: { pre: 'What is', em: 'running' },
	runningSub: 'Each product, with its status and the address it answers on.',
	checks: { pre: 'Check it', em: 'yourself' },
	checksSub: 'None of this needs an account.'
};

// ── Pricing page and the account call to action ──────────────────────────────
export const PRICING = {
	title: 'Pricing · Starhold',
	description: 'Every Starhold product, its free tier and its paid plans, on one page.',
	eyebrow: 'Pricing',
	h1: 'Simple prices',
	lede: 'Most products have a free tier. Paid plans use the same price steps everywhere, and you can cancel any time.',
	tableHeading: { pre: 'Every product, one', em: 'table' },
	packagesHeading: { pre: 'Recommended', em: 'sets' },
	packagesSub: 'A set is a suggestion, not a product. Each line is a plan that already exists, at its own price, on its own bill.',
	paymentHeading: { pre: 'Paying and', em: 'refunds' },
	/** The question in copy.ts faq whose answer is the one payment and refund statement. Reused, never restated. */
	paymentFaq: 'How do payments and refunds work?'
};

export const ACCOUNT_CTA = {
	heading: { pre: 'Start with a free', em: 'account' },
	body: 'One Starhold Account works for every product. Creating it is free and needs no card. You sign in with Google, so there is no new password.',
	already: 'Already have an account?'
};
