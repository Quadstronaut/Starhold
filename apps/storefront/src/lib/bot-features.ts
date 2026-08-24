// The sellable feature set for Discord Bots. Mirrors the marketing copy on
// /products/custom-bots and the docs bot feature manual.
//
// Pricing buckets (`pack`): everything is in the $5/mo flat base EXCEPT the
// `ops` trio, which forms the +$9/mo Ops Pack (infra-heavy: real recurring
// compute/egress/API cost). `category` drives page grouping; `pack` drives price.
//
// IDs are a wire contract — they ride in localStorage carts and Stripe metadata
// of live subscriptions. NEVER rename an existing id; only add new ones.
export type BotCategory = 'community' | 'automation' | 'ops' | 'custom';
export type BotPack = 'base' | 'ops';
export type BotFeature = { id: string; name: string; blurb: string; category: BotCategory; pack: BotPack };

export const BOT_FEATURES: BotFeature[] = [
	// ── Community (base) — the big-bot features that normally cost more ──
	{ id: 'moderation', name: 'Moderation', blurb: 'Kick/ban/timeout, word filters, anti-spam, raid protection.', category: 'community', pack: 'base' },
	{ id: 'welcome', name: 'Welcome & Roles', blurb: 'Greetings, autorole, reaction/button roles.', category: 'community', pack: 'base' },
	{ id: 'logging', name: 'Logging & Audit', blurb: 'Message, member, and mod-action logs to channels you pick.', category: 'community', pack: 'base' },
	{ id: 'leveling', name: 'Leveling & Engagement', blurb: 'XP, ranks, leaderboards, level-up announcements.', category: 'community', pack: 'base' },
	{ id: 'giveaways', name: 'Giveaways & Events', blurb: 'Timed draws with entry requirements and rerolls.', category: 'community', pack: 'base' },
	{ id: 'suggestions', name: 'Suggestion Boards', blurb: 'Suggestion channels with reaction-vote tallies.', category: 'community', pack: 'base' },
	{ id: 'github-stream', name: 'GitHub Activity', blurb: "Stream members' GitHub commits — grouped by author, with messages and counts.", category: 'community', pack: 'base' },

	// ── Automation & Integrations (base) — more than Zapier/IFTTT, at $5 ──
	{ id: 'scheduled-tasks', name: 'Scheduled Tasks', blurb: 'Cron jobs: recurring posts, digests, and reminders.', category: 'automation', pack: 'base' },
	{ id: 'forms-tickets', name: 'Forms & Tickets', blurb: 'Intake forms routed to threads; ticketing workflow.', category: 'automation', pack: 'base' },
	{ id: 'approvals', name: 'Approval Flows', blurb: 'Button/select-driven approval and request workflows.', category: 'automation', pack: 'base' },
	{ id: 'data-sync', name: 'Data Sync', blurb: 'Read/write Google Sheets, Notion, or a database.', category: 'automation', pack: 'base' },
	{ id: 'integration-relays', name: 'Integration Relays', blurb: 'GitHub, CI, Stripe, and webhook events → your channels.', category: 'automation', pack: 'base' },
	{ id: 'alerts-oncall', name: 'Alerts & On-Call', blurb: 'Threshold alerts with escalation and mentions.', category: 'automation', pack: 'base' },

	// ── Ops Pack (+$9/mo) — infra-heavy, real recurring cost ──
	{ id: 'server-monitoring', name: 'Server Monitoring', blurb: 'Uptime plus CPU/RAM/disk alerts for your servers.', category: 'ops', pack: 'ops' },
	{ id: 'app-monitoring', name: 'Application Monitoring', blurb: 'Health checks, error/latency alerts, deploy pings.', category: 'ops', pack: 'ops' },
	{ id: 'scheduled-scraping', name: 'Scheduled Scraping', blurb: 'Watch a page or API on a schedule, post changes.', category: 'ops', pack: 'ops' },

	// ── Custom Commands (base) — the bespoke anchor ──
	{ id: 'commands', name: 'Custom Commands', blurb: 'Your own slash commands and canned replies — anything else.', category: 'custom', pack: 'base' }
];

// Ops Pack membership — the source of truth for the +$9 second Stripe line item.
export const OPS_FEATURES = new Set(BOT_FEATURES.filter((f) => f.pack === 'ops').map((f) => f.id));

// Launch gate — the "Proven Pack": the only features with a real, deployable fleet
// module today (all five run live in the discord.py proof fleet). When PIPELINE_HANDOFF
// is on, the storefront sells ONLY these; the other 12 stay defined (the IDs are a live
// wire contract — never delete) but hidden until their modules ship. All base — no Ops
// feature is live at launch. See docs/superpowers/specs/2026-06-25-storefront-fleet-integration-design.md.
export const LIVE_FEATURES = new Set<string>(['moderation', 'welcome', 'leveling', 'suggestions', 'github-stream']);
