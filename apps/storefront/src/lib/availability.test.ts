import { describe, it, expect } from 'vitest';
import { AVAILABILITY, CHECKOUT_NOTICE, OPEN_MEANS, availabilityFor } from './availability';
import { serviceItems } from './content/copy';
import { PRODUCT_LABELS } from './labels';
import { LAUNCHED } from './launch';
import json from '../../../../docs/shared/availability.json';

describe('availability source', () => {
	it('matches docs/shared/availability.json', () => {
		expect(json.products).toEqual(AVAILABILITY);
		expect(json.checkoutNotice).toBe(CHECKOUT_NOTICE);
		expect(json.openMeans).toBe(OPEN_MEANS);
	});

	it('every product with an availability line has a label, and the rulings are pinned', () => {
		for (const id of Object.keys(AVAILABILITY)) expect(PRODUCT_LABELS[id], id).toBeTruthy();
		expect(AVAILABILITY).toEqual({
			umbermark: LAUNCHED ? 'Open: free scans; report $5 one-off; Solo $9, Pro $19, Agency $49 a month' : 'Free scans open; purchases paused',
			zenithmark: LAUNCHED ? 'Open: free scorecard; monitoring $9 or $29 a month' : 'Open',
			render: LAUNCHED ? 'Open: free tier; Hobby $5, Pro $19, Scale $49 a month' : 'Free tier open; sign-in and checkout closed',
			status: LAUNCHED ? 'Open: free tier; Private $15, MSP $29 a month' : 'Public pages open; sign-in closed',
			shushgame: 'Open',
			starbot: 'In development',
			qnix: 'Interest form only'
		});
	});

	it('every service card carries its availability line', () => {
		expect(serviceItems.length).toBe(Object.keys(AVAILABILITY).length);
		for (const s of serviceItems) expect(s.availability, s.id).toBe(availabilityFor(s.id));
	});
});
