// ─────────────────────────────────────────────────────────────────────────────
// Marketing copy, single source of truth.
//
// Rules this file is held to (and src/acceptance/a2-voice.test.ts enforces):
//   • First person singular. "we/our/ours" is the fake-company tell — banned on
//     every marketing surface. Legal and transactional pages may say "we"
//     because there a legal entity really is speaking.
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

export const site = {
	/** Accessible name of the brand. Title case, not caps. */
	name: 'Starhold',
	fullName: 'Starhold Software',
	operator: 'Quadstronaut',
	handle: 'Quadstronaut',
	foundedYear: 2026,
	email: 'hello@starhold.dev',
	/** The owner's line, kept because it reads confident rather than costumed. */
	strapline: 'Sovereign systems, built and operated.',
	/** Footer line on every page. Evidence-tagged where it renders. */
	privacy: {
		label: 'No trackers',
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

// STAR-134 positioning: the home page leads with the services I host and
// operate for the privacy-conscious consumer, all of them under development and
// invitation only. Hiring the operator is still here, one section further down.
export const home = {
	title: 'Starhold — privacy-first services, hosted and operated',
	description:
		'Privacy-first services I host and operate for you. Everything is under development. Some tools are open today; the rest are invitation only. Request an invite through the contact form.',

	hero: {
		eyebrow: 'Starhold · under development · some tools open, some by invitation',
		h1: 'Privacy-first services I host and operate for you.',
		sub: 'Small, useful tools for the privacy-conscious. I host and operate these myself, keep only what a service needs to work, and never sell what passes through it.',
		ctaPrimary: { label: 'Request an invite', href: '/contact?intent=invite' },
		ctaSecondary: { label: 'See the services', href: '/#fleet' },
		byline:
			'Everything here is under development. Some tools are open today; the rest are invitation only. Starhold is one person: whoever answers your message also runs the servers.',
		bylineLink: { label: 'How I operate', href: '/operator' }
	},

	/** Section 3. Credibility arrives before the pitch, and it is checkable. */
	proofHeading: 'Things you can check before you read another word',
	proof: [
		{
			label: 'Uptime is published',
			verifier: 'status.starhold.fyi',
			href: 'https://status.starhold.fyi',
			evidence: ev('public-status-page')
		},
		{
			label: 'Docs are published',
			verifier: 'starhold.fyi',
			href: 'https://starhold.fyi',
			evidence: ev('docs-site')
		},
		{
			label: 'Self-hosted platform',
			verifier: 'starhold.app',
			href: 'https://starhold.app',
			evidence: ev('self-hosted-fleet')
		},
		{
			// Internal link: the policy page backs the tile, the Network tab verifies it.
			label: 'No trackers',
			verifier: 'devtools → Network: one host',
			href: '/legal/privacy',
			evidence: ev('no-third-party-tracking')
		}
	] satisfies ProofSignal[],

	/** Secondary on the home page since STAR-134: hiring the operator. */
	capabilities: {
		eyebrow: 'Also on offer',
		h2: { pre: 'Need something built?', em: 'Hire the operator' },
		// Owner-stated commercial policy (pre-STAR-9 copy), not an invented claim.
		sub: 'Custom work is scoped and quoted per job. No retainer, no minimum, no discovery-phase invoice.',
		// The quarter is filled in at request time from src/lib/availability.ts.
		// Deliberately not stored here: a hardcoded quarter goes stale and a stale
		// availability line reads worse than no availability line at all.
		availability: (quarter: string) => `Currently taking custom work for ${quarter}.`,
		links: [
			{ label: 'Selected work', href: '/work' },
			{ label: 'Rates', href: '/rates' },
			{ label: 'Request a quote', href: '/contact?intent=quote' }
		]
	},

	/**
	 * Three proofs told at length, each beside a terminal card. The cards show the
	 * SHAPE of real output (hostnames, header names, commands) and never a live
	 * value: no uptime figure, nothing that could go stale or be made up. The one count
	 * shown is the test total, read from stats.json (generated by npm run stats).
	 */
	features: [
		{
			id: 'status',
			eyebrow: 'Published uptime',
			h2: { pre: 'Uptime you can', em: 'open' },
			body: 'Every service I run reports to a public status page, including when it is down. You never have to ask me whether something is up.',
			link: { href: 'https://status.starhold.fyi', label: 'Open the status page' },
			evidence: ev('public-status-page'),
			card: {
				title: 'status.starhold.fyi',
				caption: 'The shape of the page. The live state is only ever on the page itself.',
				lines: [
					{ kind: 'dim', t: '# public hostnames' },
					{ kind: 'out', t: 'starhold.dev', v: 'storefront' },
					{ kind: 'out', t: 'starhold.fyi', v: 'docs' },
					{ kind: 'out', t: 'starhold.app', v: 'platform' },
					{ kind: 'cmd', t: 'open https://status.starhold.fyi' }
				]
			}
		},
		{
			id: 'money',
			eyebrow: 'Verified payments',
			h2: { pre: 'Money is', em: 'verified' },
			body: "Payments go through Stripe Checkout. The webhook checks Stripe's signature on the raw request before it touches an order, and a request that fails the check is rejected and does nothing.",
			// Repo root, not a deep link: a path would carry a branch name and an encoded
			// character that the voice and digit checks rightly reject, and go stale.
			link: { href: 'https://github.com/Quadstronaut/Starhold', label: 'Read the source' },
			evidence: ev('stripe-live-checkout'),
			card: {
				title: 'POST /api/stripe/webhook',
				caption: 'The order of operations in the handler. Field names only, no payloads.',
				lines: [
					{ kind: 'out', t: 'stripe-signature', v: 'read from header' },
					{ kind: 'out', t: 'constructEvent', v: 'raw body, signing secret' },
					{ kind: 'ok', t: 'signature valid', v: 'verified' },
					{ kind: 'out', t: 'checkout.session.completed', v: 'order posted to Discord' },
					{ kind: 'err', t: 'signature invalid', v: 'rejected, nothing runs' },
					{
						kind: 'out',
						t: 'tests in this repository',
						v: `${stats.unitTests} unit, ${stats.e2eTests} browser`,
						evidence: ev('automated-tests')
					}
				]
			}
		},
		{
			id: 'owned',
			eyebrow: 'Self-hosted',
			h2: { pre: 'Hosts I', em: 'administer' },
			body: 'The hosts are mine to administer, joined by a private mesh, and the services run rootless: unprivileged containers rather than a root daemon.',
			link: { href: 'https://starhold.app', label: 'See the platform' },
			evidence: ev('self-hosted-fleet'),
			card: {
				title: 'podman ps',
				caption: 'The shape of the output. Container names are the ones I run.',
				lines: [
					{ kind: 'cmd', t: 'podman ps' },
					{ kind: 'dim', t: 'NAMES', v: 'RUNS AS' },
					{ kind: 'out', t: 'web', v: 'unprivileged user' },
					{ kind: 'out', t: 'gatus', v: 'unprivileged user' }
				]
			}
		}
	] satisfies Feature[],

	/**
	 * Featured case: one real product shown on the devices it runs on. The
	 * screenshots are captures of the live site, not mock-ups. The images are
	 * decorative-adjacent, so the alt text describes what is visible and
	 * carries no figures (the live page shows counters that change by the second).
	 */
	featured: {
		eyebrow: 'Featured work',
		h2: { pre: 'A whole game, built and', em: 'run by one person' },
		body: 'Shushgame is a Discord server that is itself the game. I built the site and the bot, and I operate both. It is live, so you can open it and check.',
		evidence: ev('shushgame-live'),
		links: [
			{ href: 'https://shushgame.com', label: 'Open shushgame.com' },
			{ href: 'https://starhold.fyi/shushgame/', label: 'Read the docs' }
		],
		desktop: {
			src: '/work/shushgame-desktop.webp',
			width: 1100,
			height: 688,
			alt: 'The Shushgame home page on a laptop: the game logo, a tagline, an enter button and a row of live round statistics.'
		},
		mobile: {
			src: '/work/shushgame-mobile.webp',
			width: 390,
			height: 844,
			alt: 'The same Shushgame page on a phone, stacked in a single column.'
		}
	},

	/**
	 * How it works: three static steps. Numbering is done with a CSS counter in
	 * the page, not with digits here, so no bare number lands in marketing copy.
	 * Sign-in is by invitation and the operator sends each link by hand: no
	 * login mail is automated yet, so nothing here says one is on its way.
	 */
	how: {
		eyebrow: 'How invitations work',
		h2: { pre: 'From request to', em: 'signed in' },
		steps: [
			{ title: 'Ask for an invite', body: 'Use the contact form and pick the service you want to try. A line on what you would use it for is plenty.' },
			{ title: 'I send your link', body: 'For the invitation-only services (Render and Status), sign-in is by invitation while they are built. I set up your access and send your sign-in link myself.' },
			{ title: 'You stay in control', body: 'Notifications are opt-in. The only notices you cannot switch off are critical ones about your account or the service.' }
		]
	},

	/** The services list (#fleet). Same set as the Hangar on starhold.app. */
	work: {
		eyebrow: 'The services',
		h2: { pre: 'Hosted and operated', em: 'for you' },
		sub: 'The live ones you can open today; the rest are invitation only while I build them.'
	},

	principles: {
		eyebrow: 'How I run them',
		h2: { pre: 'Privacy', em: 'principles' },
		sub: 'The standard every Starhold service is held to. Where a service does not meet one yet, it is being built to.'
	},

	operator: {
		eyebrow: 'Who runs it',
		h2: 'Quadstronaut',
		cta: { label: 'How I operate', href: '/operator' }
	},

	contact: {
		eyebrow: 'Next step',
		body: 'Tell me which service you want to try and what you would use it for. Use the contact form at starhold.dev/contact, or write to hello@starhold.dev.',
		h2: { pre: 'Want in? Ask for an', em: 'invite', post: '.' },
		cta: { label: 'Request an invite', href: '/contact?intent=invite' },
		/** Closing-band checklist, rendered as check-marked rows by the CTA band. */
		checklist: [
			'No cookie banner — there is nothing to consent to.',
			'Under development: some tools open, the rest by invitation',
			'Your data is never sold'
		]
	}
};

// ── Privacy principles ───────────────────────────────────────────────────────
// The operator's own rules, stated plainly. These are commitments (voice and
// intent), not claims about a third party, so they carry no evidence id. The
// section sub says outright that a service still being built may not meet
// every one yet.
export const pledges: string[] = [
	'No logs beyond what it takes to keep a service running.',
	'I keep nothing I do not need, and I never sell data.',
	'Export and delete your data yourself; where a service cannot yet, I do it by hand on request.',
	'No dark patterns, no expiring credits, no surprise charges.',
	'Cancel in one click.',
	'One public price table, a generous free tier, and a published cost basis.',
	'No trackers, and terms written in plain English.',
	'Offline, on-your-machine tiers are the premium privacy option.',
	'Notifications are opt-in. Only critical account and service notices are not.'
];

// ── The services ─────────────────────────────────────────────────────────────
// The same set the Hangar on starhold.app lists. `invite` adds a "Request an
// invite" link preselecting that service on /contact. `href: null` means the
// Discord invite, passed in by the page from site-links: an invite code may
// carry digits, and A3.8 rejects any digit in static copy.
export type Service = {
	id: string;
	name: string;
	/** Hostname shown under the name; null for the Discord-only bot. */
	host: string | null;
	href: string | null;
	openLabel: string;
	status: string;
	what: string;
	invite: boolean;
	evidence?: string;
};

export const services = {
	inviteLabel: 'Request an invite',
	inviteHref: (id: string) => `/contact?intent=invite&product=${id}`,
	fleetStatus: { label: 'Fleet status', href: 'https://status.starhold.fyi' },
	items: [
		{
			id: 'umbermark',
			name: 'Umbermark',
			host: 'umbermark.starhold.app',
			href: 'https://umbermark.starhold.app',
			openLabel: 'Open Umbermark',
			status: 'Live · early access',
			what: 'A scored server hardening report with a shareable link. The scan is free; the paid report and plans check out through Polar.',
			invite: true
		},
		{
			id: 'zenithmark',
			name: 'Zenithmark',
			host: 'zenithmark.starhold.app',
			href: 'https://zenithmark.starhold.app',
			openLabel: 'Open Zenithmark',
			status: 'Live · free · in development',
			what: 'A mail and DNS scorecard for a domain: SPF, DKIM, DMARC, MX, MTA-STS, TLS, DNSSEC, CAA and BIMI.',
			invite: false
		},
		{
			id: 'render',
			name: 'Starhold Render',
			host: 'render.starhold.app',
			href: 'https://render.starhold.app',
			openLabel: 'Open Render',
			status: 'Invitation only · in development',
			what: 'An API for OG images, PDFs and screenshots.',
			invite: true
		},
		{
			id: 'status',
			name: 'Starhold Status',
			host: 'status.starhold.app',
			href: 'https://status.starhold.app',
			openLabel: 'Open Status',
			status: 'Invitation only · in development',
			what: 'Private and white-label status pages for MSPs.',
			invite: true
		},
		{
			id: 'starbot',
			name: 'Starbot',
			host: null,
			href: null,
			openLabel: 'Join the Discord',
			status: 'In development',
			what: 'A Discord assistant for the Starhold community.',
			invite: false
		},
		{
			id: 'shushgame',
			name: 'Shushgame',
			host: 'shushgame.com',
			href: 'https://shushgame.com',
			openLabel: 'Open shushgame.com',
			status: 'Live · free',
			what: 'A Discord chat game with its own site.',
			invite: false,
			evidence: ev('shushgame-live')
		},
		{
			id: 'qnix',
			name: 'QNix',
			host: 'starhold.dev/products/qnix',
			href: '/products/qnix',
			openLabel: 'Read about QNix',
			status: 'Paused',
			what: 'Bring-your-own-device hosting with high availability. Paused for now; the design notes stay published.',
			invite: false,
			evidence: ev('qnix-design-docs')
		}
	] satisfies Service[]
};

// ── FAQ ──────────────────────────────────────────────────────────────────────
// Every answer restates something already published on a page or a legal page;
// nothing here sets a policy. Rendered as native <details> and mirrored into
// FAQPage JSON-LD from this same array, so the two can never disagree.
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
			q: 'Can I sign up?',
			a: 'Umbermark, Zenithmark and Shush are open now. Render and Status are invitation only while I build them; request an invite and I reply by hand. Use the contact form at starhold.dev/contact or write to hello@starhold.dev.',
			link: { href: '/contact?intent=invite', label: 'Request an invite' }
		},
		{
			q: 'Who runs this?',
			a: 'One person. I am Quadstronaut: I build and operate every Starhold service myself, so whoever answers your message is the person running the servers.',
			evidence: ev('single-operator'),
			link: { href: '/operator', label: 'How I operate' }
		},
		{
			q: 'Will you send me marketing?',
			a: 'No. Notifications are opt-in, and the only notices you cannot switch off are critical ones about your account or the service.'
		},
		{
			q: 'What about refunds?',
			a: 'Subscriptions can be cancelled at any time and run to the end of the period already paid; fees already paid are not refunded or pro-rated. Refund terms for custom work are set out in each written quote. A charge that looks wrong: email me first and I respond within five business days, and you keep your card network chargeback rights either way.',
			evidence: ev('refund-policy'),
			link: { href: '/legal/refunds', label: 'Refund policy' }
		},
		{
			q: 'Where does it run?',
			a: 'On a dedicated server and a VPS that I administer myself, joined by a private mesh. The status page is public, so you can check it yourself.',
			evidence: ev('self-hosted-fleet'),
			link: { href: '/legal/privacy', label: 'Privacy policy' }
		},
		{
			q: 'How do payments work?',
			a: 'Checkout is Stripe. Card details are entered on Stripe, not on this site, and the cart stays in your browser until you check out.',
			evidence: ev('stripe-live-checkout')
		},
		{
			q: 'Does this site track me?',
			a: 'No analytics, no ad trackers and no cookie banner. The privacy policy spells out what is kept.',
			evidence: ev('no-third-party-tracking'),
			link: { href: '/legal/privacy', label: 'Read the policy' }
		}
	] as FaqItem[]
};

