// STAR-310: a small XML well-formedness check for the feed and sitemap tests, so no parser dependency is
// added to the app. It covers what those two documents use: one XML declaration, elements with attributes,
// self-closing tags, text with the five predefined entities and numeric references. No DTDs, CDATA or
// comments are allowed (the generators never emit them). Returns a list of problems; empty means well-formed.
const NAME = /^[A-Za-z_][\w.:-]*$/;
const ATTRS = /^(\s+[A-Za-z_][\w.:-]*\s*=\s*("[^"<&]*(?:&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);[^"<&]*)*"))*\s*$/;
const TEXT_OK = /^[^<&]*(?:&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);[^<&]*)*$/;

export function xmlProblems(doc: string): string[] {
	const problems: string[] = [];
	let s = doc;
	const decl = s.match(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n?/);
	if (!decl) problems.push('missing or wrong XML declaration');
	else s = s.slice(decl[0].length);
	const stack: string[] = [];
	let roots = 0;
	const re = /<(\/?)([^\s/>]+)([^>]*?)(\/?)>/g;
	let last = 0;
	for (const m of s.matchAll(re)) {
		const text = s.slice(last, m.index);
		if (!TEXT_OK.test(text)) problems.push(`bad text before <${m[1]}${m[2]}>: ${text.slice(0, 40)}`);
		if (stack.length === 0 && text.trim()) problems.push('text outside the root element');
		last = m.index! + m[0].length;
		const [, close, name, attrs, self] = m;
		if (!NAME.test(name)) problems.push(`bad element name: ${name}`);
		if (close) {
			if (attrs.trim() || self) problems.push(`bad end tag: ${m[0]}`);
			const open = stack.pop();
			if (open !== name) problems.push(`</${name}> closes <${open ?? 'nothing'}>`);
		} else {
			if (!ATTRS.test(attrs)) problems.push(`bad attributes on <${name}>: ${attrs}`);
			if (stack.length === 0) roots++;
			if (!self) stack.push(name);
		}
	}
	if (s.slice(last).trim()) problems.push('text after the root element');
	if (stack.length) problems.push(`unclosed: ${stack.join(' > ')}`);
	if (roots !== 1) problems.push(`expected one root element, found ${roots}`);
	return problems;
}

/** Text of every <tag>…</tag> (no nesting) in document order, entities decoded. */
export function tagTexts(doc: string, tag: string): string[] {
	return [...doc.matchAll(new RegExp(`<${tag}(?:\\s[^>]*)?>([^<]*)</${tag}>`, 'g'))].map((m) => decode(m[1]));
}

export const decode = (s: string) =>
	s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
		.replace(/&amp;/g, '&');
