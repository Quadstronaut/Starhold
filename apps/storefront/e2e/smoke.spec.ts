import { test, expect } from '@playwright/test';

// REPLACED. The old assertion pinned the randomised tagline hero, which is the
// thing the redesign removed: the headline is now one deterministic positioning
// line. Determinism and the above-fold contract are covered by B1.1/B1.2 in
// e2e/redesign.spec.ts; this stays as a cheap structural smoke check.
test('home renders the positioning hero and the selected-work section', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.locator('h1')).toContainText(/automation/i);
	await expect(page.locator('#fleet')).toBeVisible();
});

test('products.json is served and custom-bots is $5/mo', async ({ request }) => {
	const res = await request.get('/products.json');
	expect(res.ok()).toBeTruthy();
	const catalog = await res.json();
	const bots = catalog.products.find((p: { id: string }) => p.id === 'custom-bots');
	expect(bots, 'custom-bots missing from catalog').toBeDefined();
	expect(bots.pricing.monthly_usd).toBe(5);
});

test('configurator → cart shows the bot and the monthly total', async ({ page }) => {
	await page.goto('/products/custom-bots');
	// Feature labels: <label class="feature"><input type="checkbox"><span><strong>Moderation</strong>...</span></label>
	// Playwright resolves the label's accessible text (flattened inner text), so /moderation/i matches.
	await page.locator('label.feature', { hasText: /moderation/i }).locator('input[type="checkbox"]').check();
	await page.getByLabel(/server name/i).fill('Smoke Test Server');
	await page.getByRole('button', { name: /add to cart/i }).click();
	await page.goto('/cart');
	// Cart renders: <strong>Bot 1 — Smoke Test Server</strong>
	await expect(page.getByText(/Smoke Test Server/)).toBeVisible();
	// Cart total: <strong>$5/month</strong>
	await expect(page.getByText('$5/month')).toBeVisible();
});

// Needs real Stripe TEST credentials in the environment — skipped otherwise.
// Run locally with: $env:STRIPE_SECRET_KEY="sk_test_..."; $env:STRIPE_PRICE_CUSTOM_BOT="price_..."; npm run test:e2e
test('checkout hands off to Stripe', async ({ page }) => {
	test.skip(
		!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_CUSTOM_BOT,
		'set STRIPE_SECRET_KEY + STRIPE_PRICE_CUSTOM_BOT (test mode) to run'
	);
	await page.goto('/products/custom-bots');
	await page.locator('label.feature', { hasText: /moderation/i }).locator('input[type="checkbox"]').check();
	await page.getByRole('button', { name: /add to cart/i }).click();
	await page.goto('/cart');
	// button-name change only: "Launch checkout" -> "Continue to payment"
	await page.getByRole('button', { name: /checkout|continue to payment/i }).click();
	await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
});
