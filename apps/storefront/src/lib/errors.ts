// STAR-168: the storefront renders the shared Starhold error set (brand/errors) itself.
// Copy, manifests and images are byte copies written by `node brand/check-drift.mjs --write`:
//   src/lib/error-copy.json              <- brand/errors/copy.json
//   static/errors/<code>/manifest.json   <- brand/errors/pools/<code>/manifest.json
//   static/errors/<code>/<id>-<w>.avif|webp, opus.svg  <- pools/<code>/web/
// The first manifest entry is the no-JS / server-render fallback; the browser re-rolls on mount
// (same rule as brand/errors/err-pool.js: ?img=<id> forces one entry, otherwise random).
import copyJson from './error-copy.json';

export type ErrEntry = {
	id: string;
	kind: 'raster' | 'svg';
	width: number;
	height: number;
	widths?: number[];
	fade?: boolean;
};

const manifests = import.meta.glob<{ entries: ErrEntry[] }>('/static/errors/*/manifest.json', {
	eager: true,
	import: 'default'
});
const svgs = import.meta.glob<string>('/static/errors/*/*.svg', { eager: true, query: '?raw', import: 'default' });

export const ERR_BASE = '/errors/';
export const ERR_SIZES = '(min-width: 1100px) 960px, 100vw';

export type ErrCopy = { code: string; title: string; explanation: string };

export const errLinks = copyJson.links;
export const errContact = copyJson.contact;

/** Title and explanation for a status; any code without its own entry gets `default`. */
export function copyFor(status: number): ErrCopy {
	const codes = copyJson.codes as Record<string, { title: string; explanation: string }>;
	const c = codes[String(status)] ?? codes.default;
	return { code: String(status), title: c.title, explanation: c.explanation };
}

/** The pool for a status (manifest order); empty when the code has none (the default copy has no image). */
export function poolFor(status: number): ErrEntry[] {
	const m = manifests[`/static/errors/${status}/manifest.json`];
	if (!m) return [];
	return m.entries
		.filter((e) => (e.kind === 'svg' ? svgs[`/static/errors/${status}/${e.id}.svg`] != null : !!e.widths?.length))
		.map(({ id, kind, width, height, widths, fade }) => ({ id, kind, width, height, ...(widths ? { widths } : {}), ...(fade != null ? { fade } : {}) }));
}

/** The forced entry when `forced` names one in the pool, else a random one. `rnd` is in [0, 1). Null for an empty pool. */
export function pickErr(pool: ErrEntry[], forced: string | null = null, rnd: () => number = Math.random): ErrEntry | null {
	if (!pool.length) return null;
	return pool.find((e) => e.id === forced) ?? pool[Math.min(pool.length - 1, Math.floor(rnd() * pool.length))];
}

export const errSrcset = (status: number, e: ErrEntry, fmt: 'avif' | 'webp'): string =>
	(e.widths ?? []).map((w) => `${ERR_BASE}${status}/${e.id}-${w}.${fmt} ${w}w`).join(', ');

export const errFallbackSrc = (status: number, e: ErrEntry): string => `${ERR_BASE}${status}/${e.id}-${e.widths!.at(-1)}.webp`;

/** Inline markup of an SVG entry (keeps its currentColor roles), comments stripped. */
export function errSvg(status: number, e: ErrEntry): string {
	return (svgs[`/static/errors/${status}/${e.id}.svg`] ?? '').replace(/<!--[\s\S]*?-->\s*/g, '').trim();
}
