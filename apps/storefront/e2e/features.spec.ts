import { test, expect } from '@playwright/test';

// Home structure after the STAR-145 redesign (brief section 3).

test('home sections follow the brief order and carry the anchors', async ({ page }) => {
	await page.goto('/');
	const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
	expect(ids).toEqual(['services', 'access', 'principles', 'fleet', 'operator', 'faq', 'start']);
});

test('services: four groups in Hangar order, a label chip on every card', async ({ page }) => {
	await page.goto('/');
	const groups = await page.locator('#services .group h3').allInnerTexts();
	expect(groups).toEqual(['For teams and MSPs', 'For builders and sysadmins', 'Discord apps', 'Personal hosting']);
	const cards = page.locator('#services article.service');
	await expect(cards).toHaveCount(7);
	const tags = await cards.locator('.tag').allTextContents();
	for (const t of tags)
		expect(['Open · free', 'Open · early access, paid plans', 'Invitation only', 'In development', 'Retired']).toContain(t);
	// QNix sits under Personal hosting as In development, linking to its interest form
	const qnix = cards.filter({ hasText: 'QNix' });
	await expect(qnix.locator('.tag')).toHaveText('In development');
	await expect(qnix.locator('a')).toHaveAttribute('href', '/qnix');
});

test('access: three static steps', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#access ol.steps > li')).toHaveCount(3);
});

test('faq: six native details work without JS and JSON-LD mirrors them', async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto('/');
	const items = page.locator('#faq details');
	await expect(items).toHaveCount(6);
	await items.first().locator('summary').click(); // browser toggles it, no script
	await expect(items.first()).toHaveAttribute('open', '');
	const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
	expect(ld['@type']).toBe('FAQPage');
	expect(ld.mainEntity).toHaveLength(6);
	await ctx.close();
});

test('closing band: heading, Request an invite and Read the docs, nothing else', async ({ page }) => {
	await page.goto('/');
	const band = page.locator('#start');
	await expect(band.getByRole('link')).toHaveText(['Request an invite', 'Read the docs']);
});

test('header and footer follow the brief; no Sign in anywhere', async ({ page }) => {
	await page.goto('/');
	const header = page.locator('header nav');
	await expect(header.locator('ul.primary > li:not(.drawer-only) a')).toHaveText(['Services', 'Principles', 'Questions', 'Hangar', 'Docs']);
	await expect(page.locator('header .header-cta')).toHaveText('Request an invite');
	await expect(page.getByRole('link', { name: /sign in/i })).toHaveCount(0);
	const footer = page.locator('footer');
	await expect(footer.getByRole('link', { name: 'Back the work' })).toBeVisible();
	await expect(footer.getByRole('link', { name: /discord/i })).toHaveCount(0);
	await expect(footer).toContainText('Starhold · Sovereign systems, built and operated. · Est. 2026');
});

test('404 shows the shared Starhold error page', async ({ page }) => {
	const res = await page.goto('/no-such-page');
	expect(res?.status()).toBe(404);
	await expect(page.locator('h1')).toHaveText('404 · LOST IN SPACE');
	await expect(page.locator('main').getByRole('link')).toHaveText(['← Go back', 'Home →']);
	await expect(page.locator('figure.err-figure')).toBeVisible();
});

test('/shush says what the game really does and does not cross-promote', async ({ page }) => {
	await page.goto('/shush');
	await expect(page.locator('h1')).toHaveText('Shush');
	await expect(page.getByText('nothing to buy')).toBeVisible();
	await expect(page.locator('main a[href*="starhold"]')).toHaveCount(0);
});

test('/account is a stub with the In development chip and no form', async ({ page }) => {
	await page.goto('/account');
	await expect(page.getByText('Starhold Account is in development.')).toBeVisible();
	await expect(page.locator('main .tag')).toHaveText('In development');
	await expect(page.locator('main form')).toHaveCount(0);
});
