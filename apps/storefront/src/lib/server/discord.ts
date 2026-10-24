// Discord webhook relay. Notice-only since STAR-145 (ledger Q23/Q47/Q65):
// Discord learns that a message exists, never who sent it or what it says.

export async function postDiscord(webhookUrl: string, content: string): Promise<void> {
	const res = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ content })
	});
	if (!res.ok) throw new Error(`discord webhook returned ${res.status}`);
}

/**
 * The ONLY text that goes to Discord: a ticket number and a product name.
 * Takes no name/email/body argument on purpose, so PII cannot leak in here.
 * `productLabel` is a catalogue label chosen from our own list, never user text.
 */
export function noticeText(kind: string, id: number, productLabel = ''): string {
	if (kind === 'invite') return `New invite request #${id}` + (productLabel ? ` · ${productLabel}` : '');
	return `New message #${id}`;
}
