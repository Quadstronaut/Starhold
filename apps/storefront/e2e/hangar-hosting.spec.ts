import { test, expect } from '@playwright/test';

// Literal copies of INCLUDED (src/lib/content/hangar-hosting.ts); kept literal so the test pins the shipped copy.
const INCLUDED = [
	'Rootless containers on Starhold-run servers',
	'Nightly backups',
	'TLS certificates, issued and renewed',
	'A public status page',
	'Patched hosts',
	'Discord support role'
];

test('/services/hosting shows price, inclusions, exclusions, contact CTA only', async ({ page }) => {
	await page.goto('/services/hosting');
	await expect(page.getByText('$19/app/month').first()).toBeVisible();
	for (const item of INCLUDED) await expect(page.getByText(item).first()).toBeVisible();
	await expect(page.getByText('No managed databases').first()).toBeVisible();
	await expect(page.getByText('No 24/7 SLA').first()).toBeVisible();
	await expect(page.getByRole('button', { name: 'Subscribe' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Request Hangar hosting' })).toHaveAttribute(
		'href',
		'/contact?intent=hosting'
	);
});

test('/contact?intent=hosting shows the hosting request form', async ({ page }) => {
	await page.goto('/contact?intent=hosting');
	await expect(page.getByRole('heading', { name: 'Request Hangar hosting' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Request hosting' })).toBeVisible();
});

test('products.json lists hangar-hosting at $19/mo', async ({ request }) => {
	const catalog = await (await request.get('/products.json')).json();
	const p = catalog.products.find((x: { id: string }) => x.id === 'hangar-hosting');
	expect(p.pricing.monthly_usd).toBe(19);
});