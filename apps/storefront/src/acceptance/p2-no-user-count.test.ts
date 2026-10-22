// P2.1: no invented user-count claim anywhere the storefront ships.
// The removed user-count line was a fabricated count (see A2.3 for the voice rule).
import { describe, it, expect } from 'vitest';
import { srcFiles, read, relative } from './_helpers';

const USER_COUNT = /18[,\s]?000|\b18k\b/i;

describe('P2 no user-count claim', () => {
	it('P2.1 no user-count claim in storefront source or static', () => {
		const files = [...srcFiles(['.svelte', '.ts', '.js']), 'static/products.json'];
		const hits = files
			.map((f) => (f.startsWith('/') || f.includes(':') ? relative(f) : f))
			.filter((rel) => USER_COUNT.test(read(rel)));
		expect(hits).toEqual([]);
	});
});
