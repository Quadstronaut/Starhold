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
	operator: 'Kyle Green',
	handle: 'Quadstronaut',
	foundedYear: 2026,
	email: 'hello@starhold.dev',
	linkedin: 'https://www.linkedin.com/in/quadstronaut',
	/** The owner's line, kept because it reads confident rather than costumed. */
	strapline: 'Sovereign systems, built and operated.'
};

export type ProofSignal = {
	label: string;
	verifier: string;
	href: string;
	evidence: string;
};

export const home = {
	title: 'Starhold Software — automation and platform engineering',
	description:
		'Kyle Green builds automation, custom bots, and integration work for teams that outgrew their scripts — and runs it on infrastructure he keeps online himself.',

	hero: {
		eyebrow: 'Starhold Software · automation and platform engineering',
		h1: 'Automation and platform engineering for teams that outgrew scripts.',
		sub: 'You wrote a script. Then a folder of them. Now something that matters depends on them — I build the version that holds, and I keep it running.',
		ctaPrimary: { label: 'Request a quote', href: '/contact?intent=quote' },
		ctaSecondary: { label: 'See the work', href: '/work' },
		byline:
			'Starhold Software is one person: Kyle Green. You get me on the call, and you get me when it breaks.',
		bylineLink: { label: 'How I work', href: '/operator' }
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
			label: 'Certifications and day job',
			verifier: 'linkedin.com/in/quadstronaut',
			href: 'https://www.linkedin.com/in/quadstronaut',
			evidence: ev('linkedin')
		}
	] satisfies ProofSignal[],

	capabilities: {
		eyebrow: 'What I sell',
		h2: 'Four ways to hire me',
		sub: 'Scoped and quoted per job. No retainer, no minimum, no discovery-phase invoice.'
	},

	work: {
		eyebrow: 'The fleet',
		h2: 'Selected work',
		sub: 'Four things I built and still run. Each one is here because of what it proves, not because it is for sale.'
	},

	principles: {
		eyebrow: 'How I work',
		h2: 'Operating principles',
		sub: 'Short enough to remember, specific enough to hold me to.'
	},

	operator: {
		eyebrow: 'Who you are hiring',
		h2: 'Kyle Green',
		cta: { label: 'How I work', href: '/operator' }
	},

	contact: {
		eyebrow: 'Next step',
		h2: 'Tell me what you keep doing by hand.',
		body: 'Send me the process, the two systems that refuse to talk to each other, or the thing that keeps breaking overnight. I will tell you what it takes to fix it and what it costs.',
		cta: { label: 'Request a quote', href: '/contact?intent=quote' },
		// The quarter is filled in at request time from src/lib/availability.ts.
		// Deliberately not stored here: a hardcoded quarter goes stale and a stale
		// availability line reads worse than no availability line at all.
		availability: (quarter: string) => `Currently taking work for ${quarter}.`
	}
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
		'Automation, platform and high-availability hosting, custom bots, and full stack builds — scoped and quoted per job by Kyle Green.',
	eyebrow: 'Engagements',
	h1: 'Four ways to hire me',
	intro:
		'Every job is scoped and quoted before it starts. You get the code, the runbook, and a person who will still answer the email in six months.',
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
		'Four things Kyle Green built and still operates, and what each one demonstrates about the work.',
	eyebrow: 'The fleet',
	h1: 'Selected work',
	intro:
		'I am one person, so the portfolio is small on purpose. Everything here is live or documented, and everything here I still run.',
	items: [
		{
			id: 'shushgame',
			name: 'Shushgame',
			href: '/products/shushgame',
			status: 'Live',
			what: 'A Discord server that is itself the game, with its own site and its own payments.',
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
		title: 'Uptime is published, not claimed.',
		detail: 'Every service I run reports to a status page you can open right now, including when it is down.',
		evidence: ev('public-status-page')
	},
	{
		title: 'Nothing is rented that can be owned.',
		detail: 'The hosts are mine to administer, joined by a private mesh, and the services run rootless.',
		evidence: ev('self-hosted-fleet')
	},
	{
		title: 'Tests ship with the work.',
		detail: `This storefront alone carries ${stats.unitTests} unit tests and ${stats.e2eTests} browser tests, and the counts on this page are generated from the repository rather than typed in.`,
		evidence: ev('automated-tests'),
		// The repository is public, so this claim is checkable rather than asserted.
		link: { href: 'https://github.com/Quadstronaut/Starhold', label: 'Read them' }
	},
	{
		title: 'Money is verified, not trusted.',
		detail: 'Payments go through Stripe Checkout, and every webhook signature is checked before a single order is acted on.',
		evidence: ev('stripe-live-checkout')
	},
	{
		title: 'Design notes come before code.',
		detail: 'The architecture for the platform in development is written up and published where you can read it.',
		evidence: ev('qnix-design-docs')
	}
];

// ── The operator ─────────────────────────────────────────────────────────────
export const operator = {
	title: 'Kyle Green · Starhold Software',
	description:
		'Kyle Green runs Starhold Software: certifications, day job, and how an engagement actually works.',
	eyebrow: 'The operator',
	h1: 'Kyle Green',
	lede: 'I run Starhold Software. It is one person, and that person is me.',
	bio: [
		'I build automation and the platforms it runs on. Most of what I do starts the same way: somebody has a process that works right up until the person who knows it is on holiday, and they want it to stop depending on that.',
		'I take the whole thing — the code, the host it runs on, the alert that fires when it stops — because handing back a script and wishing you luck is how the problem comes back in six months.'
	],
	certsHeading: 'Certifications',
	certs: [
		{ text: 'AWS Certified Solutions Architect', evidence: ev('cert-aws-saa') },
		{ text: 'Certified in Python', evidence: ev('cert-python') },
		{ text: 'Certified in log aggregation at the administration tier', evidence: ev('cert-log-admin') }
	],
	dayJobHeading: 'Day job',
	dayJob: {
		text: 'By day I keep automation running for an organisation that operates worldwide. I do not name the employer here, and this work is entirely separate from it.',
		evidence: ev('day-job-global-automation')
	},
	howHeading: 'How an engagement works',
	how: [
		'You describe the problem. Email is fine; a screen recording of the manual process is better.',
		'I come back with a scope, a price, and the parts I think are a bad idea.',
		'I build it, you watch it run, and I hand over the code and the runbook.',
		'If I am hosting it, it goes on the status page like everything else I operate.'
	],
	linkHeading: 'Elsewhere',
	profileLink: {
		label: 'linkedin.com/in/quadstronaut',
		href: site.linkedin,
		evidence: ev('linkedin')
	},
	cta: { label: 'Request a quote', href: '/contact?intent=quote' }
};

// ── Contact ──────────────────────────────────────────────────────────────────
export const contact = {
	title: 'Contact · Starhold Software',
	description: 'Ask Kyle Green for a quote, or just ask a question. Email or the form below.',
	eyebrow: 'Get in touch',
	h1Quote: 'Request a quote',
	h1Contact: 'Contact',
	introQuote:
		'Tell me what the process is today and what it should be instead. Rough is fine — I will come back with questions, a scope, and a price.',
	introContact: 'Questions, quotes, or something that does not fit a form. Either channel reaches me.',
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
		'A Discord bot under your own server name and avatar, operated by Kyle Green, billed flat and monthly through Stripe.',
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
		'Shushgame: a Discord server that is itself the game, built and operated end to end by Kyle Green.',
	eyebrow: 'Case study',
	h1: 'Shushgame',
	lede: 'A Discord server that is itself the game, built on a custom bot with payments and its own hosting behind it.',
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