// ── Capabilities ─────────────────────────────────────────────────────────────
export type Capability = {
	id: string;
	name: string;
	href: string;
	summary: string;
	deliverables: string[];
	start: string;
};

export const capabilities = {
	title: 'Capabilities · Starhold Software',
	description:
		'Automation, platform and high-availability hosting, custom bots, and full stack builds — scoped and quoted per job.',
	eyebrow: 'Engagements',
	h1: 'Four ways to hire me',
	intro:
		'Every job is scoped and quoted before it starts. You get the code, the runbook, and a person who will still answer the email in six months.',
	cta: {
		heading: { pre: 'Not sure which', em: 'it is?' },
		body: 'Describe the problem in whatever words you already use for it. Sorting it into a category is my job, not yours.',
		cta: { href: '/contact?intent=quote', label: 'Request a quote' }
	},
	items: [
		{
			id: 'automation',
			name: 'Automation',
			href: '/services/automation',
			summary:
				'The manual step, removed. Python, PowerShell, and Bash that runs on a schedule, records what it did, and says so when it fails.',
			deliverables: [
				'Working code, in a repository you control',
				'A runbook a colleague can follow without me',
				'Logging, and an alert on the failure path'
			],
			start: 'Send me the process as you do it today. I will scope it and quote it.'
		},
		{
			id: 'platform',
			name: 'Platform and HA hosting',
			href: '/products/qnix',
			summary:
				'Somewhere for it to live. Rootless containers, private mesh networking, backups, and a status page anyone can open.',
			deliverables: [
				'Provisioned hosts and container images',
				'Private networking, no service exposed that does not need to be',
				'A public status page and a restore you have watched me perform'
			],
			start: 'Tell me what it has to survive. I will design to that and quote it.'
		},
		{
			id: 'bots',
			name: 'Custom bots',
			href: '/products/custom-bots',
			summary:
				"Discord run like business software, under your server's own name and avatar: moderation, roles, logging, and automation. An Ops Pack adds server, application, and scheduled-scraping monitoring.",
			deliverables: [
				'A bot on your branding, operated by me',
				'A feature set you pick, and a roadmap you can push to',
				'Flat monthly billing through Stripe, hosting included, cancel whenever'
			],
			start: 'Pick the features and add it to the cart, or ask for something the list does not cover.'
		},
		{
			id: 'fullstack',
			name: 'Full stack solutions',
			href: '/services/fullstack',
			summary:
				'A whole application, not a script. Proven open-source components, assembled and operated as one system scoped to your business — the job a multi-thousand-dollar platform does, without that invoice.',
			deliverables: [
				'An application you own, running on infrastructure you can inspect',
				'Every path tested end to end by a person, not just by the machine that wrote it',
				'The integration plumbing between it and whatever you already run'
			],
			start: 'Describe the business process end to end. I will scope the build and quote it.'
		}
	] satisfies Capability[]
};

