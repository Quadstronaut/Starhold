import { test, expect } from '@playwright/test';

// Tier A · A5 — presence acceptance. Proves the redesign degrades safely
// (no JS, reduced motion), stays clean (no errors, no failed requests), stays
// light (weight budget) and that structured data matches what is on screen.

const ROUTES = [
	'/', '/capabilities', '/work', '/operator', '/contact',
	'/services/automation', '/services/fullstack',
	'/products/custom-bots', '/products/shushgame', '/products/qnix'
];

// ── 1. No JavaScript ────────────────────────────────────────────────────────
test.describe('with JavaScript disabled', () => {
	test.use({ javaScriptEnabled: false });
	for (const route of ROUTES) {
		test(`${route}: h1 and every section heading/card is visible`, async ({ page }) => {
			await page.goto(route);
			await expect(page.locator('h1').first()).toBeVisible();
			// The scroll reveal is CSS-driven (no JS needed) and starts transparent
			// until an element nears the viewport. So scroll each one into view,
			// as a visitor would, then require it to be opaque.
			const targets = page.locator('main h2, main h3, main .card, main .reveal');
			const n = await targets.count();
			for (let i = 0; i < n; i++) {
				const el = targets.nth(i);
				await el.scrollIntoViewIfNeeded();
				// Poll: the scroll-driven animation updates on the next frame.
				await expect.poll(() => el.evaluate((node) => {
					// Effective opacity = product of this node and its ancestors.
					let o = 1;
					for (let p: Element | null = node; p; p = p.parentElement) o *= parseFloat(getComputedStyle(p).opacity);
					return o;
				}), `${route} target #${i}`).toBeGreaterThan(0.99);
			}
		});
	}
});

// ── 2. Reduced motion ───────────────────────────────────────────────────────
test('reduced motion: no running CSS animations on home', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	const running = await page.evaluate(() =>
		document
			.getAnimations()
			.filter((a) => a.playState === 'running')
			.filter((a) => {
				const t = a.effect?.getComputedTiming();
				// Zero-length or already-ended animations are effectively static.
				return !!t && Number(t.duration) > 1;
			})
			.map((a) => (a as CSSAnimation).animationName ?? a.id)
	);
	expect(running).toEqual([]);
});

// ── 3. Clean console, no failed requests ────────────────────────────────────
for (const route of ROUTES) {
	test(`${route}: zero console errors and zero failed requests`, async ({ page }) => {
		const problems: string[] = [];
		page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
		page.on('pageerror', (e) => problems.push(`pageerror: ${e}`));
		page.on('requestfailed', (r) => problems.push(`failed: ${r.url()}`));
		page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()}: ${r.url()}`));
		await page.goto(route);
		await page.waitForLoadState('networkidle');
		expect(problems).toEqual([]);
	});
}

// ── 4. Visual baselines ─────────────────────────────────────────────────────
// Reduced motion pins the scroll reveal and drift to their static end state so
// the full-page capture is deterministic.
for (const [name, size] of [
	['desktop', { width: 1440, height: 900 }],
	['phone', { width: 375, height: 812 }]
] as const) {
	test(`home visual baseline: ${name}`, async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.setViewportSize(size);
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await expect(page).toHaveScreenshot(`home-${name}.png`, {
			fullPage: true,
			animations: 'disabled',
			maxDiffPixelRatio: 0.02
		});
	});
}

// ── 5. Page weight ──────────────────────────────────────────────────────────
test('home weighs under 600KB and loads at most one font file', async ({ page }) => {
	let bytes = 0;
	const fonts = new Set<string>();
	page.on('response', async (r) => {
		const body = await r.body().catch(() => null);
		// Transfer size when the browser reports it; body length is the fallback.
		const sizes = await r.request().sizes().catch(() => null);
		bytes += sizes ? sizes.responseBodySize + sizes.responseHeadersSize : (body?.length ?? 0);
		if (r.request().resourceType() === 'font') fonts.add(r.url());
	});
	await page.goto('/');
	await page.waitForLoadState('networkidle');
	// Scroll through so lazy images are included in the budget.
	await page.evaluate(async () => {
		for (let y = 0; y < document.body.scrollHeight; y += 600) {
			scrollTo(0, y);
			await new Promise((r) => setTimeout(r, 50));
		}
	});
	await page.waitForLoadState('networkidle');
	expect(bytes, `transferred ${bytes} bytes`).toBeLessThan(600 * 1024);
	expect(fonts.size).toBeLessThanOrEqual(1);
});

// ── 6. FAQ structured data matches the page ─────────────────────────────────
test('FAQ JSON-LD parses and its question count equals the rendered details count', async ({ page }) => {
	await page.goto('/');
	const raw = await page.locator('script[type="application/ld+json"]').allTextContents();
	const faq = raw.map((t) => JSON.parse(t)).find((j) => j['@type'] === 'FAQPage');
	expect(faq, 'FAQPage JSON-LD present').toBeTruthy();
	expect(faq.mainEntity.length).toBeGreaterThan(0);
	expect(faq.mainEntity.length).toBe(await page.locator('.faq details').count());
});


