// STAR-310: the sitemap, generated from the route tree (src/lib/sitemap.ts). robots.txt points here.
import { sitemapXml } from '#lib/sitemap.js';

export const GET = () =>
	new Response(sitemapXml(), {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