// ── Selected work ────────────────────────────────────────────────────────────
export type WorkItem = {
	id: string;
	name: string;
	href: string;
	status: string;
	what: string;
	proves: string;
	evidence: string;
};

export const work = {
	title: 'Selected work · Starhold Software',
	description:
		'Four things I built and still operate, and what each one demonstrates about the work.',
	eyebrow: 'The fleet',
	h1: 'Selected work',
	intro:
		'I am one person, so the portfolio is small on purpose. Everything here is live or documented, and everything here I still run.',
	cta: {
		heading: { pre: 'Want the same thing pointed at', em: 'your problem?' },
		body: 'Tell me what it is. I will scope it, price it, and say so if I think it is the wrong build.',
		cta: { href: '/contact?intent=quote', label: 'Request a quote' },
		secondary: { href: '/capabilities', label: 'See what I take on' }
	},
	items: [
		{
			id: 'shushgame',
			name: 'Shushgame',
			href: '/products/shushgame',
			status: 'Live',
			what: 'A Discord chat game with its own site.',
			proves:
				'A whole product carried end to end: design, bot, billing, hosting. Nothing about it was handed to someone else.',
			evidence: ev('shushgame-live')
		},
		{
			id: 'custom-bots',
			name: 'Custom Discord Bots',
			href: '/products/custom-bots',
			status: 'Live',
			what: 'A configurable bot sold as a flat monthly subscription, under your server name.',
			proves:
				'Live Stripe Checkout, webhook signatures verified before anything acts on them, and a catalog published as machine-readable JSON that my own Discord bot consumes as a contract.',
			evidence: ev('stripe-live-checkout')
		},
		{
			id: 'qnix',
			name: 'QNix',
			href: '/products/qnix',
			status: 'In development',
			what: 'Bring-your-own-device hosting with high availability.',
			proves:
				'Architecture, hosting, and tenancy and security notes were written down and published before the product existed.',
			evidence: ev('qnix-design-docs')
		},
		{
			id: 'starhold',
			name: 'Starhold itself',
			href: 'https://status.starhold.fyi',
			status: 'Live',
			what: 'This site, the docs, the status page, and the machines underneath them.',
			proves: `A dedicated server and a VPS on a private Tailscale mesh, running rootless Podman containers, with ${stats.unitTests} unit tests and ${stats.e2eTests} browser tests in this repository.`,
			evidence: ev('self-hosted-fleet')
		}
	] satisfies WorkItem[]
};

