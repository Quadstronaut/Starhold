import { test, expect } from '@playwright/test';
import { LAUNCHED, pick } from './_launch';

// STAR-145 journeys (brief unasked item 6). Each one is a visitor's path, not a
// unit check: they go through real links and the real intake endpoint.

test('journey 1: a free user finds the free tool, then how it all runs', async ({ page }) => {
	await page.goto('/');
	// the free tool is findable on the home page and is labelled open
	const zenith = page.locator('#by-audience article.product', { hasText: 'Zenithmark' }).first();
	await expect(zenith.locator('.tag')).toHaveText(pick('Open · free', 'Open · paid plans'));
	// and it opens on its own host
	await expect(zenith.getByRole('link', { name: /Open Zenithmark/ })).toHaveAttribute('href', 'https://domainscanner.starhold.app');
	// STAR-299: the Hangar is folded in as the Products page, one click from the header and from the home list
	await expect(page.locator('#services').getByRole('link', { name: /products page/i })).toHaveAttribute('href', '/products');
	await page.locator('header').getByRole('link', { name: 'Products' }).click();
	await expect(page).toHaveURL(/\/products$/);
	// it leads with the products themselves, then the supporting sections
	const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
	expect(ids).toEqual(['products', 'running', 'where', 'checks', 'who']);
	await expect(page.locator('#products article[data-product]')).toHaveCount(7);
	await expect(page.locator('#products article[data-product="starbot"] a')).toHaveCount(0); // closed: no link
	await expect(page.locator('#running li[data-product]')).toHaveCount(7);
	await expect(page.locator('#who')).toContainText('globally deployed automation engineer');
});

// Before launch the door is the invite form. After launch the invite flow is closed: the same
// first click lands on the service list, old /invite links follow it, and the endpoint refuses.
test('journey 2: the primary call to action leads to the open door (invite form, then the service list)', async ({ page }) => {
	if (LAUNCHED) {
		await page.goto('/');
		await page.getByTestId('cta-primary').click();
		await expect(page).toHaveURL(/\/#services$/);
		await expect(page.locator('#services')).toBeVisible();
		await page.goto('/invite');
		await expect(page).toHaveURL(/\/#services$/);
		await expect(page.getByTestId('invite-requested')).toHaveCount(0);
		// The endpoint's refusal of kind 'invite' is unit-tested (routes/api/intake/server.launched.test.ts);
		// the e2e server holds no intake key, so it cannot answer for it here.
		return;
	}
	// Stub the intake endpoint: the test proves the form, not the encrypted store
	// (which has its own unit tests and needs a key the e2e server does not hold).
	let sent: Record<string, unknown> | null = null;
	await page.route('**/api/intake', async (route) => {
		sent = route.request().postDataJSON();
		await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
	});
	await page.goto('/');
	await page.getByTestId('cta-primary').click();
	await expect(page).toHaveURL(/\/invite$/);
	await page.getByLabel('Email').fill('requester@example.com');
	await page.getByLabel('Service').selectOption('render');
	await page.getByRole('button', { name: 'Request an invite' }).click();
	const ok = page.getByTestId('invite-requested');
	await expect(ok).toContainText('Requested');
	await expect(ok).toContainText('requester@example.com');
	await expect(ok).not.toContainText(/enrolled|approved|welcome/i);
	expect(sent).toMatchObject({ kind: 'invite', email: 'requester@example.com', product: 'render', message: '' });
});

test('journey 2b: the invite form needs an email and a service, the use line is optional (no form after launch)', async ({ page }) => {
	await page.goto('/invite');
	if (LAUNCHED) {
		// Closed flow: no invite form is served anywhere on the page the visitor lands on.
		await expect(page).toHaveURL(/\/#services$/);
		await expect(page.getByLabel('Service')).toHaveCount(0);
		await expect(page.getByRole('button', { name: /request an invite/i })).toHaveCount(0);
		return;
	}
	await expect(page.getByLabel('Email')).toHaveAttribute('required', '');
	await expect(page.getByLabel('Service')).toHaveAttribute('required', '');
	await expect(page.getByLabel(/What you.d use it for/)).not.toHaveAttribute('required', '');
});

test('journey 3: a visitor finds refund and cancel information in two clicks', async ({ page }) => {
	await page.goto('/');
	// click 1: footer Refunds link
	await page.locator('footer').getByRole('link', { name: 'Refunds' }).click();
	await expect(page).toHaveURL(/\/legal\/refunds$/);
	// the answer is on that page: cancel, run out the period, prorated refund
	await expect(page.getByRole('heading', { name: 'Cancel', exact: true })).toBeVisible();
	await expect(page.getByText('Prorated refund now.')).toBeVisible();
	await expect(page.getByText('Run out the period.')).toBeVisible();
});

test('journey 3b: the same answer is reachable through the FAQ in two clicks', async ({ page }) => {
	await page.goto('/');
	const q = page.locator('#faq details', { hasText: 'How do payments and refunds work?' });
	await q.locator('summary').click(); // click 1: the answer itself is cancel/refund info
	await expect(q).toContainText('prorated refund now');
	await q.getByRole('link', { name: /Refund policy/ }).click(); // click 2
	await expect(page).toHaveURL(/\/legal\/refunds$/);
});
