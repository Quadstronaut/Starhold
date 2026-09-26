// Storefront → dashboard-api handoff (contract: communicate.md §3). The storefront
// stays marketing + configurator: it posts the build sheet to dashboard-api, which owns
// checkout, Discord OAuth, and provisioning, and returns the URL to send the customer to
// next. The storefront never creates a Stripe session and never sees a Discord token.
export type HandoffBot = { features: string[]; branding?: { displayName?: string; avatarUrl?: string } };

export async function createHandoff(base: string, bearer: string, bots: HandoffBot[]): Promise<string> {
	const res = await fetch(`${base.replace(/\/+$/, '')}/intake/build-sheet`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', authorization: `Bearer ${bearer}` },
		body: JSON.stringify({ bots })
	});
	if (!res.ok) throw new Error(`dashboard handoff returned ${res.status}`);
	const body = (await res.json().catch(() => null)) as { checkoutHandoffUrl?: string } | null;
	if (!body?.checkoutHandoffUrl) throw new Error('dashboard handoff returned no checkoutHandoffUrl');
	return body.checkoutHandoffUrl;
}