// ── Operating principles ─────────────────────────────────────────────────────
export type Principle = {
	title: string;
	detail: string;
	evidence: string;
	/** Optional "go and check it yourself" link. Only for claims a reader can verify. */
	link?: { href: string; label: string };
};

export const principles: Principle[] = [
	{
		title: 'Tests ship with the work.',
		detail: `This storefront alone carries ${stats.unitTests} unit tests and ${stats.e2eTests} browser tests, and the counts on this page are generated from the repository rather than typed in.`,
		evidence: ev('automated-tests'),
		// The repository is public, so this claim is checkable rather than asserted.
		link: { href: 'https://github.com/Quadstronaut/Starhold', label: 'Read them' }
	},
	{
		title: 'Your visit is not the product.',
		detail:
			'No analytics, no ad trackers, no cookie banner. Nothing on this site phones home — the cart lives in your browser until you check out, and payment goes to Stripe.',
		evidence: ev('no-third-party-tracking'),
		link: { href: '/legal/privacy', label: 'Read the policy' }
	},
	{
		title: 'Design notes come before code.',
		detail: 'The architecture for the platform in development is written up and published where you can read it.',
		evidence: ev('qnix-design-docs')
	}
];

// ── The operator ─────────────────────────────────────────────────────────────
/** A profile link on /operator. No evidence id: a profile is a place, not a claim. */
export type OperatorLink = { label: string; href: string };

