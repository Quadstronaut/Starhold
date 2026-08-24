// Cart → one Stripe Checkout Session (subscription mode). The build sheet
// rides in metadata (session AND subscription, so it outlives the session).
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getStripe } from '$lib/server/stripe';
import { encodeBuildSheet, opsPackQty, type BotOrder } from '$lib/build-sheet';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	if (!env.STRIPE_PRICE_CUSTOM_BOT) throw error(503, 'checkout offline — try again shortly');

	let bots: BotOrder[];
	try {
		bots = (await request.json())?.bots;
	} catch {
		throw error(400, 'request body must be JSON');
	}

	let metadata: Record<string, string>;
	try {
		metadata = encodeBuildSheet(bots); // validates shape, features, caps
	} catch (e) {
		throw error(400, e instanceof Error ? e.message : 'invalid cart');
	}

	// Every bot pays the $5 base; bots carrying an Ops Pack feature pay +$9 via a
	// second flat line item. Refuse rather than silently undercharge if the Ops
	// Pack price isn't configured on the host.
	const line_items = [{ price: env.STRIPE_PRICE_CUSTOM_BOT, quantity: bots.length }];
	const opsQty = opsPackQty(bots);
	if (opsQty > 0) {
		if (!env.STRIPE_PRICE_OPS_PACK) throw error(503, 'ops pack checkout offline — try again shortly');
		line_items.push({ price: env.STRIPE_PRICE_OPS_PACK, quantity: opsQty });
	}

	const session = await getStripe().checkout.sessions.create({
		mode: 'subscription',
		line_items,
		metadata,
		subscription_data: { metadata },
		success_url: `${url.origin}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${url.origin}/cart`
	});

	if (!session.url) throw error(502, 'stripe did not return a checkout url');
	return json({ url: session.url });
};
