import { test, expect } from '@playwright/test';

// Literal copies of INCLUDED (src/lib/content/managed-ops.ts); kept literal so the test pins the shipped copy.
const INCLUDED = [
	'Umbermark rescan',
	'Pending-update report',
	'Backup verification',
	'Service health on status.starhold.fyi',
	'One-page monthly report',
	'Discord support role'
];

test('/rates shows both hourly rates', async ({ page }) => {
	await page.goto('/rates');
	await expect(page.getByText('$49/hr').first()).toBeVisible();
	await expect(page.getByText('$149/hr').first()).toBeVisible();
});

test('/services/managed-ops shows price, inclusions, rules, contact CTA only', async ({ page }) => {
	await page.goto('/services/managed-ops');
	await expect(page.getByText('$99').first()).toBeVisible();
	for (const item of INCLUDED) await expect(page.getByText(item).first()).toBeVisible();
	await expect(page.getByText('No databases').first()).toBeVisible();
	await expect(page.getByRole('button', { name: 'Subscribe' })).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Request Managed Ops' })).toHaveAttribute(
		'href',
		'/contact?intent=quote'
	);
});

test('/legal/services is 200 and noindex', async ({ page }) => {
	const res = await page.goto('/legal/services');
	expect(res?.status()).toBe(200);
	await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
});
