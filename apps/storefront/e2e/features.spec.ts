import { test, expect } from '@playwright/test';

// Task D: capability tiles + terminal-card feature sections on the home page.

test('capability tiles: four whole-card links, no horizontal overflow on a phone', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 812 });
	await page.goto('/');
	const tiles = page.locator('#capabilities a.tile');
	await expect(tiles).toHaveCount(4);
	for (const href of ['/services/automation', '/products/qnix', '/products/custom-bots', '/services/fullstack']) {
		await expect(page.locator(`#capabilities a.tile[href="${href}"]`)).toBeVisible();
	}
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth
	);
	expect(overflow).toBe(0);
});

test('feature sections: three terminal cards, each carrying evidence, visible without JS', async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto('/');
	const cards = page.locator('figure.term[data-evidence]');
	await expect(cards).toHaveCount(3);
	for (let i = 0; i < 3; i++) await expect(cards.nth(i)).toBeVisible();
	await ctx.close();
});

// Task E: featured case (device mockup) + how-it-works steps.

test('featured case: real screenshots with dimensions, evidence, links; no JS needed', async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto('/');
	const sec = page.locator('#featured[data-evidence="shushgame-live"]');
	await expect(sec).toBeVisible();
	for (const img of await sec.locator('img').all()) {
		await expect(img).toHaveAttribute('width', /\d+/);
		await expect(img).toHaveAttribute('height', /\d+/);
		await expect(img).toHaveAttribute('alt', /.{20,}/);
	}
	await expect(sec.locator('a[href="https://shushgame.com"]')).toBeVisible();
	await expect(page.locator('#fleet')).toBeVisible(); // anchor kept
	await ctx.close();
});

test('how it works: three static steps', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#how ol.steps > li')).toHaveCount(3);
});

// Task F: FAQ accordion, JSON-LD, closing band.

test('faq: native details work without JS and JSON-LD mirrors them', async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto('/');
	const items = page.locator('#faq details');
	const n = await items.count();
	expect(n).toBeGreaterThanOrEqual(5);
	expect(n).toBeLessThanOrEqual(7);
	await items.first().locator('summary').click(); // browser toggles it, no script
	await expect(items.first()).toHaveAttribute('open', '');
	const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
	expect(ld['@type']).toBe('FAQPage');
	expect(ld.mainEntity).toHaveLength(n);
	await ctx.close();
});

test('closing band: checklist rows with check icons, CTA and email', async ({ page }) => {
	await page.goto('/');
	const band = page.locator('#start');
	await expect(band.locator('ul.checks li svg')).toHaveCount(3);
	await expect(band.locator('a.btn-primary')).toBeVisible();
	await expect(band.locator('a[href^="mailto:"]')).toBeVisible();
});
