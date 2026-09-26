// Pipeline-mode checkout: hand the build sheet to dashboard-api and return the URL to
// redirect the customer to (Discord OAuth → Stripe Checkout → token wizard). Active only
// when PIPELINE_HANDOFF is on — the cart routes here instead of /api/checkout. Contract:
// communicate.md §3. The storefront validates the cart shape + that every feature is LIVE,
// then forwards { bots:[{ features }] } with the intake bearer. It never touches a token.
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createHandoff } from '$lib/server/handoff';
import { BOT_FEATURES, LIVE_FEATURES } from '$lib/bot-features';
import { MAX_BOTS } from '$lib/build-sheet';
import type { RequestHandler } from './$types';

const VALID = new Set(BOT_FEATURES.map((f) => f.id));

export const POST: RequestHandler = async ({ request }) => {
	if (!env.DASHBOARD_API_BASE || !env.DASHBOARD_INTAKE_BEARER)
		throw error(503, 'checkout offline — try again shortly');

	let bots: { features?: unknown }[];
	try {
		bots = (await request.json())?.bots;
	} catch {
		throw error(400, 'request body must be JSON');
	}
	if (!Array.isArray(bots) || bots.length === 0) throw error(400, 'cart is empty');
	// Parity with the old /api/checkout codec (encodeBuildSheet) — cap the cart so a
	// malformed/abusive payload can't be forwarded wholesale to dashboard-api.
	if (bots.length > MAX_BOTS) throw error(400, `max ${MAX_BOTS} bots per order`);

	// Drop the configurator's free-text `server` field — branding/target server are
	// collected post-purchase in the dashboard wizard. Forward only the feature set,
	// and refuse anything not in the live Proven Pack (defends against stale carts).
	const cleaned = bots.map((b, i) => {
		const features = Array.isArray(b?.features) ? (b.features as string[]) : [];
		if (features.length === 0) throw error(400, `bot ${i + 1}: pick at least one feature`);
		for (const f of features) {
			if (!VALID.has(f)) throw error(400, `bot ${i + 1}: unknown feature ${f}`);
			if (!LIVE_FEATURES.has(f)) throw error(400, `bot ${i + 1}: ${f} isn't available yet`);
		}
		return { features: [...new Set(features)] }; // dedupe — a bot can't order the same feature twice
	});

	let url: string;
	try {
		url = await createHandoff(env.DASHBOARD_API_BASE, env.DASHBOARD_INTAKE_BEARER, cleaned);
	} catch {
		throw error(502, 'could not reach checkout — try again shortly');
	}
	return json({ url });
};
