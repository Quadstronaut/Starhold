import { describe, it, expect } from 'vitest';
import { LABELS, PRODUCT_LABELS, labelFor } from './labels';
import catalog from '../../static/products.json';
import json from '../../../../docs/shared/labels.json';

describe('shared product labels', () => {
	it('are exactly the five agreed labels', () => {
		expect([...LABELS]).toEqual([
			'Open · free',
			'Open · early access, paid plans',
			'Invitation only',
			'In development',
			'Retired'
		]);
	});

	it('every product in products.json has one of the five labels', () => {
		for (const p of catalog.products) expect(LABELS as readonly string[]).toContain(labelFor(p.id));
	});

	it('every mapped label is one of the five', () => {
		for (const l of Object.values(PRODUCT_LABELS)) expect(LABELS as readonly string[]).toContain(l);
	});

	it('matches docs/shared/labels.json', () => {
		expect(json.labels).toEqual([...LABELS]);
		expect(json.products).toEqual(PRODUCT_LABELS);
	});
});
