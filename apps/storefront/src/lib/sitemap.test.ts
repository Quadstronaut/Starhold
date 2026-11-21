// STAR-310 item 2: /sitemap.xml and robots.txt.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GET } from '../routes/sitemap.xml/+server';
import { PAGE_ROUTES, EXCLUDED, sitemapPaths, sitemapUrls } from './sitemap';
import { redirectFor } from './redirects';
import { CHANGELOG } from './content/changelog';
import { AUDIENCES } from './content/catalog';
import { xmlProblems, tagTexts } from './content/xml-check';

type Load = (e: { url: URL; params: Record<string, string> }) => unknown;
const loaders = import.meta.glob<{ load?: Load }>('/src/routes/**/+page{,.server}.ts', { eager: true });

/** The route id that serves a path, and its params. */
function routeFor(path: string): { id: string; params: Record<string, string> } {
	if (PAGE_ROUTES.includes(path)) return { id: path, params: {} };
	const m = path.match(/^\/for\/([^/]+)$/);
	if (m) return { id: '/for/[audience]', params: { audience: m[1] } };
	throw new Error(`no route serves ${path}`);
}

/** Runs the page's load functions the way SvelteKit would for a GET. Throws on a redirect or error. */
async function renderable(path: string): Promise<void> {
	if (redirectFor(path)) throw new Error(`${path} is redirected by hooks.server.ts`);
	const { id, params } = routeFor(path);
	const dir = `/src/routes${id === '/' ? '' : id}`;
	for (const file of [`${dir}/+page.server.ts`, `${dir}/+page.ts`]) {
		const load = loaders[file]?.load;
		if (load) await load({ url: new URL(`https://starhold.dev${path}`), params });
	}
}

describe('/sitemap.xml', async () => {
	const res = GET();
	const text = await res.text();
	const locs = tagTexts(text, 'loc');

	it('is well-formed XML in the sitemap namespace, served as XML', () => {
		expect(xmlProblems(text)).toEqual([]);
		expect(text).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(res.headers.get('content-type')).toBe('application/xml; charset=utf-8');
	});

	it('lists absolute https URLs on starhold.dev only, with no duplicates', () => {
		expect(locs.length).toBeGreaterThan(0);
		expect(new Set(locs).size).toBe(locs.length);
		for (const l of locs) expect(l).toMatch(/^https:\/\/starhold\.dev\/[^\s#?]*$/);
	});

	it('includes the pages it must', () => {
		for (const p of [
			'/', '/pricing', '/products', '/contact', '/changelog',
			'/legal/terms', '/legal/privacy', '/legal/refunds',
			'/peridot', '/peridot/privacy', '/peridot/delete', '/peridot/terms',
			'/dysonsphere', '/shush',
			...AUDIENCES.map((a) => `/for/${a.id}`)
		])
			expect(locs, p).toContain(p === '/' ? 'https://starhold.dev/' : `https://starhold.dev${p}`);
	});

	it('leaves out redirects, endpoints, feeds and plain-text twins', () => {
		const paths = locs.map((l) => new URL(l).pathname);
		for (const p of paths) {
			expect(p.startsWith('/api/'), p).toBe(false);
			expect(p, p).not.toMatch(/\.(txt|xml|json)$/);
			expect(redirectFor(p), p).toBeNull();
		}
		for (const p of Object.keys(EXCLUDED)) expect(paths).not.toContain(p);
	});

	it('every listed URL renders: its load functions run without a redirect or an error', async () => {
		for (const p of sitemapPaths()) await expect(renderable(p), p).resolves.toBeUndefined();
	});

	it('the render check bites: a redirecting page, an unknown audience and a removed path fail it', async () => {
		expect(loaders['/src/routes/invite/+page.ts']?.load).toBeTypeOf('function');
		await expect(renderable('/invite')).rejects.toBeTruthy(); // 307 while LAUNCHED
		await expect(renderable('/for/no-such-audience')).rejects.toBeTruthy(); // 404
		await expect(renderable('/about')).rejects.toThrow(/redirected/); // STAR-145 301
	});

	it('every page route is listed, expanded or excluded with a reason', () => {
		const paths = sitemapPaths();
		for (const r of PAGE_ROUTES) {
			if (r in EXCLUDED) continue;
			if (r.includes('[')) expect(paths.some((p) => p.startsWith(r.slice(0, r.indexOf('['))))).toBe(true);
			else expect(paths).toContain(r);
		}
	});

	it('gives lastmod only where a true content date is known (the changelog)', () => {
		const dated = sitemapUrls().filter((u) => u.lastmod);
		expect(dated).toEqual([{ loc: 'https://starhold.dev/changelog', lastmod: CHANGELOG[0].date }]);
		expect(tagTexts(text, 'lastmod')).toEqual([CHANGELOG[0].date]);
	});
});

describe('robots.txt', () => {
	const robots = readFileSync(join(__dirname, '../../static/robots.txt'), 'utf8');
	it('keeps allowing everything and points at the sitemap on starhold.dev', () => {
		expect(robots).toMatch(/^User-agent: \*$/m);
		expect(robots).toMatch(/^Disallow:\s*$/m);
		expect(robots.match(/^Sitemap: .*$/gm)).toEqual(['Sitemap: https://starhold.dev/sitemap.xml']);
		expect(robots).not.toMatch(/stage|preview/i);
	});
});
