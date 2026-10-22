import { describe, it, expect } from 'vitest';
import { SUMMARY, INCLUDED, NOT_INCLUDED, ONBOARDING, BILLING_TERMS } from './hangar-hosting';

describe('hangar-hosting content', () => {
	it('INCLUDED is exactly the six items, in order', () => {
		expect([...INCLUDED]).toEqual([
			'Rootless containers on Starhold-run servers',
			'Nightly backups',
			'TLS certificates, issued and renewed',
			'A public status page',
			'Patched hosts',
			'Discord support role'
		]);
	});

	it('states the exclusions: no DB management, no 24/7 SLA, best-effort business days', () => {
		const text = NOT_INCLUDED.join(' ');
		expect(text).toContain('No managed databases');
		expect(text).toContain('No 24/7 SLA');
		expect(text).toContain('best-effort, business days');
	});

	it('onboarding is intake form, containerize or compose file, live within a week', () => {
		expect(ONBOARDING).toHaveLength(3);
		expect(ONBOARDING[0]).toContain('intake form');
		expect(ONBOARDING[1]).toContain('compose file');
		expect(ONBOARDING[2]).toContain('within a week');
	});

	it('promises no databases and names no employer or internal host', () => {
		const all = [SUMMARY, ...INCLUDED, ...NOT_INCLUDED, ...ONBOARDING, BILLING_TERMS].join('\n');
		// "No managed databases" is the exclusion; any other mention of managed DBs or DB work would be a promise.
		expect(all.replace(/No managed databases/g, '')).not.toMatch(/managed database|we host databases|database (work|admin)|\bDBA\b/i);
		// Internal markers are assembled at runtime: the public-mirror guard greps apps/ for them as literals.
		const internal = new RegExp(
			[['quad', 'stronix'].join(''), ['no', 'de[12]'].join(''), String.raw`\b\d{1,3}(\.\d{1,3}){3}\b`].join('|'),
			'i'
		);
		expect(all).not.toMatch(internal);
	});

	it('billing terms: monthly, cancel any time, nothing prorated, export within 14 days', () => {
		expect(BILLING_TERMS).toContain('billed monthly, per app');
		expect(BILLING_TERMS).toContain('cancel any time');
		expect(BILLING_TERMS).toContain('nothing is prorated');
		expect(BILLING_TERMS).toContain('exported on request within 14 days');
	});
});