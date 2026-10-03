import { test, expect } from '@playwright/test';

// Task G: motion layer, pill buttons, inner-page components.

const INNER = [
	'/capabilities', '/services/automation', '/services/fullstack', '/products/custom-bots',
	'/products/shushgame', '/products/qnix', '/work', '/operator', '/contact'
];

test('inner pages: .reveal content is visible under reduced motion; phone has no overflow; no console errors', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 375, height: 812 });
	const errors: string[] = [];
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	page.on('pageerror', (e) => errors.push(String(e)));
	for (const path of INNER) {
		await page.goto(path);
		for (const el of await page.locator('.reveal').all()) {
			expect(await el.evaluate((n) => getComputedStyle(n).opacity), path).toBe('1');
		}
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
		expect(overflow, `${path} overflows at 375`).toBe(false);
	}
	expect(errors).toEqual([]);
});

test('buttons are pills', async ({ page }) => {
	await page.goto('/capabilities');
	const r = await page.locator('.btn-primary').first().evaluate((n) => getComputedStyle(n).borderTopLeftRadius);
	expect(parseFloat(r)).toBeGreaterThan(100);
});
