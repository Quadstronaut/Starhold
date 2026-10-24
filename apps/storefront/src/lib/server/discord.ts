// Discord webhook relay + intake embed builder.
// Stripe order/subscription/payment embeds were removed 2026-10-24 (STAR-145).

// Brand accent, matching the site's --accent token. Red is reserved for errors.
const ACCENT = 0xffb347;

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

const KIND_LABELS: Record<string, string> = {
	contact: '📨 Contact message',
	qnix: '🛰️ QNix interest',
	invite: '🎟️ Invite request'
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
