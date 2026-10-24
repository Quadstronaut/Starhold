import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { heroFallbackSrc, heroPool, heroSrcset, pickHero, type HeroEntry } from './heroes';

const pool: HeroEntry[] = [
	{ id: 'a', kind: 'raster', width: 1600, height: 900, widths: [800, 1600] },
	{ id: 'b', kind: 'raster', width: 1376, height: 768, widths: [800, 1376] },
	{ id: 'c', kind: 'svg', width: 480, height: 480 }
];

describe('hero pool picker (STAR-166)', () => {
	it('honours ?hero=<id>, falls back to random for an unknown id, and covers the whole pool; the dev pool ships', () => {
		expect(pickHero(pool, 'c', () => 0).id).toBe('c');
		expect(pickHero(pool, 'nope', () => 0).id).toBe('a');
		expect(pickHero(pool, null, () => 0.5).id).toBe('b');
		expect(pickHero(pool, null, () => 0.9999).id).toBe('c');
		expect(() => pickHero([])).toThrow();
		const seen = new Set(Array.from({ length: 200 }, () => pickHero(pool).id));
		expect([...seen].sort()).toEqual(['a', 'b', 'c']);

		// the shipped dev pool is ChatGPT, Gemini, Opus, and every raster file it names is in static/
		expect(heroPool.map((e) => e.id)).toEqual(['chatgpt', 'gemini', 'opus']);
		for (const e of heroPool.filter((x) => x.kind === 'raster')) {
			const files = ['avif', 'webp'].flatMap((f) => heroSrcset(e, f as 'avif' | 'webp').split(', ').map((s) => s.split(' ')[0]));
			for (const url of [...files, heroFallbackSrc(e)]) expect(existsSync(join('static', url)), url).toBe(true);
		}
	});
});
