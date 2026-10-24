// STAR-166 hero pool (operator decision 2026-10-24): the storefront hero shows one
// entry of brand/heroes/dev at random. The pool comes from hero-pool.json, a copy of
// brand/heroes/dev/manifest.json written by `node brand/check-drift.mjs --write`
// (the web variants it names are copied to static/heroes/dev/). Same selection rule
// as the fleet's /heroes/hero-pool.js: ?hero=<id> forces an entry, otherwise random.
import manifest from './hero-pool.json';

export type HeroEntry = {
	id: string;
	kind: 'raster' | 'svg';
	width: number;
	height: number;
	/** Built widths of a raster entry, smallest first (absent for SVG). */
	widths?: number[];
};

export const HERO_BASE = '/heroes/dev/';
export const HERO_SIZES = '(min-width: 900px) 50vw, 100vw';

export const heroPool: HeroEntry[] = manifest.entries.map((e) => ({
	id: e.id,
	kind: e.kind as HeroEntry['kind'],
	width: e.width,
	height: e.height,
	...('widths' in e && e.widths ? { widths: e.widths } : {})
}));

/** The forced entry when `forced` names one in the pool, else a random one. `rnd` is in [0, 1). */
export function pickHero(pool: HeroEntry[], forced: string | null = null, rnd: () => number = Math.random): HeroEntry {
	if (!pool.length) throw new Error('empty hero pool');
	return pool.find((e) => e.id === forced) ?? pool[Math.min(pool.length - 1, Math.floor(rnd() * pool.length))];
}

/** `srcset` for one format of a raster entry. */
export function heroSrcset(e: HeroEntry, fmt: 'avif' | 'webp'): string {
	return (e.widths ?? []).map((w) => `${HERO_BASE}${e.id}-${w}.${fmt} ${w}w`).join(', ');
}

/** The plain <img> fallback src: the largest WebP. */
export function heroFallbackSrc(e: HeroEntry): string {
	return `${HERO_BASE}${e.id}-${(e.widths ?? []).at(-1)}.webp`;
}
