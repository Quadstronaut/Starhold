// Tier B · runtime acceptance for the storefront redesign.
// Everything here is asserted against the production adapter-node build that
// Playwright boots in playwright.config.ts — the same artifact the host runs.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const APP_ROOT = join(dirname(fileURLToPath(new URL(import.meta.url))), '..');
const json = (rel: string) => JSON.parse(readFileSync(join(APP_ROOT, rel), 'utf8'));

const EVIDENCE = json('src/lib/content/evidence.json') as {
	items: { id: string; status: string }[];
};
const STATS = json('src/lib/content/stats.json') as Record<string, number>;

const MARKETING = ['/', '/work', '/capabilities', '/operator', '/contact'];
const ALL_ROUTES = [
	'/',
	'/work',
	'/capabilities',
	'/operator',
	'/contact',
	'/services/automation',
	'/products/custom-bots',
	'/products/qnix',
	'/products/shushgame',
	'/cart'
];

const METAPHORS = [
	'fleet', 'mission', 'missions', 'sovereign', 'sovereignty', 'orbit', 'orbital',
	'launch', 'launches', 'liftoff', 'star', 'stars', 'starship', 'hangar', 'pad',
	'flight', 'flying', 'flown', 'crew', 'console', 'pilot', 'ship', 'dock',
	'telemetry', 'trajectory', 'voyage', 'cosmic', 'galaxy', 'constellation',
	'beacon', 'rocket', 'payload', 'manifest', 'navigator', 'warp', 'astronaut'
];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const countTerms = (text: string, terms: string[]) =>
	terms.reduce(
		(n, t) => n + (text.match(new RegExp(`(?<![\\w-])${esc(t)}(?![\\w-])`, 'gi')) ?? []).length,
		0
	);

const bodyText = (page: Page) => page.locator('body').innerText();

