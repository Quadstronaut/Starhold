import { parseCatalog } from '$lib/products';
import { env } from '$env/dynamic/private';
import catalog from '../../../static/products.json';

export const load = () => {
	const bots = parseCatalog(catalog).find((p) => p.id === 'custom-bots');
	// catalog is the price SSOT — if a price vanishes, fail the build loudly
	if (!bots?.pricing.monthly_usd || !bots.pricing.ops_pack_usd)
		throw new Error('custom-bots pricing incomplete in catalog');
	// PIPELINE_HANDOFF (default off): when on, the cart hands the build sheet to
	// dashboard-api (/api/handoff) instead of creating a Stripe session directly.
	return {
		monthlyUsd: bots.pricing.monthly_usd,
		opsPackUsd: bots.pricing.ops_pack_usd,
		pipelineMode: !!env.PIPELINE_HANDOFF
	};
};
