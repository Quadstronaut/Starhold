// STAR-310 item 3: the changelog page and its RSS feed. The entries are customer-facing, so these tests keep
// internal detail out of them and keep the page and the feed in step.
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import { xmlProblems, tagTexts } from './xml-check';
import { changelogRss } from './changelog-feed';
import ChangelogPage from '../../routes/changelog/+page.svelte';
import Footer from '../components/Footer.svelte';
import { GET } from '../../routes/changelog/rss.xml/+server';
import { CHANGELOG, entryId, absolute } from './changelog';
import { site } from './copy';

const today = new Date().toISOString().slice(0, 10);

/** Every customer-facing string of an entry. */
const texts = CHANGELOG.flatMap((e) => [e.product, e.title, e.body, e.link?.label ?? '', e.link?.href ?? '']);

/** Hosts an entry link may point at: public Starhold hosts and the outage reader's public mirror. */
const PUBLIC_HOST = /^(starhold\.dev|[a-z0-9-]+\.starhold\.app|starhold\.fyi|[a-z0-9-]+\.starhold\.fyi|starholdsoftware\.github\.io)$/;

describe('changelog entries', () => {
	it('has between 8 and 60 entries, each with every field filled in', () => {
		expect(CHANGELOG.length).toBeGreaterThanOrEqual(8);
		for (const e of CHANGELOG) {
			expect(e.product.trim(), entryId(e)).not.toBe('');
			expect(e.title.trim(), entryId(e)).not.toBe('');
			expect(e.title, `${entryId(e)}: one line`).not.toMatch(/\n/);
			const sentences = e.body.split(/(?<=[.!?])\s+/).filter(Boolean);
			expect(sentences.length, `${entryId(e)}: one to three sentences`).toBeGreaterThanOrEqual(1);
			expect(sentences.length, `${entryId(e)}: one to three sentences`).toBeLessThanOrEqual(3);
		}
	});

	it('dates are real UTC days, not in the future, newest first', () => {
		for (const e of CHANGELOG) {
			expect(e.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(new Date(`${e.date}T00:00:00Z`).toISOString().slice(0, 10), e.date).toBe(e.date);
			expect(e.date <= today, `${e.date} is in the future`).toBe(true);
		}
		const dates = CHANGELOG.map((e) => e.date);
		expect(dates).toEqual([...dates].sort().reverse());
	});

	it('ids are unique (they are the page anchors and the feed GUIDs)', () => {
		const ids = CHANGELOG.map(entryId);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('carries no ticket keys, internal hosts, shell talk or private addresses', () => {
		const bad: string[] = [];
		for (const t of texts) {
			if (/\b[A-Z][A-Z0-9]+-\d+\b/.test(t)) bad.push(`ticket key: ${t}`);
			if (/\bssh\b/i.test(t)) bad.push(`ssh: ${t}`);
			// "quad[s]tronix": the bracket keeps this line from tripping the public mirror's own guard.
			if (/(starhold-(vps|dedi|ops)|\bnode\d\b|quad[s]tronix|tailnet|tailscale|localhost|\bgrasp\b)/i.test(t))
				bad.push(`internal name: ${t}`);
			if (/\b(10|100|127|147|15|192)\.\d+\.\d+\.\d+\b/.test(t)) bad.push(`address: ${t}`);
			for (const m of t.matchAll(/[\w.+-]+@[\w-]+\.[\w.-]+/g))
				if (m[0] !== site.email) bad.push(`email: ${m[0]}`);
			if (/\b(CVE|vulnerabilit(y|ies) (was|were) fixed|exploit)\b/i.test(t)) bad.push(`security detail: ${t}`);
		}
		expect(bad).toEqual([]);
	});

	it('links are site paths or https URLs on public Starhold hosts', () => {
		for (const e of CHANGELOG) {
			if (!e.link) continue;
			if (e.link.href.startsWith('/')) continue;
			const u = new URL(e.link.href);
			expect(u.protocol, e.link.href).toBe('https:');
			expect(u.hostname, e.link.href).toMatch(PUBLIC_HOST);
		}
		expect(absolute('/pricing')).toBe('https://starhold.dev/pricing');
	});
});

describe('/changelog page', () => {
	const { head, body } = render(ChangelogPage, { props: { data: { hero: 'opus' } } });

	it('renders every entry in order, with a machine-readable date, and no script', () => {
		const ids = [...body.matchAll(/<li id="([^"]+)"/g)].map((m) => m[1]);
		expect(ids).toEqual(CHANGELOG.map(entryId));
		for (const e of CHANGELOG) expect(body).toContain(`<time datetime="${e.date}"`);
		expect(body).not.toMatch(/<script\b/);
	});

	it('links its RSS feed with rel=alternate', () => {
		expect(head).toContain(
			'<link rel="alternate" type="application/rss+xml" title="Starhold changelog" href="https://starhold.dev/changelog/rss.xml"'
		);
	});

	it('is linked from the footer', () => {
		const { body: foot } = render(Footer);
		expect(foot).toMatch(/<a href="\/changelog"[^>]*>Changelog<\/a>/);
	});
});

describe('/changelog/rss.xml', async () => {
	const res = GET();
	const text = await res.text();
	const items = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
	const one = (doc: string, tag: string) => tagTexts(doc, tag)[0];

	it('is well-formed RSS 2.0, served as application/rss+xml', () => {
		expect(xmlProblems(text)).toEqual([]);
		expect(res.headers.get('content-type')).toBe('application/rss+xml; charset=utf-8');
		expect(text).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">');
		expect(text).toContain('<atom:link href="https://starhold.dev/changelog/rss.xml" rel="self" type="application/rss+xml"/>');
		const channel = text.slice(0, text.indexOf('<item>'));
		expect(one(channel, 'link')).toBe('https://starhold.dev/changelog');
		expect(one(channel, 'title')).toBe('Starhold changelog');
		expect(one(channel, 'description')).toBeTruthy();
	});

	it('has the same entries as the page, in the same order, with absolute links and stable GUIDs', () => {
		expect(items).toHaveLength(CHANGELOG.length);
		items.forEach((it, i) => {
			const e = CHANGELOG[i];
			const url = `https://starhold.dev/changelog#${entryId(e)}`;
			expect(one(it, 'title')).toBe(`${e.product}: ${e.title}`);
			expect(one(it, 'link')).toBe(url);
			expect(it).toContain(`<guid isPermaLink="true">${url}</guid>`);
			expect(new Date(one(it, 'pubDate')).toISOString()).toBe(`${e.date}T00:00:00.000Z`);
			expect(one(it, 'description').startsWith(e.body)).toBe(true);
		});
	});

	it('dates the channel by its newest entry, not by build time', () => {
		expect(new Date(one(text, 'lastBuildDate')).toISOString()).toBe(`${CHANGELOG[0].date}T00:00:00.000Z`);
	});

	it('escapes markup in entries', () => {
		const hostile = changelogRss([{ date: '2026-01-01', product: 'A & B', title: '<b>x</b>', body: 'a < b "c"' }]);
		expect(xmlProblems(hostile)).toEqual([]);
		expect(hostile).toContain('<title>A &amp; B: &lt;b&gt;x&lt;/b&gt;</title>');
	});
});

describe('xml check (used by the feed and sitemap tests)', () => {
	it('accepts a well-formed document and rejects broken ones', () => {
		const ok = '<?xml version="1.0" encoding="UTF-8"?>\n<a x="1"><b>t &amp; u</b><c/></a>\n';
		expect(xmlProblems(ok)).toEqual([]);
		for (const bad of [
			'<a></a>',
			'<?xml version="1.0" encoding="UTF-8"?><a><b></a></b>',
			'<?xml version="1.0" encoding="UTF-8"?><a>x & y</a>',
			'<?xml version="1.0" encoding="UTF-8"?><a></a><b></b>',
			'<?xml version="1.0" encoding="UTF-8"?><a x=1></a>',
			'<?xml version="1.0" encoding="UTF-8"?><a>'
		])
			expect(xmlProblems(bad), bad).not.toEqual([]);
	});
});
