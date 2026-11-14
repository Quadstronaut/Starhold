// STAR-142: render a legal document to plain text, for the release gate.
//
// Starhold Account fetches /legal/<name>.txt hourly, normalises it (line endings,
// trailing whitespace, outer blank lines) and compares a sha256 with the approved
// text. So the output here is deterministic: no timestamps, no per-request data,
// LF line endings, one trailing newline. It is made from the same component the
// HTML page shows (see ./index.ts), so the two cannot disagree.
import { render } from 'svelte/server';
import type { Component } from 'svelte';
import { documents, type LegalKey } from './index';

const SITE = 'https://starhold.dev';

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s: string) =>
	s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
		if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
		return ENTITIES[e.toLowerCase()] ?? m;
	});
const squash = (s: string) => s.replace(/\s+/g, ' ').trim();

type Block = { kind: 'p' | 'li' | 'tr'; text: string };

/** HTML (the small subset the legal pages use) to plain text. Exported for tests. */
export function htmlToText(html: string): string {
	const blocks: Block[] = [];
	let buf = '';
	let cells: string[] = [];
	let olCounter: number | null = null;
	const links: { href: string; at: number }[] = [];

	const flush = (kind: Block['kind'], prefix = '') => {
		const text = squash(buf);
		buf = '';
		if (text) blocks.push({ kind, text: prefix + text });
	};

	const body = html.replace(/<!--[\s\S]*?-->/g, '');
	for (const part of body.split(/(<[^>]+>)/)) {
		const tag = /^<(\/?)([a-z0-9]+)([^>]*)>$/i.exec(part);
		if (!tag) {
			buf += decode(part);
			continue;
		}
		const closing = tag[1] === '/';
		const name = tag[2].toLowerCase();
		if (name === 'a') {
			if (!closing) {
				links.push({ href: /href="([^"]*)"/.exec(tag[3])?.[1] ?? '', at: buf.length });
			} else {
				const l = links.pop();
				if (l) {
					const label = squash(buf.slice(l.at));
					const href = decode(l.href);
					if (href && !href.startsWith('mailto:')) buf += ` (${href.startsWith('/') ? SITE + href : href})`;
					else if (href.startsWith('mailto:') && href.slice(7) !== label) buf += ` (${href.slice(7)})`;
				}
			}
		} else if (name === 'ol') {
			olCounter = closing ? null : 0;
		} else if (name === 'ul') {
			olCounter = null;
		} else if (name === 'li') {
			if (closing) flush('li', olCounter === null ? '- ' : `${++olCounter}) `);
			else buf = '';
		} else if (name === 'td' || name === 'th') {
			if (closing) {
				cells.push(squash(buf));
				buf = '';
			} else buf = '';
		} else if (name === 'tr') {
			if (closing) {
				blocks.push({ kind: 'tr', text: cells.join(' | ') });
				cells = [];
			}
		} else if (['h1', 'h2', 'h3', 'p', 'div', 'section', 'table'].includes(name)) {
			if (closing || name === 'section') flush('p');
			else buf = '';
		}
		// strong, em, thead, tbody and any other inline or wrapper tag: contents pass through.
	}
	flush('p');

	let out = '';
	blocks.forEach((b, i) => {
		const prev = blocks[i - 1];
		out += i === 0 ? '' : prev.kind === b.kind && b.kind !== 'p' ? '\n' : '\n\n';
		out += b.text;
	});
	return out + '\n';
}

/** The plain text of one document in the active launch state. */
export function legalText(key: LegalKey): string {
	return htmlToText(render(documents[key] as Component).body);
}