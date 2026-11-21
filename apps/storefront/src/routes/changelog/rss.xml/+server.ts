// STAR-310: RSS 2.0 feed of the changelog. Built from the same list as /changelog, newest first.
import { changelogRss } from '#lib/content/changelog-feed.js';

export const GET = () =>
	new Response(changelogRss(), {
		headers: {
			'content-type': 'application/rss+xml; charset=utf-8',
			'cache-control': 'public, max-age=300'
		}
	});