export const operator = {
	title: 'Quadstronaut · Starhold Software',
	description: 'How Starhold Software runs, and how an engagement actually works.',
	eyebrow: 'The operator',
	h1: 'Quadstronaut',
	lede: 'I run Starhold Software. It is one person, and that person is me.',
	bio: [
		'I build automation and the platforms it runs on. Most of what I do starts the same way: somebody has a process that works right up until the person who knows it is on holiday, and they want it to stop depending on that.',
		'I take the whole thing — the code, the host it runs on, the alert that fires when it stops — because handing back a script and wishing you luck is how the problem comes back in six months.'
	],
	howHeading: 'How an engagement works',
	how: [
		'You describe the problem. Email is fine; a screen recording of the manual process is better.',
		'I come back with a scope, a price, and the parts I think are a bad idea.',
		'I build it, you watch it run, and I hand over the code and the runbook.',
		'If I am hosting it, it goes on the status page like everything else I operate.'
	],
	linkHeading: 'Elsewhere',
	/**
	 * Outbound profiles for the "Elsewhere" list. A function of the Discord
	 * invite rather than a static array, for the same reason contact.availability
	 * is a function: the acceptance suite walks every static string in this
	 * module and rejects any digit that is not the founding year, and an invite
	 * code is free to carry digits. The component passes DISCORD_INVITE from
	 * site-links; an empty invite yields no Discord entry, so the list never
	 * advertises a door that is not open yet. Order is fixed: Patreon, Discord,
	 * GitHub.
	 */
	links: (discordInvite: string): OperatorLink[] => [
		{ label: 'Patreon', href: 'https://www.patreon.com/cw/Quadstronaut' },
		...(discordInvite ? [{ label: 'Discord', href: discordInvite }] : []),
		{ label: 'GitHub', href: 'https://github.com/Quadstronaut' }
	],
	cta: { label: 'Request a quote', href: '/contact?intent=quote' }
};

