// ─────────────────────────────────────────────────────────────────────────────
// CHANGELOG (STAR-310). The one source for /changelog and /changelog/rss.xml.
//
// How to add an entry (also in docs/changelog.md):
//   • Add it at the TOP of CHANGELOG, in the same PR that ships the customer-visible change.
//   • date: the UTC day it went live, YYYY-MM-DD. Never a future date.
//   • product: the product's public name, or "Starhold" for the site and account.
//   • title: one line. body: two or three plain sentences a customer can read.
//   • link (optional): the product page or its docs, an absolute https URL or a path on this site.
//   • Never: ticket keys, host names that are not public, people's names, email addresses, or any detail
//     of a security fix. Hardening work is written "security maintenance" or left out.
//   • Write only what is live and true today. If you cannot check it, leave it out.
// changelog.test.ts enforces the order, the dates and the forbidden patterns.
// ─────────────────────────────────────────────────────────────────────────────

export type ChangelogEntry = {
	/** UTC day it went live, YYYY-MM-DD. */
	date: string;
	product: string;
	title: string;
	body: string;
	link?: { href: string; label: string };
};

export const SITE_URL = 'https://starhold.dev';

export const CHANGELOG: ChangelogEntry[] = [
	{
		date: '2026-11-21',
		product: 'Starhold',
		title: 'A security contact file for every Starhold site',
		body: 'starhold.dev now publishes a security.txt file that says how to report a security problem to me. The other Starhold sites point to the same file.',
		link: { href: '/.well-known/security.txt', label: 'Read security.txt' }
	},
	{
		date: '2026-11-21',
		product: 'Heliostat',
		title: 'Fleet status updates you can read even when the status page is down',
		body: 'Each update on the Starhold fleet status page is now also posted to public Nostr relays, signed. The outage reader is a single web page that fetches those posts and checks every signature in your browser. Customer status pages do not have this yet.',
		link: { href: 'https://starholdsoftware.github.io/status-reader/', label: 'Open the outage reader' }
	},
	{
		date: '2026-11-21',
		product: 'Echo',
		title: 'Starhold Echo: free troubleshooting answers',
		body: 'echo.starhold.app shows what the internet sees when you connect: your public address, the user agent your program sends, your request headers and the TLS details of the connection. Every answer comes as a web page, plain text or JSON, with curl and PowerShell examples. No account and no keys.',
		link: { href: 'https://echo.starhold.app/', label: 'Open Echo' }
	},
	{
		date: '2026-11-20',
		product: 'Starbot',
		title: 'Starbot is open',
		body: 'Starbot, my Discord bot, can now be added to a server. The free modules cost nothing. Plus is $5 and Pro is $19 a month, and each covers two servers.',
		link: { href: 'https://dash.starhold.app/', label: 'Add Starbot' }
	},
	{
		date: '2026-11-20',
		product: 'Zenithmark',
		title: 'WordPress known-vulnerability check',
		body: 'When a scanned site runs WordPress, the report now lists the core, plugin and theme versions its home page shows that have publicly known vulnerabilities, from the Wordfence Intelligence list. It makes no extra request to the site, and it is information only: it does not change the grade.',
		link: { href: 'https://domainscanner.starhold.app/checks/wordpress-vulnerabilities', label: 'How the check works' }
	},
	{
		date: '2026-11-20',
		product: 'Starhold',
		title: 'A simpler starhold.dev',
		body: 'The site now shows every product two ways: by who it is for (home, small business, teams) and as one list. Each audience has its own page, and the Products page has everything in one place.',
		link: { href: '/products', label: 'The Products page' }
	},
	{
		date: '2026-11-18',
		product: 'Peridot',
		title: 'Peridot has a page here',
		body: 'Peridot is a free period tracker for Android that keeps everything on your phone, encrypted. Its page explains why it exists and links its privacy policy. It is coming to Google Play.',
		link: { href: '/peridot', label: 'About Peridot' }
	},
	{
		date: '2026-11-17',
		product: 'Starhold',
		title: 'Lower prices',
		body: 'Entry plans now cost $5 a month and middle plans $19 a month on Umbermark, Zenithmark and Heliostat.',
		link: { href: '/pricing', label: 'See every price' }
	},
	{
		date: '2026-11-16',
		product: 'Heliostat',
		title: 'Status updates in Slack, Microsoft Teams, Discord and ntfy',
		body: 'A status page can now send each update straight to a Slack channel, a Microsoft Teams channel, a Discord channel or an ntfy topic, as well as to a plain webhook. The docs show how to set each one up.',
		link: { href: 'https://status.starhold.app/docs/webhooks', label: 'Webhook docs' }
	},
	{
		date: '2026-11-16',
		product: 'Zenithmark',
		title: 'Expiry dates, AI crawler rules and tracker checks',
		body: 'The report now shows when the domain registration expires, and paid monitoring emails a reminder before the domain or its HTTPS certificate expires. New checks read the site’s llms.txt, its robots.txt rules for AI crawlers and its structured data, and list the third-party trackers its home page loads.',
		link: { href: 'https://domainscanner.starhold.app/checks', label: 'Every check' }
	},
	{
		date: '2026-11-14',
		product: 'Starhold',
		title: 'Starhold Account and paid plans',
		body: 'One Starhold Account, signed in with Google, now works across Umbermark, Zenithmark, Solatype and Heliostat. Paid plans are on sale, and you can export or delete your data from the account.',
		link: { href: '/pricing', label: 'See every price' }
	}
];

/** Stable id for an entry: its date and a slug of its title. Used as the page anchor and the feed GUID,
 *  so do not edit the title of a published entry (that would change its id). */
export function entryId(e: ChangelogEntry): string {
	const slug = e.title
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `${e.date}-${slug}`;
}

/** Absolute URL for an entry link (paths on this site become https://starhold.dev/...). */
export function absolute(href: string): string {
	return href.startsWith('/') ? SITE_URL + href : href;
}

/** RFC 822 date for RSS: midnight UTC of the entry's day (the day is the only true date we hold). */
export function rfc822(date: string): string {
	return new Date(`${date}T00:00:00Z`).toUTCString();
}
