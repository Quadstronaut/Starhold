import { describe, it, expect, vi, afterEach } from 'vitest';
import { allow, trackedIps, isTracked, WINDOW_MS, MAX_PER_WINDOW } from './rate-limit';

describe('rate limiter', () => {
	it('allows up to MAX_PER_WINDOW hits then blocks', () => {
		const t = 1_000_000;
		for (let i = 0; i < MAX_PER_WINDOW; i++) expect(allow('ip-a', t + i)).toBe(true);
		expect(allow('ip-a', t + MAX_PER_WINDOW)).toBe(false);
	});

	it('frees the slot once the window slides past', () => {
		const t = 2_000_000;
		for (let i = 0; i < MAX_PER_WINDOW; i++) allow('ip-b', t);
		expect(allow('ip-b', t + 1)).toBe(false);
		expect(allow('ip-b', t + WINDOW_MS + 1)).toBe(true);
	});

	it('tracks IPs independently', () => {
		const t = 3_000_000;
		for (let i = 0; i < MAX_PER_WINDOW; i++) allow('ip-c', t);
		expect(allow('ip-d', t)).toBe(true);
	});

	it('evicts fully-expired IPs so the map cannot grow without bound', () => {
		const t = 4_000_000;
		// Seed two unique IPs so their slots exist in the map.
		allow('ip-evict1', t);
		allow('ip-evict2', t);
		// After the window expires, a re-entry prunes everything expired
		// (including the other test addresses) and re-inserts only itself.
		allow('ip-evict1', t + WINDOW_MS + 1);
		expect(trackedIps()).toBe(1);
		// A second expired-then-re-entered IP: exactly the two live ones.
		allow('ip-evict2', t + WINDOW_MS + 1);
		expect(trackedIps()).toBe(2);
	});

	it('a check by anyone drops every other expired address (STAR-305)', () => {
		const t = 5_000_000;
		allow('ip-old-1', t);
		allow('ip-old-2', t);
		// A different visitor posts after the window: the old two must be gone,
		// not kept until they themselves post again.
		allow('ip-new', t + WINDOW_MS + 1);
		expect(isTracked('ip-old-1')).toBe(false);
		expect(isTracked('ip-old-2')).toBe(false);
		expect(isTracked('ip-new')).toBe(true);
	});
});

describe('rate limiter with a fake clock and no further traffic (STAR-305)', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('forgets an address once the 10-minute window has passed, with no other request', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-21T08:00:00Z'));
		// Fresh module so no entry from other tests shares the map.
		vi.resetModules();
		const rl = await import('./rate-limit');
		expect(rl.allow('203.0.113.50')).toBe(true);
		expect(rl.isTracked('203.0.113.50')).toBe(true);
		// Just inside the window: still held (it still limits).
		vi.advanceTimersByTime(rl.WINDOW_MS - 1);
		expect(rl.isTracked('203.0.113.50')).toBe(true);
		// Window over: the timer sweep removes it without any new request.
		vi.advanceTimersByTime(2);
		expect(rl.isTracked('203.0.113.50')).toBe(false);
		expect(rl.trackedIps()).toBe(0);
	});

	it('keeps limiting inside the window and frees the visitor after it', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-11-21T09:00:00Z'));
		vi.resetModules();
		const rl = await import('./rate-limit');
		for (let i = 0; i < rl.MAX_PER_WINDOW; i++) {
			expect(rl.allow('198.51.100.7')).toBe(true);
			vi.advanceTimersByTime(1000);
		}
		expect(rl.allow('198.51.100.7')).toBe(false);
		// Another visitor is not affected.
		expect(rl.allow('198.51.100.8')).toBe(true);
		vi.advanceTimersByTime(rl.WINDOW_MS);
		expect(rl.trackedIps()).toBe(0);
		expect(rl.allow('198.51.100.7')).toBe(true);
	});
});