// ── Contact ──────────────────────────────────────────────────────────────────
export const contact = {
	title: 'Contact · Starhold Software',
	description: 'Request an invite, ask for a quote, or just ask a question. Email or the form below.',
	eyebrow: 'Get in touch',
	h1Invite: 'Request an invite',
	introInvite:
		'Everything here is under development. Some tools are open today; the rest are invitation only. Pick the service you want to try and say a little about what you would use it for. I read every request, and for the invitation-only services I send sign-in links myself. Your message is posted to a private Discord channel only I can read.',
	productLabel: 'Service',
	/** Choices for the invite form. "Not sure yet" is always last. */
	products: [
		{ id: 'umbermark', label: 'Umbermark' },
		{ id: 'zenithmark', label: 'Zenithmark' },
		{ id: 'render', label: 'Starhold Render' },
		{ id: 'status', label: 'Starhold Status' },
		{ id: 'starbot', label: 'Starbot' },
		{ id: 'unsure', label: 'Not sure yet' }
	],
	h1Quote: 'Request a quote',
	h1Contact: 'Contact',
	h1Hosting: 'Request Hangar hosting',
	introHosting:
		'Tell me what the app is and how it runs today: a container image, a compose file, a static site or a bot. I will come back with questions and a start date. Your message is posted to a private Discord channel only I can read.',
	introQuote:
		'Tell me what the process is today and what it should be instead. Rough is fine — I will come back with questions, a scope, and a price. Your message is posted to a private Discord channel only I can read.',
	introContact: 'Invites, questions, quotes, or something that does not fit a form. Either channel reaches me. Your message is posted to a private Discord channel only I can read.',
	emailLabel: 'Email'
};

