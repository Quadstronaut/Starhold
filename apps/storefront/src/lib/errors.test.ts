import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { copyFor, errFallbackSrc, errSrcset, errSvg, pickErr, poolFor } from './errors';

describe('shared error set (STAR-168)', () => {
	it('has the shared copy for 404 and 500, and the default for unknown codes', () => {
		expect(copyFor(404)).toMatchObject({ code: '404', title: 'LOST IN SPACE' });
		expect(copyFor(500).title.length).toBeGreaterThan(3);
		expect(copyFor(500).explanation.length).toBeGreaterThan(20);
		expect(copyFor(418)).toMatchObject({ code: '418', title: 'UNEXPECTED SIGNAL' });
	});

	it('status is kept: the code shown is the status received', () => {
		for (const s of [400, 403, 404, 429, 500, 503]) expect(copyFor(s).code).toBe(String(s));
	});

	it('draws the image from the pool of that status; first entry is the no-JS fallback', () => {
		const m = (c: number) => JSON.parse(readFileSync(join('static/errors', String(c), 'manifest.json'), 'utf8'));
		for (const s of [404, 500, 429]) {
			const pool = poolFor(s);
			expect(pool.map((e) => e.id)).toEqual(m(s).entries.map((e: { id: string }) => e.id));
			const seen = new Set(Array.from({ length: 300 }, () => pickErr(pool)!.id));
			expect([...seen].sort()).toEqual(pool.map((e) => e.id).sort());
			for (const e of pool) {
				if (e.kind === 'svg') expect(errSvg(s, e)).toContain('<svg');
				else for (const u of [errFallbackSrc(s, e), ...errSrcset(s, e, 'avif').split(', ').map((x) => x.split(' ')[0])]) expect(existsSync(join('static', u)), u).toBe(true);
			}
		}
		expect(poolFor(404)[0].id).toBe('opus');
		expect(poolFor(429).some((e) => e.id === 'opus')).toBe(false);
		expect(pickErr(poolFor(404), 'grok')!.id).toBe('grok');
		expect(pickErr(poolFor(404), 'nope', () => 0)!.id).toBe('opus');
		expect(poolFor(418)).toEqual([]);
		expect(pickErr([])).toBeNull();
	});
});
