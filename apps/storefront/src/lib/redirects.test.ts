import { describe, it, expect } from 'vitest';
import { REMOVED_PATHS, redirectFor } from './redirects';

describe('removed-path redirects', () => {
	it('sends every removed path to the home page', () => {
		for (const p of REMOVED_PATHS) expect(redirectFor(p)).toBe('/');
	});
	it('tolerates a trailing slash', () => {
		expect(redirectFor('/rates/')).toBe('/');
	});
	it('covers the pages retired by STAR-145', () => {
		for (const p of ['/cart', '/products/custom-bots', '/services/hosting', '/services/managed-ops',
			'/services/automation', '/services/fullstack', '/capabilities', '/work', '/rates', '/operator', '/legal/services'])
			expect(REMOVED_PATHS).toContain(p);
	});
	it('moves the old QNix URLs to /qnix', () => {
		expect(redirectFor('/services/qnix')).toBe('/qnix');
		expect(redirectFor('/services/qnix/')).toBe('/qnix');
		expect(redirectFor('/products/qnix')).toBe('/qnix');
	});
	it('leaves live pages alone', () => {
		for (const p of ['/', '/contact', '/legal/terms', '/legal/privacy', '/legal/refunds', '/products/shushgame', '/api/intake'])
			expect(redirectFor(p)).toBeNull();
	});
});
