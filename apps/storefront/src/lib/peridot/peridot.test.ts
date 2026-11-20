// PERI-10: drift guard for the Peridot policy pages (Google Play privacy + deletion URLs).
// privacy.md, delete.md and terms.md are word-for-word copies of Quadstronaut/Period docs/play/site/*.md.
// The test parses each Markdown file on its own, renders the real route component, and fails if any
// heading, paragraph or list item is missing, altered, extra, or out of order in the served HTML.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { exists, read } from '../../acceptance/_helpers';
import PrivacyPage from '../../routes/peridot/privacy/+page.svelte';
import DeletePage from '../../routes/peridot/delete/+page.svelte';
import TermsPage from '../../routes/peridot/terms/+page.svelte';
import { markdownToHtml } from './markdown';

const mdPath = (n: string) => new URL(`./${n}.md`, import.meta.url);
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();
const decode = (s: string) => s.replace(/&([a-z]+);/gi, (m, e: string) => ENTITIES[e.toLowerCase()] ?? m);

type Block = { kind: 'h1' | 'h2' | 'p' | 'li'; text: string };

/** Independent reader of the Markdown source: one block per heading, paragraph, list item. */
function sourceBlocks(md: string): Block[] {
	const blocks: Block[] = [];
	let para: string[] = [];
	const flush = () => {
		if (para.length) blocks.push({ kind: 'p', text: squash(para.join(' ')) });
		para = [];
	};
	for (const line of md.replace(/\r\n?/g, '\n').split('\n')) {
		const h = /^(#{1,2}) (.+)$/.exec(line);
		const li = /^(?:- |\d+\. )(.+)$/.exec(line);
		if (!line.trim()) flush();
		else if (h) (flush(), blocks.push({ kind: h[1].length === 1 ? 'h1' : 'h2', text: squash(h[2]) }));
		else if (li) (flush(), blocks.push({ kind: 'li', text: squash(li[1]) }));
		else para.push(line);
	}
	flush();
	return blocks.map((b) => ({ ...b, text: b.text.replace(/\*\*/g, '') }));
}

/** What a reader sees in the served HTML, block by block, in document order. */
function pageBlocks(html: string): Block[] {
	const out: Block[] = [];
	for (const m of html.matchAll(/<(h1|h2|p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
		out.push({ kind: m[1] as Block['kind'], text: squash(decode(m[2].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ''))) });
	}
	return out;
}

const PAGES = [
	{ slug: 'privacy', Page: PrivacyPage, title: 'Peridot privacy policy', other: 'delete', otherTitle: 'Delete your Peridot data' },
	{ slug: 'delete', Page: DeletePage, title: 'Delete your Peridot data', other: 'privacy', otherTitle: 'Peridot privacy policy' },
	{ slug: 'terms', Page: TermsPage, title: 'Peridot terms of use', other: 'privacy', otherTitle: 'Peridot privacy policy' }
];

describe.each(PAGES)('PERI-10 /peridot/$slug', ({ slug, Page, title, other, otherTitle }) => {
	const md = readFileSync(mdPath(slug), 'utf8');
	const { body, head } = render(Page);

	it('the rendered page has exactly the source headings, paragraphs and list items, in order', () => {
		const want = sourceBlocks(md);
		expect(want.length).toBeGreaterThan(5);
		expect(pageBlocks(body)).toEqual(want);
	});

	it('is titled as agreed and links to its sibling page', () => {
		expect(head).toContain(`<title>${title}</title>`);
		expect(body).toContain(`<a href="/peridot/${other}">${otherTitle}</a>`);
	});

	it('is static: no script, form, input, iframe, image or external URL in the markup', () => {
		expect(body).not.toMatch(/<(script|form|input|button|iframe|img|link|style)\b/i);
		expect(body).not.toMatch(/(?:href|src|action)="https?:/i);
		expect(head).not.toMatch(/<(script|link)\b/i);
	});

	it('has a route file and is not in the site navigation or product list', () => {
		expect(exists(`src/routes/peridot/${slug}/+page.svelte`)).toBe(true);
		for (const f of ['src/lib/nav.ts', 'static/products.json', 'src/lib/products.ts']) expect(read(f).toLowerCase(), f).not.toContain('peridot');
	});
});

describe('PERI-10 markdown subset', () => {
	it('keeps bold as <strong> and escapes angle brackets', () => {
		expect(markdownToHtml('**Circles (optional).** Settings > Data')).toBe('<p><strong>Circles (optional).</strong> Settings &gt; Data</p>');
	});
	it('refuses syntax it cannot render rather than printing it raw', () => {
		expect(() => markdownToHtml('| a | b |')).toThrow();
		expect(() => markdownToHtml('see [link](x)')).toThrow();
	});
});
