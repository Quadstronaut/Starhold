import { redirect } from '@sveltejs/kit';

// /about was the operator page. It moved to /operator, and old links (and any
// search result already in the wild) must not 404 — this is a real 308, not a
// client-side bounce, so crawlers and curl see it too.
export const GET = () => redirect(308, '/operator');
