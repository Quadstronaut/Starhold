// PERI-10: the Peridot policy pages are Markdown copied word for word from the Peridot repo
// (Quadstronaut/Period, docs/play/site). This renders the small subset those files use to HTML at
// request time, so the page text cannot be retyped or "improved" on the way in:
//   # / ## headings, paragraphs, "- " bullet lists, "1. " numbered lists, **bold**.
// No dependency, no client JavaScript. Anything outside the subset throws, so a source change that
// adds (say) a table fails the test instead of rendering as raw text.

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline: escape first, then turn **bold** into <strong>. */
export function inline(text: string): string {
	if (/[*_`[\]]/.test(text.replace(/\*\*/g, ''))) {
		throw new Error(`Unsupported Markdown inline syntax in: ${text.slice(0, 60)}`);
	}
	return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

export function markdownToHtml(md: string): string {
	const lines = md.replace(/\r\n?/g, '\n').split('\n');
	const out: string[] = [];
	let para: string[] = [];
	let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;

	const flushPara = () => {
		if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
		para = [];
	};
	const flushList = () => {
		if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
		list = null;
	};

	for (const line of lines) {
		const heading = /^(#{1,2}) (.+)$/.exec(line);
		const bullet = /^- (.+)$/.exec(line);
		const numbered = /^\d+\. (.+)$/.exec(line);
		if (!line.trim()) {
			flushPara();
			flushList();
		} else if (heading) {
			flushPara();
			flushList();
			out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
		} else if (bullet || numbered) {
			flushPara();
			const tag = bullet ? 'ul' : 'ol';
			if (list && list.tag !== tag) flushList();
			list ??= { tag, items: [] };
			list.items.push((bullet ?? numbered)![1]);
		} else if (/^\s*[#>|]|^\s+- /.test(line)) {
			throw new Error(`Unsupported Markdown line: ${line.slice(0, 60)}`);
		} else {
			flushList();
			para.push(line.trim());
		}
	}
	flushPara();
	flushList();
	return out.join('\n');
}
