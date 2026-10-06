// Discord webhook relay + embed builders.
import { decodeBuildSheet } from '$lib/build-sheet';
import { OPS_FEATURES } from '$lib/bot-features';

// Brand accent, matching the site's --accent token. Red is reserved for errors.
const ACCENT = 0xffb347;

// Discord caps embeds at 25 fields; 2 are used by Customer/Monthly, so
// list at most 23 bots and roll the rest into a summary field.
const MAX_BOT_FIELDS = 23;

export type Embed = {
	title: string;
	color: number;
	fields: { name: string; value: string; inline?: boolean }[];
	footer?: { text: string };
};

export async function postDiscord(webhookUrl: string, embed: Embed): Promise<void> {
	const res = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ embeds: [embed] })
	});
	if (!res.ok) throw new Error(`discord webhook returned ${res.status}`);
}

// minimal session shape — accepts a real Stripe.Checkout.Session
export function orderEmbed(session: {
	id: string;
	amount_total?: number | null;
	customer_details?: { email?: string | null } | null;
	metadata?: Record<string, string> | null;
}): Embed {
	const bots = decodeBuildSheet(session.metadata ?? {});
	return {
		title: `🛰️ New order — ${bots.length} bot${bots.length === 1 ? '' : 's'}`,
		color: ACCENT,
		fields: [
			{ name: 'Customer', value: session.customer_details?.email ?? 'unknown', inline: true },
			{ name: 'Monthly', value: `$${((session.amount_total ?? 0) / 100).toFixed(2)}`, inline: true },
			...bots.slice(0, MAX_BOT_FIELDS).map((b, i) => ({
				name: `Bot ${i + 1}${b.server ? ` — ${b.server}` : ''}${b.features.some((f) => OPS_FEATURES.has(f)) ? ' · Ops Pack' : ''}`,
				value: b.features.join(', ') || '(no features decoded)'
			})),
			...(bots.length > MAX_BOT_FIELDS
				? [{ name: `+ ${bots.length - MAX_BOT_FIELDS} more bots`, value: 'full build sheet in Stripe session metadata' }]
				: [])
		],
		footer: { text: `session ${session.id}` }
	};
}

// Red is reserved for errors; billing problems the operator must act on use it.
const ALERT = 0xe5484d;

// Stripe ids can arrive as a string, an expanded object, or null.
function stripeId(v: unknown): string {
	if (typeof v === 'string') return v;
	if (v && typeof v === 'object' && typeof (v as { id?: unknown }).id === 'string') return (v as { id: string }).id;
	return 'unknown';
}

// Discord caps embeds at 25 fields and 6000 characters in total.
const MAX_FIELDS = 25;
// 23 bot fields * (name + 200) plus fixed fields stays well under 6000.
const MAX_BOT_VALUE = 200;

// bot_N metadata keys (ordered), if the object carries any. Values are the raw
// build-sheet strings (server name + feature list) — no secrets live there.
// `fixed` = fields the embed already uses; bots + overflow summary must fit the rest.
function botFields(metadata: Record<string, string> | null | undefined, fixed: number) {
	const all = Object.entries(metadata ?? {})
		.filter(([k]) => /^bot_\d+$/.test(k))
		.sort(([a], [b]) => Number(a.slice(4)) - Number(b.slice(4)));
	const budget = MAX_FIELDS - fixed;
	// Everything fits: no summary. Otherwise reserve one slot for the summary.
	const shown = all.length <= budget ? all : all.slice(0, budget - 1);
	const fields: { name: string; value: string }[] = shown.map(([k, v]) => {
		const s = String(v);
		return { name: k, value: s.length > MAX_BOT_VALUE ? `${s.slice(0, MAX_BOT_VALUE - 1)}…` : s || '(empty)' };
	});
	if (shown.length < all.length) {
		fields.push({
			name: `+ ${all.length - shown.length} more bots`,
			value: 'not listed here; full build sheet in Stripe metadata'
		});
	}
	return fields;
}

// minimal subscription shape — accepts a real Stripe.Subscription
export function subscriptionCancelledEmbed(sub: {
	id: string;
	customer?: unknown;
	metadata?: Record<string, string> | null;
}): Embed {
	return {
		// Stripe.Subscription carries no email, only the customer id (ticket asks for email/id).
		title: '🛑 Subscription cancelled — revoke/pause bots',
		color: ALERT,
		fields: [
			{ name: 'Customer', value: stripeId(sub.customer), inline: true },
			{ name: 'Subscription', value: sub.id ?? 'unknown', inline: true },
			...botFields(sub.metadata, 2)
		],
		footer: { text: `subscription ${sub.id ?? 'unknown'}` }
	};
}

// minimal invoice shape — accepts a real Stripe.Invoice (old and new API versions)
export function paymentFailedEmbed(inv: {
	id?: string;
	customer?: unknown;
	customer_email?: string | null;
	amount_due?: number | null;
	attempt_count?: number | null;
	subscription?: unknown;
	parent?: { subscription_details?: { subscription?: unknown; metadata?: Record<string, string> | null } | null } | null;
	subscription_details?: { metadata?: Record<string, string> | null } | null;
}): Embed {
	const subId = stripeId(inv.subscription ?? inv.parent?.subscription_details?.subscription);
	const metadata = inv.subscription_details?.metadata ?? inv.parent?.subscription_details?.metadata;
	return {
		title: '⚠️ Payment failed',
		color: ALERT,
		fields: [
			{ name: 'Customer', value: inv.customer_email ?? stripeId(inv.customer), inline: true },
			{ name: 'Customer ID', value: stripeId(inv.customer), inline: true },
			{ name: 'Subscription', value: subId, inline: true },
			{ name: 'Amount due', value: `$${((inv.amount_due ?? 0) / 100).toFixed(2)}`, inline: true },
			{ name: 'Attempt', value: String(inv.attempt_count ?? 'unknown'), inline: true },
			...botFields(metadata, 5)
		],
		footer: { text: `invoice ${inv.id ?? 'unknown'}` }
	};
}

const KIND_LABELS: Record<string, string> = {
	contact: '📨 Contact message',
	quote: '🛠️ Quote request',
	qnix: '🛰️ QNix interest',
	fullstack: '🏗️ Full Stack inquiry'
};

export function intakeEmbed(kind: string, name: string, email: string, message: string): Embed {
	return {
		title: KIND_LABELS[kind] ?? kind,
		color: ACCENT,
		fields: [
			{ name: 'From', value: name || '(no name)', inline: true },
			{ name: 'Email', value: email, inline: true },
			{ name: 'Message', value: message.slice(0, 1000) } // Discord field cap is 1024
		]
	};
}
