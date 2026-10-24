import { test, expect } from '@playwright/test';

// Evidence id: no-third-party-tracking. This file IS the verifier for the
// "no trackers" claim, so it must fail loudly the day a third-party request or a
// cookie sneaks in. Two invariants per route:
//   1. every network request goes to the same host the page was served from;
//   2. the browser's cookie jar is empty after the page has loaded.

const ROUTES = [
	'/',
	'/contact',
	'/shush',
	'/invite',
	'/account',
	'/qnix',
	'/legal/terms',
	'/legal/privacy',
	'/legal/refunds'
];

for (const route of ROUTES) {
	test(`privacy: ${route} talks to one host and sets no cookies`, async ({ page, context, baseURL }) => {
		const ownHost = new URL(baseURL!).host;
		const hosts = new Set<string>();

		// Record every request the page makes (document, scripts, fonts, XHR, ...).
		// data: and blob: URLs never leave the browser, so they carry no host.
		page.on('request', (req) => {
			const url = new URL(req.url());
			if (url.protocol === 'http:' || url.protocol === 'https:') hosts.add(url.host);
		});

		// networkidle: wait until late-loading third-party calls would have fired.
		await page.goto(route, { waitUntil: 'networkidle' });

		expect([...hosts], `hosts contacted by ${route}`).toEqual([ownHost]);
		expect(await context.cookies(), `cookies set by ${route}`).toEqual([]);
	});
}

// The rate-limit path (privacy policy section 5: "sets no cookie"). Both calls
// are rejected or swallowed before anything is relayed: the first fails
// validation after the rate limiter has run, the second trips the honeypot.
test('privacy: /api/intake responses carry no Set-Cookie header', async ({ request, context }) => {
	const rejected = await request.post('/api/intake', {
		data: { kind: 'contact', email: 'visitor@example.com', message: 'short' }
	});
	expect(rejected.headers()['set-cookie'], 'validation-failure response').toBeUndefined();

	const swallowed = await request.post('/api/intake', { data: { kind: 'contact', website: 'bot' } });
	expect(swallowed.headers()['set-cookie'], 'honeypot response').toBeUndefined();

	expect(await context.cookies()).toEqual([]);
});
