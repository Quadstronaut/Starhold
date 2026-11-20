import { test, expect } from '@playwright/test';
import { LAUNCHED, pick, ACCOUNT_URL } from './_launch';

// Home structure after the STAR-145 redesign (brief section 3).

test('home sections follow the brief order and carry the anchors', async ({ page }) => {
	await page.goto('/');
	const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
	expect(ids).toEqual(['services', 'open-source', 'access', 'principles', 'fleet', 'operator', 'faq', 'start']);
});

// STAR-299: the products section groups by audience (Home, Small business, Teams).
test('products: one section per audience, a label chip on every card, every product present', async ({ page }) => {
	await page.goto('/');
	const groups = await page.locator('#by-audience .audience .who').allInnerTexts();
	expect(groups).toEqual(['Home', 'Small business', 'Teams']);
	const cards = page.locator('#by-audience article.product');
	// a product may sit under more than one audience, so count the distinct products
	const ids = await cards.evaluateAll((els) => [...new Set(els.map((e) => e.getAttribute('data-product')))].sort());
	expect(ids).toEqual(['dysonsphere', 'render', 'shushgame', 'starbot', 'status', 'umbermark', 'zenithmark']);
	const tags = await cards.locator('.tag').allTextContents();
	for (const t of tags)
		expect(
			pick(
				['Open · free', 'Open · early access, paid plans', 'Invitation only', 'In development', 'Retired'],
				['Open · free', 'Open', 'Open · paid plans', 'In development', 'Retired']
			)
		).toContain(t);
	// DysonSphere sits under Home as In development, linking to its interest form
	const dysonsphere = cards.filter({ hasText: 'DysonSphere' });
	await expect(dysonsphere.locator('.tag')).toHaveText('In development');
	await expect(dysonsphere.locator('a')).toHaveAttribute('href', '/dysonsphere');
	// Shush stays under Home only
	await expect(page.locator('#by-audience .audience[data-audience="home"] article[data-product="shushgame"]')).toHaveCount(1);
	await expect(page.locator('#by-audience article[data-product="shushgame"]')).toHaveCount(1);
});

