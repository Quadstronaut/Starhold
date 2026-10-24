import { test, expect } from '@playwright/test';

// REPLACED. The old assertion pinned the randomised tagline hero, which is the
// thing the redesign removed: the headline is now one deterministic positioning
// line. Determinism and the above-fold contract are covered by B1.1/B1.2 in
// e2e/redesign.spec.ts; this stays as a cheap structural smoke check.
test('home renders the positioning hero and the services section', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.locator('h1')).toContainText(/host and operate/i);
	await expect(page.locator('#fleet')).toBeVisible();
});

test('products.json is served and lists only live products', async ({ request }) => {
	const res = await request.get('/products.json');
	expect(res.ok()).toBeTruthy();
	const catalog = await res.json();
	const ids = catalog.products.map((p: { id: string }) => p.id);
	expect(ids).toEqual(['shushgame', 'qnix']);
});

test('removed pages answer 301 to the home page', async ({ request }) => {
	for (const path of ['/cart', '/products/custom-bots', '/services/hosting', '/rates', '/operator', '/about']) {
		const res = await request.get(path, { maxRedirects: 0 });
		expect(res.status(), path).toBe(301);
		expect(res.headers()['location'], path).toBe('/');
	}
});