/** WCAG relative luminance from a computed `rgb(r, g, b)` string. */
function luminance(css: string): number {
	const [r, g, b] = (css.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
	const lin = [r, g, b].map((v) => {
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
const ratio = (a: string, b: string) => {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
};

// ═══ B1 · hero ══════════════════════════════════════════════════════════════

test('B1.1 the home H1 is deterministic across loads and <= 70 characters', async ({ page }) => {
	await page.goto('/');
	const first = (await page.locator('h1').innerText()).trim();
	await page.reload();
	await page.goto('/?cachebust=1');
	const second = (await page.locator('h1').innerText()).trim();

	expect(second).toBe(first);
	expect(first.length).toBeLessThanOrEqual(70);
	expect(first.length).toBeGreaterThan(10);
	await expect(page.locator('h1')).toHaveCount(1);
});

test('B1.2 hero, both CTAs, and a proof signal sit above the 800px fold', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('/');

	const mustFit = [
		page.locator('h1'),
		page.locator('.lede').first(),
		page.getByTestId('cta-primary'),
		page.getByTestId('cta-secondary'),
		page.locator('[data-evidence]').first()
	];

	for (const loc of mustFit) {
		await expect(loc).toBeVisible();
		const box = (await loc.boundingBox())!;
		expect(box, 'element has no box').toBeTruthy();
		expect(box.y + box.height, `${await loc.evaluate((e) => e.tagName)} crosses the fold`).toBeLessThanOrEqual(800);
	}
});

test('B1.3 the CTA pair points at quote intake and at the work index', async ({ page }) => {
	await page.goto('/');
	const primary = page.getByTestId('cta-primary');
	const secondary = page.getByTestId('cta-secondary');
	expect(await primary.getAttribute('href')).toMatch(/^\/contact/);
	expect(await primary.getAttribute('href')).toContain('intent=quote');
	expect(await secondary.getAttribute('href')).toMatch(/^\/work/);

	// and the quote intent actually preselects the quote flow, server-rendered
	await primary.click();
	await expect(page.getByRole('button', { name: /request a quote/i })).toBeVisible();
});

test('B1.4 the $5 bot is two clicks from home and still sells', async ({ page }) => {
	await page.goto('/');
	await page.locator('#fleet').getByRole('link', { name: /custom discord bots/i }).click();
	await expect(page).toHaveURL(/\/products\/custom-bots$/);
	await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
});

// ═══ B2 · voice ═════════════════════════════════════════════════════════════

test('B2.1 no corporate we/our/ours renders on any marketing route', async ({ page }) => {
	for (const route of MARKETING) {
		await page.goto(route);
		const text = await bodyText(page);
		const hits = ['we', 'our', 'ours'].filter((t) =>
			new RegExp(`(?<![\\w-])${t}(?![\\w-])`, 'i').test(text)
		);
		expect(hits, `${route} uses corporate plural`).toEqual([]);
	}
});

test('B2.2 /operator links the LinkedIn profile exactly once', async ({ page }) => {
	await page.goto('/operator');
	await expect(page.locator('a[href*="linkedin.com/in/quadstronaut"]')).toHaveCount(1);
});

test('B2.3 metaphor density: <=8 on the home page, <=2 in the hero', async ({ page }) => {
	await page.goto('/');
	expect(countTerms(await bodyText(page), METAPHORS)).toBeLessThanOrEqual(8);
	const hero = await page.locator('main > section').first().innerText();
	expect(countTerms(hero, METAPHORS)).toBeLessThanOrEqual(2);
});

test('B2.6 Kyle Green is named on the home page and on /operator', async ({ page }) => {
	await page.goto('/');
	expect(await bodyText(page)).toContain('Kyle Green');
	await page.goto('/operator');
	expect(await bodyText(page)).toContain('Kyle Green');
	await expect(page.locator('h1')).toContainText('Kyle Green');
});

// ═══ B3 · evidence ══════════════════════════════════════════════════════════

test('B3.1 no pending evidence renders and no employer entity is named', async ({ page }) => {
	const pending = EVIDENCE.items.filter((i) => i.status !== 'verified').map((i) => i.id);
	// The registry may legitimately hold zero pending rows (it does since
	// starhold-repo was confirmed public on 2026-08-24). The gate that makes a
	// pending claim un-renderable is unit-tested directly in
	// src/acceptance/a3-evidence.test.ts (A3.5b), so this test no longer
	// requires a pending row to exist in order to be meaningful — it enforces
	// that whatever IS pending never reaches a page, and that every rendered id
	// resolves to a real row.
	for (const route of MARKETING) {
		await page.goto(route);
		const ids = await page.locator('[data-evidence]').evaluateAll((els) =>
			els.map((e) => e.getAttribute('data-evidence') ?? '')
		);
		for (const id of ids) {
			expect(pending, `${route} renders pending evidence ${id}`).not.toContain(id);
			expect(EVIDENCE.items.map((i) => i.id), `${route} cites unknown evidence ${id}`).toContain(id);
		}
		const text = await bodyText(page);
		expect(text, `${route} names a legal entity`).not.toMatch(
			/(?<![\w-])(inc|llc|corp|corporation|incorporated|ltd|gmbh|plc)(?![\w-])/i
		);
	}
});

test('B3.2 every number on a marketing page is derived, except the founding year', async ({ page }) => {
	// The availability quarter is derived from the clock on the server, so its
	// digits are legitimate — but they are computed here independently rather
	// than scraped from the page, so a hardcoded quarter would still fail.
	const now = new Date();
	const q = Math.floor(now.getUTCMonth() / 3) + 1;
	const rollsOver = q === 4;
	const availability = [String(rollsOver ? 1 : q + 1), String(rollsOver ? now.getUTCFullYear() + 1 : now.getUTCFullYear())];

	const allowed = new Set([
		'2026',
		...availability,
		...Object.values(STATS)
			.filter((v) => typeof v === 'number')
			.map(String)
	]);
	for (const route of MARKETING) {
		await page.goto(route);
		const numbers = ((await bodyText(page)).match(/\d+/g) ?? []).filter((n) => !allowed.has(n));
		expect(numbers, `${route} renders an undocumented number`).toEqual([]);
	}
});

// Regression guard for the availability line: it must state the quarter AFTER
// the current one, and it must come from the server rather than a copy string.
// If someone ever hardcodes a quarter, this fails the moment the clock moves on.
test('B3.4 the availability line names the next quarter, derived at request time', async ({ page }) => {
	const now = new Date();
	const q = Math.floor(now.getUTCMonth() / 3) + 1;
	const expected = q === 4 ? `Q1 ${now.getUTCFullYear() + 1}` : `Q${q + 1} ${now.getUTCFullYear()}`;

	await page.goto('/');
	const line = page.locator('.availability');
	await expect(line).toBeVisible();
	await expect(line).toContainText(expected);
	// The current quarter must not be what is advertised.
	await expect(line).not.toContainText(`Q${q} ${now.getUTCFullYear()}`);
});

test('B3.3 the home page carries a proof strip of 3-5 checkable outbound links', async ({ page }) => {
	await page.goto('/');
	const strip = page.locator('.proof a');
	const count = await strip.count();
	expect(count).toBeGreaterThanOrEqual(3);
	expect(count).toBeLessThanOrEqual(5);

	const ALLOWED = ['starhold.fyi', 'status.starhold.fyi', 'starhold.app', 'github.com', 'linkedin.com', 'www.linkedin.com'];
	for (let i = 0; i < count; i++) {
		const link = strip.nth(i);
		await expect(link).toBeVisible();
		const href = (await link.getAttribute('href'))!;
		expect(ALLOWED, `proof link ${href}`).toContain(new URL(href).host);
		expect(await link.getAttribute('data-evidence')).toBeTruthy();
	}
});

// ═══ B4 · information architecture ══════════════════════════════════════════

test('B4.1 the cart is one click away from every route, desktop and mobile', async ({ page }) => {
	for (const width of [1280, 375]) {
		await page.setViewportSize({ width, height: 800 });
		for (const route of ALL_ROUTES) {
			await page.goto(route);
			const cart = page.getByTestId('cart-link');
			await expect(cart, `${route} @${width}`).toBeVisible();
			expect(await cart.getAttribute('href')).toBe('/cart');
		}
		// and it genuinely navigates, without opening a drawer first
		await page.goto('/products/qnix');
		await page.getByTestId('cart-link').click();
		await expect(page).toHaveURL(/\/cart$/);
	}
});

test('B4.2 no price string renders anywhere on the home page', async ({ page }) => {
	await page.goto('/');
	const text = await bodyText(page);
	expect(text).not.toMatch(/\$\s?\d/);
	expect(text).not.toMatch(/\b\d+\s*\/\s*(mo|month)\b/i);
});

test('B4.3 /about is a real 308 to /operator and #fleet still lands', async ({ page, request }) => {
	const res = await request.get('/about', { maxRedirects: 0 });
	expect(res.status()).toBe(308);
	expect(res.headers()['location']).toBe('/operator');

	await page.goto('/about');
	await expect(page).toHaveURL(/\/operator$/);

	await page.goto('/#fleet');
	await expect(page.locator('#fleet')).toBeVisible();
	await expect(page.locator('#fleet h2')).toBeVisible();
});

// ═══ B5 · craft and accessibility ═══════════════════════════════════════════

test('B5.1 one h1 per page and no skipped heading levels', async ({ page }) => {
	for (const route of [...ALL_ROUTES, '/cart/success', '/legal/terms']) {
		await page.goto(route);
		const levels = await page.evaluate(() =>
			[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]))
		);
		expect(levels.filter((l) => l === 1).length, `${route} h1 count`).toBe(1);
		for (let i = 1; i < levels.length; i++) {
			expect(levels[i], `${route} skips from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(
				levels[i - 1] + 1
			);
		}
	}
});

test('B5.2 the primary CTA shows a >=2px focus ring under keyboard focus', async ({ page }) => {
	await page.goto('/');
	let focused = false;
	for (let i = 0; i < 40 && !focused; i++) {
		await page.keyboard.press('Tab');
		focused = await page.evaluate(
			() => (document.activeElement as HTMLElement | null)?.dataset?.testid === 'cta-primary'
		);
	}
	expect(focused, 'never reached the primary CTA by keyboard').toBe(true);

	const outline = await page.evaluate(() => {
		const s = getComputedStyle(document.activeElement!);
		return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
	});
	expect(parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
	expect(outline.style).not.toBe('none');
});

test('B5.3 the mobile drawer reports its state and closes on Escape', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 800 });
	await page.goto('/');

	const toggle = page.locator('button[aria-controls="nav-primary"]');
	const drawerLink = page.locator('#nav-primary').getByRole('link', { name: 'Capabilities' });

	await expect(toggle).toBeVisible();
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(drawerLink).toBeHidden();

	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await expect(drawerLink).toBeVisible();

	await page.keyboard.press('Escape');
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await expect(drawerLink).toBeHidden();
});

test('B5.4 rendered contrast meets the token contract', async ({ page }) => {
	await page.goto('/');
	const pair = await page.evaluate(() => {
		const bg = getComputedStyle(document.body).backgroundColor;
		const body = getComputedStyle(document.querySelector('main h1')!).color;
		const muted = getComputedStyle(document.querySelector('main .lede')!).color;
		const cta = document.querySelector('[data-testid="cta-primary"]')!;
		const ctaStyle = getComputedStyle(cta);
		return { bg, body, muted, ctaColor: ctaStyle.color, ctaBg: ctaStyle.backgroundColor };
	});
	expect(ratio(pair.body, pair.bg)).toBeGreaterThanOrEqual(7);
	expect(ratio(pair.muted, pair.bg)).toBeGreaterThanOrEqual(4.5);
	expect(ratio(pair.ctaColor, pair.ctaBg)).toBeGreaterThanOrEqual(4.5);
});

test('B5.5 the home page works with JavaScript disabled', async ({ browser }) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	const page = await context.newPage();
	await page.goto('/');

	await expect(page.locator('h1')).toBeVisible();
	await expect(page.getByTestId('cta-primary')).toBeVisible();
	await expect(page.getByTestId('cta-secondary')).toBeVisible();
	await expect(page.locator('#fleet')).toBeVisible();
	await expect(page.getByTestId('cart-link')).toBeVisible();
	await context.close();
});

test('B5.6 first paint makes no third-party request and stays inside budget', async ({ page, baseURL }) => {
	const ownHost = new URL(baseURL!).host;
	const responses: { url: string; body: Promise<Buffer> }[] = [];
	page.on('response', (r) => responses.push({ url: r.url(), body: r.body().catch(() => Buffer.alloc(0)) }));

	await page.goto('/', { waitUntil: 'load' });

	const thirdParty = responses
		.map((r) => new URL(r.url).host)
		.filter((h) => h !== ownHost);
	expect(thirdParty, 'a third-party host was contacted').toEqual([]);
	expect(responses.length, 'too many requests on first paint').toBeLessThanOrEqual(25);

	const bytes = (await Promise.all(responses.map((r) => r.body))).reduce((n, b) => n + b.byteLength, 0);
	expect(bytes / 1024, 'transfer budget exceeded (KB)').toBeLessThanOrEqual(250);
});