// STAR-299 (operator ruling 2026-11-19): two views of one product list, and the visitor chooses.
test('product views: the switch shows one view, remembers it, and puts it in the link', async ({ page }) => {
	await page.goto('/');
	const sw = page.getByTestId('view-switch');
	const audience = page.locator('#by-audience');
	const everything = page.locator('#all-products');
	await expect(audience).toBeVisible();
	await expect(everything).toBeHidden();
	await expect(sw.getByRole('link', { name: 'By who it’s for' })).toHaveAttribute('aria-current', 'true');

	await sw.getByRole('link', { name: 'Everything' }).click();
	await expect(everything).toBeVisible();
	await expect(audience).toBeHidden();
	await expect(page).toHaveURL(/#all-products$/);
	// one row per product, then the Suite; columns as ruled
	await expect(everything.locator('thead th')).toHaveText(['Product', 'What it does', 'Who it’s for', 'Free tier', 'Starts at', 'Link']);
	await expect(everything.locator('tbody tr')).toHaveCount(8);
	await expect(everything.locator('tr[data-product="shushgame"] .who-tag')).toHaveText(['Home']);
	await expect(everything.locator('tr[data-product="umbermark"] .who-tag')).toHaveText(['Small business', 'Teams']);

	// keyboard: left arrow moves back, and the choice follows
	await sw.getByRole('link', { name: 'Everything' }).focus();
	await page.keyboard.press('ArrowLeft');
	await expect(audience).toBeVisible();
	await expect(page).toHaveURL(/#by-audience$/);
	await page.keyboard.press('ArrowRight');
	await expect(everything).toBeVisible();

	// remembered across a reload with no hash; a link can point at either view
	await page.goto('/');
	await expect(everything).toBeVisible();
	await page.goto('/contact');
	await page.goto('/#by-audience');
	await expect(audience).toBeVisible();
	await expect(everything).toBeHidden();

	// the switch stays on screen while the products section is
	await page.locator('#by-audience .audience').last().scrollIntoViewIfNeeded();
	await expect(sw).toBeInViewport();
});

test('product views: without JavaScript both views show, one after the other', async ({ browser }) => {
	const ctx = await browser.newContext({ javaScriptEnabled: false });
	const page = await ctx.newPage();
	await page.goto('/');
	await expect(page.locator('#by-audience')).toBeVisible();
	await expect(page.locator('#all-products')).toBeVisible();
	await expect(page.locator('#by-audience .view-title')).toBeVisible();
	await expect(page.locator('#all-products tbody tr')).toHaveCount(8);
	// the two options are plain links to each view
	await expect(page.getByTestId('view-switch').getByRole('link')).toHaveText(['By who it’s for', 'Everything']);
	await ctx.close();
});

test('product views: no sideways page scroll at phone or desktop width, in either view', async ({ page }) => {
	for (const width of [400, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		for (const hash of ['#by-audience', '#all-products']) {
			await page.goto('/contact');
			await page.goto('/' + hash);
			await expect(page.locator(hash)).toBeVisible();
			const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
			expect(over, `${width}px ${hash}`).toBeLessThanOrEqual(0);
		}
	}
});

test('open source is its own section: Peridot and Circle, source coming soon, no link and no ask', async ({ page }) => {
	await page.goto('/');
	const os = page.locator('#open-source');
	await expect(os.locator('h2')).toHaveText('Open source. Free.');
	await expect(os.locator('article h3')).toHaveText(['Peridot', 'Circle']);
	await expect(os.getByText('Source coming soon.')).toHaveCount(2);
	await expect(os.getByRole('link')).toHaveCount(0);
	await expect(os.locator('.tag')).toHaveCount(0); // no audience tags
	await expect(os).not.toContainText(/\$\d/);
	// outside both views: it is not inside the products section
	await expect(page.locator('#services #open-source')).toHaveCount(0);
});

test('the audience, pricing and products pages render; an unknown audience is a 404', async ({ page }) => {
	for (const [path, h1] of [
		['/for/home', 'For you at home'],
		['/for/small-business', 'For a small business'],
		['/for/teams', 'For teams and people who look after servers'],
		['/pricing', 'Simple prices'],
		['/products', 'Products']
	]) {
		const res = await page.goto(path);
		expect(res?.status(), path).toBe(200);
		await expect(page.locator('h1')).toHaveText(h1);
		await expect(page.locator('.hero-art')).toHaveAttribute('data-hero-pick', /.+/);
	}
	// the "what we don't do yet" list is on the Teams page and the pricing page only
	for (const [path, n] of [['/for/teams', 1], ['/pricing', 1], ['/for/home', 0], ['/for/small-business', 0]] as const) {
		await page.goto(path);
		await expect(page.locator('#not-yet'), path).toHaveCount(n);
	}
	expect((await page.goto('/for/gamers'))?.status()).toBe(404);
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

test('closing band: heading, the primary call to action and Read the docs, nothing else', async ({ page }) => {
	await page.goto('/');
	const band = page.locator('#start');
	await expect(band.getByRole('link')).toHaveText([pick('Request an invite', 'Get started'), 'Read the docs']);
});

test('header and footer follow the brief; Sign in shows only once sign-in works', async ({ page }) => {
	await page.goto('/');
	const header = page.locator('header nav');
	await expect(header.locator('ul.primary > li a')).toHaveText(['For home', 'Small business', 'Teams', 'Pricing', 'Products', 'Docs']);
	// STAR-299: "Create account" sits beside "Sign in" in the header, at every width, never behind the menu.
	const entry = page.getByTestId('header-entry').getByRole('link');
	await expect(entry).toHaveText(pick(['Request an invite'], ['Create account', 'Sign in']));
	await expect(entry.first()).toHaveAttribute('href', pick('/invite', ACCOUNT_URL));
	await page.setViewportSize({ width: 400, height: 800 });
	for (const a of await entry.all()) await expect(a).toBeVisible();
	await page.setViewportSize({ width: 1280, height: 800 });
	const signIn = page.getByRole('link', { name: /sign in/i });
	if (LAUNCHED) {
		// Every Sign in link goes to the Starhold Account, and there is at least one.
		expect(await signIn.count()).toBeGreaterThan(0);
		for (const a of await signIn.all()) await expect(a).toHaveAttribute('href', ACCOUNT_URL);
	} else await expect(signIn).toHaveCount(0);
	const footer = page.locator('footer');
	await expect(footer.getByRole('link', { name: 'Back the work' })).toBeVisible();
	await expect(footer.getByRole('link', { name: /discord/i })).toHaveCount(0);
	await expect(footer).toContainText('Starhold · Sovereign systems, built and operated. · Est. 2026');
});

test('404 shows the shared Starhold error page', async ({ page }) => {
	const res = await page.goto('/no-such-page');
	expect(res?.status()).toBe(404);
	await expect(page.locator('h1')).toHaveText('404 · We cannot find that page');
	await expect(page.locator('main .err-band').getByRole('link')).toHaveText(['← Go back', 'Home →']);
	// the headline is ordinary text, not the red used for form errors (a global .err rule used to leak in)
	expect(await page.locator('h1').evaluate((e) => getComputedStyle(e).color)).toBe('rgb(230, 233, 240)');
	// STAR-299: every error page says where to go next
	const next = page.locator('main nav.err-next a');
	await expect(next).toHaveText(['Home', 'Products', 'Status page', 'Contact']);
	expect(await next.evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual(['/', '/products', 'https://status.starhold.fyi', '/contact']);
	await expect(page.locator('figure.err-figure')).toBeVisible();
});

test('/shush says what the game really does and does not cross-promote', async ({ page }) => {
	await page.goto('/shush');
	await expect(page.locator('h1')).toHaveText('Shush');
	await expect(page.getByText('nothing to buy')).toBeVisible();
	await expect(page.locator('main a[href*="starhold"]')).toHaveCount(0);
});

test('/account states the real state of the account, with its chip and no form', async ({ page }) => {
	await page.goto('/account');
	await expect(page.getByText(pick('Starhold Account is in development.', 'One account for every Starhold service.'))).toBeVisible();
	await expect(page.locator('main .tag')).toHaveText(pick('In development', 'Open'));
	await expect(page.locator('main .btn-primary')).toHaveText(pick('Request an invite', 'Sign in'));
	await expect(page.locator('main .btn-primary')).toHaveAttribute('href', pick('/invite', ACCOUNT_URL));
	await expect(page.locator('main form')).toHaveCount(0);
});
