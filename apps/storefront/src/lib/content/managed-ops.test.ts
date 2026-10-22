import { describe, it, expect } from 'vitest';
import { INCLUDED, ENGAGEMENT_RULES, MAX_SERVERS } from './managed-ops';

const rule = (id: string) => ENGAGEMENT_RULES.find((r) => r.id === id)!.text;

describe('managed-ops content', () => {
	it('INCLUDED is exactly the six items, in order', () => {
		expect([...INCLUDED]).toEqual([
			'Umbermark rescan',
			'Pending-update report',
			'Backup verification',
			'Service health on status.starhold.fyi',
			'One-page monthly report',
			'Discord support role'
		]);
	});

	it('rule ids are the five, in order', () => {
		expect(ENGAGEMENT_RULES.map((r) => r.id)).toEqual([
			'intake',
			'gated-deploy',
			'liability',
			'no-databases',
			'sla'
		]);
	});

	it('rule texts carry spec 3.2 wording', () => {
		expect(rule('intake')).toContain('existing procedures');
		expect(rule('intake')).toContain('root access is required for system updates');
		expect(rule('gated-deploy')).toContain(
			'Nothing is deployed without the customer testing it, or observing it working in their test environment'
		);
		expect(rule('gated-deploy')).toContain('The customer physically gates every deployment');
		expect(rule('liability')).toContain('Liability stays with the customer by written agreement');
		expect(rule('liability')).toContain('not liable for customer-gated deployments');
		expect(rule('no-databases')).toContain('No databases');
		expect(rule('no-databases')).toContain('SQL');
		expect(rule('no-databases')).toContain('referred out');
		expect(rule('no-databases')).not.toContain('**');
		expect(rule('sla')).toContain('best-effort');
		expect(rule('sla')).toContain('business days');
		expect(rule('sla')).toContain('no 24/7');
	});

	it('keeps the deferred-checkout server cap', () => {
		expect(MAX_SERVERS).toBe(50);
	});
});
