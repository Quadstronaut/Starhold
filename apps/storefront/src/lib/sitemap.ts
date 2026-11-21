// STAR-310: /sitemap.xml, generated from the route tree so a new page appears on its own.
//
// Every +page.svelte under src/routes is a candidate. A dynamic segment needs an expander below (today only
// [audience], from the one audience list); a route that cannot be expanded is a build-time error in the tests,
// not a silent gap. Server-only routes (+server.ts: the API, the contact form's POST endpoint, the legal .txt
// twins, the feed, this sitemap) are never pages, so they never appear. Error pages are not routes.
// Absolute https URLs on starhold.dev only. lastmod only where a true content date is known (the changelog's
// newest entry); build time is not a content date, so every other URL has none.
import { LAUNCHED } from './launch';
import { AUDIENCES } from './content/catalog';
import { CHANGELOG, SITE_URL } from './content/changelog';

/** Route ids (as SvelteKit names them, e.g. "/for/[audience]") of every page in the app. */
export const PAGE_ROUTES: string[] = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'))
	.map((f) => f.replace(/^\/src\/routes/, '').replace(/\/\+page\.svelte$/, '') || '/')
	.map((r) => r.replace(/\/\([^)]+\)/g, '') || '/') // (group) segments are not in the URL
	.sort();

/** Pages that exist but must not be listed, with the reason. */
export const EXCLUDED: Record<string, string> = {
	// Before launch it was the invitation form; with LAUNCHED it answers 307 to /#services (src/routes/invite/+page.ts).
	...(LAUNCHED ? { '/invite': 'redirects to /#services while LAUNCHED' } : {})
};

/** Expanders for dynamic segments: route id -> concrete paths. */
const EXPAND: Record<string, () => string[]> = {
	'/for/[audience]': () => AUDIENCES.map((a) => `/for/${a.id}`)
};

/** True content dates, by path (YYYY-MM-DD). */
function lastmodFor(path: string): string | undefined {
	if (path === '/changelog') return CHANGELOG[0]?.date;
	return undefined;
}

export type SitemapUrl = { loc: string; lastmod?: string };

export function sitemapPaths(): string[] {
	const out: string[] = [];
	for (const route of PAGE_ROUTES) {
		if (route in EXCLUDED) continue;
		if (route.includes('[')) {
			const expand = EXPAND[route];
			if (!expand) throw new Error(`sitemap: no expander for dynamic route ${route}`);
			out.push(...expand());
		} else {
			out.push(route);
		}
	}
	return [...new Set(out)].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));
}

export function sitemapUrls(): SitemapUrl[] {
	return sitemapPaths().map((p) => {
		const lastmod = lastmodFor(p);
		return { loc: p === '/' ? `${SITE_URL}/` : SITE_URL + p, ...(lastmod ? { lastmod } : {}) };
	});
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function sitemapXml(urls = sitemapUrls()): string {
	const body = urls
		.map((u) => `  <url>\n    <loc>${esc(u.loc)}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>`)
		.join('\n');
	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