// ── Product and service pages ────────────────────────────────────────────────
export const automation = {
	title: 'Automation · Starhold Software',
	description:
		'Python, PowerShell, and Bash automation, plus purpose-built applications — scoped and quoted per job.',
	eyebrow: 'Quoted work',
	h1: 'Automation',
	lede: 'Python, PowerShell, and Bash automation, plus purpose-built applications that replace software you are renting by the seat.',
	body: [
		'The pattern is almost always the same. A task is done by hand, then by a script somebody wrote in an afternoon, then by six scripts nobody wants to touch. I replace that with something that runs on a schedule, records what it did, and tells you when it did not.',
		'You get the code in a repository you control and a runbook a colleague can follow. If you want me to keep operating it afterwards, that is a separate line on the quote, not a hostage situation.'
	],
	provesHeading: 'What backs this up',
	formHeading: 'Ask for a quote'
};

export const customBots = {
	title: 'Custom Discord Bots · Starhold Software',
	description:
		'A Discord bot under your own server name and avatar, operated by me, billed flat and monthly through Stripe.',
	eyebrow: 'Supporting evidence',
	h1: 'Custom Discord Bots',
	lede: "The big-bot feature set — moderation, welcome and roles, logging, leveling, giveaways, custom commands — under your server's own name and avatar, operated by me.",
	body: [
		'Feature requests go on a shared public roadmap: built once, and every bot gets them. Your request becomes everyone else\'s feature.'
	],
	provesHeading: 'What this proves',
	proves: {
		text: 'This page is the commerce path that carries live Stripe Checkout and verified webhooks. It is here as proof that the payment and provisioning plumbing works, not as the headline product.',
		evidence: ev('stripe-live-checkout')
	},
	configureHeading: 'Build one'
};

export const qnix = {
	title: 'QNix · Starhold Software',
	description:
		'QNix: bring-your-own-device hosting with high availability. In development, with the design notes published first.',
	eyebrow: 'In development',
	h1: 'QNix',
	lede: 'Bring-your-own-device hosting with high availability — hold your own infrastructure the way I hold mine.',
	body: [
		'I am the first customer. Every rough edge gets found on my hardware before it gets near anyone else\'s, which is slower and considerably less embarrassing.'
	],
	provesHeading: 'What this proves',
	proves: {
		text: 'The architecture, hosting model, and tenancy and security notes were written down and published before the product existed. You can read the design before you decide whether to trust it.',
		evidence: ev('qnix-design-docs')
	},
	docsLabel: 'Read the QNix design notes',
	docsHref: 'https://starhold.fyi',
	formHeading: 'Register interest'
};

export const shushgame = {
	title: 'Shushgame · Starhold Software',
	description:
		'Shushgame: a Discord server that is itself the game, built and operated end to end, solo.',
	eyebrow: 'Case study',
	h1: 'Shushgame',
	lede: 'A Discord server that is itself the game, built on a custom bot with its own site.',
	body: [
		'It is the fullest answer I have to "can you actually finish something": design, bot, billing, infrastructure, and a live site, none of it handed to anyone else.'
	],
	provesHeading: 'What this proves',
	proves: {
		text: 'A whole product carried end to end, live and playable, on hosting I run myself.',
		evidence: ev('shushgame-live')
	},
	visitLabel: 'Open shushgame.com',
	visitHref: 'https://shushgame.com'
};

export { stats };
