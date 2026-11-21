// STAR-310: the changelog as RSS 2.0. Pure function of CHANGELOG, so the feed and the page cannot drift.
// Dates: each item's pubDate is midnight UTC of its day; the channel's lastBuildDate is the newest entry's day.
// Build time is never used: it is not a content date.
import { CHANGELOG, SITE_URL, absolute, entryId, rfc822 } from './changelog';

/** XML text escape (element content and attribute values). */
export const xml = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const FEED_URL = `${SITE_URL}/changelog/rss.xml`;
export const PAGE_URL = `${SITE_URL}/changelog`;

export function changelogRss(entries = CHANGELOG): string {
	const items = entries
		.map((e) => {
			const url = `${PAGE_URL}#${entryId(e)}`;
			const more = e.link ? ` ${e.link.label}: ${absolute(e.link.href)}` : '';
			return [
				'    <item>',
				`      <title>${xml(`${e.product}: ${e.title}`)}</title>`,
				`      <link>${xml(url)}</link>`,
				`      <guid isPermaLink="true">${xml(url)}</guid>`,
				`      <pubDate>${rfc822(e.date)}</pubDate>`,
				`      <category>${xml(e.product)}</category>`,
				`      <description>${xml(e.body + more)}</description>`,
				'    </item>'
			].join('\n');
		})
		.join('\n');
	const newest = entries[0]?.date;
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'  <channel>',
		'    <title>Starhold changelog</title>',
		`    <link>${PAGE_URL}</link>`,
		`    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml"/>`,
		'    <description>What I shipped across Starhold, newest first.</description>',
		'    <language>en</language>',
		newest ? `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>` : '',
		items,
		'  </channel>',
		'</rss>',
		''
	]
		.filter((l) => l !== '')
		.join('\n') + '\n';
}
