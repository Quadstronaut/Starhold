import { describe, it, expect } from 'vitest';
import { RATES, usd } from './rates';

describe('rates', () => {
	it('RATES holds the published prices', () => {
		expect(RATES).toEqual({
			personalHourlyUsd: 49,
			businessHourlyUsd: 149,
			managedOpsServerMonthlyUsd: 99
		});
	});
	it('usd formats whole dollars', () => {
		expect(usd(149)).toBe('$149');
		expect(usd(49)).toBe('$49');
	});
});
