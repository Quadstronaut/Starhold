// STAR-299: the audience list and the two views built from it.
import { describe, it, expect } from 'vitest';
import { serviceItems } from './copy';
import { AVAILABILITY, SUITE_LINE } from '../availability';
import { STARBOT_AVAILABLE } from '../starbot';
import { LAUNCHED } from '../launch';
import { AUDIENCES, OPEN_SOURCE, OPEN_SOURCE_THANKS, NOT_YET, TIER_USD, productRows, packageMonthlyUsd, serviceFor, audienceFor } from './catalog';
import { collectStrings } from '../../acceptance/_helpers';

describe('catalog · audiences', () => {
	it('the audiences are Home, Small business and Teams, in that order', () => {
		expect(AUDIENCES.map((a) => a.label)).toEqual(['Home', 'Small business', 'Teams']);
		expect(AUDIENCES.map((a) => a.id)).toEqual(['home', 'small-business', 'teams']);
		expect(collectStrings(AUDIENCES).join('\n')).not.toMatch(/enterprise|IT teams|gamers/i);
	});

	it('every audience item and every package plan names a real product', () => {
		for (const a of AUDIENCES) {
			for (const i of a.items) expect(() => serviceFor(i.service), `${a.id}: ${i.service}`).not.toThrow();
			for (const p of a.packages) for (const plan of p.plans) expect(() => serviceFor(plan.service), `${a.id}: ${plan.service}`).not.toThrow();
		}
		expect(audienceFor('teams')!.notYet).toBe(true);
		expect(audienceFor('no-such-audience')).toBeUndefined();
	});

	it('every product belongs to at least one audience, and Shush stays under Home', () => {
		const rows = productRows();
		for (const s of serviceItems) expect(rows.find((r) => r.id === s.id)!.audiences.length, s.id).toBeGreaterThan(0);
		expect(rows.find((r) => r.id === 'shushgame')!.audiences).toEqual(['Home']);
		expect(rows.find((r) => r.id === 'suite')!.audiences).toEqual(['Teams']);
	});
});

describe('catalog · the Everything table', () => {
	const rows = productRows();

	it('has one row per product, in the product list order, then the Suite', () => {
		expect(rows.map((r) => r.id)).toEqual([...serviceItems.map((s) => s.id), 'suite']);
		for (const s of serviceItems) {
			const r = rows.find((x) => x.id === s.id)!;
			expect(r.name).toBe(s.name);
			expect(r.does).toBe(s.what);
			expect(r.status).toBe(s.status);
		}
	});

	it('a new audience is one entry: it shows up as a tag on every product it names', () => {
		AUDIENCES.push({ id: 'gamers', label: 'Gamers', navLabel: 'Gamers', heading: 'x', intro: 'x', items: [{ service: 'shushgame', outcome: 'x', body: 'x' }], packages: [] });
		try {
			expect(productRows().find((r) => r.id === 'shushgame')!.audiences).toEqual(['Home', 'Gamers']);
			expect(audienceFor('gamers')!.label).toBe('Gamers');
		} finally {
			AUDIENCES.pop();
		}
		expect(productRows().find((r) => r.id === 'shushgame')!.audiences).toEqual(['Home']);
	});

	it('starting prices are read from the price lines, never typed', () => {
		if (LAUNCHED) for (const id of ['status', 'umbermark', 'zenithmark', 'render']) expect(rows.find((r) => r.id === id)!.startsAt, id).toBe('From $5');
		expect(rows.find((r) => r.id === 'shushgame')).toMatchObject({ free: 'Yes', startsAt: 'Free' });
		expect(rows.find((r) => r.id === 'dysonsphere')).toMatchObject({ free: 'Not yet', startsAt: 'No price yet' });
		expect(rows.find((r) => r.id === 'suite')).toMatchObject({ free: 'No', startsAt: '$49 a month' });
	});

	it('Starbot follows its one switch: no link while it is closed', () => {
		const r = rows.find((x) => x.id === 'starbot')!;
		expect(r.startsAt).toBe('From $5'); // from its own note: Plus $5, Pro $19
		if (STARBOT_AVAILABLE) expect(r.link).not.toBeNull();
		else expect(r).toMatchObject({ link: null, closed: 'Not open yet.' });
	});
});

describe('catalog · packages are sets of existing plans, with no price of their own', () => {
	it('the shared price steps are the ones the price lines state', () => {
		if (LAUNCHED)
			for (const id of ['status', 'umbermark', 'zenithmark', 'render']) {
				expect(AVAILABILITY[id], id).toContain(`$${TIER_USD.entry}`);
				expect(AVAILABILITY[id], id).toContain(`$${TIER_USD.middle}`);
			}
		expect(SUITE_LINE).toContain(`$${TIER_USD.suite} a month`);
		expect(TIER_USD.free).toBe(0);
	});

	it('a package total is its plans added up; the Suite is one plan at the Suite price', () => {
		const sets = Object.fromEntries(AUDIENCES.flatMap((a) => a.packages).map((p) => [p.name, packageMonthlyUsd(p)]));
		expect(sets).toEqual({ 'Free at home': 0, 'Check first': 0, 'Keep watch': 5, 'One tool at a time': 5, 'Starhold Suite': 49 });
		// the Suite is only worth it for three or more tools, as its card says
		expect(3 * TIER_USD.middle).toBeGreaterThan(TIER_USD.suite);
		expect(2 * TIER_USD.middle).toBeLessThan(TIER_USD.suite);
	});

	it('no audience or package text states a price', () => {
		expect(collectStrings(AUDIENCES).join('\n')).not.toMatch(/\$\s?\d/);
	});
});

describe('catalog · open source and the not-yet list', () => {
	it('open source is Peridot and Circle, with "source coming soon" and nothing promised', () => {
		expect(OPEN_SOURCE.map((p) => p.name)).toEqual(['Peridot', 'Circle']);
		for (const p of OPEN_SOURCE) expect(p.source).toBe('Source coming soon.');
		expect(OPEN_SOURCE[0].state).toBe('Free. Coming soon.');
		expect(OPEN_SOURCE[1].state).toBe('In development.');
		const text = collectStrings({ OPEN_SOURCE, OPEN_SOURCE_THANKS }).join('\n');
		// no link, no date, no licence promise, no "available", no ask
		expect(text).not.toMatch(/https?:|github|GPL|licen[cs]e|Google Play|available|download|\d{4}|support us|donate|back the work/i);
	});

	it('the not-yet list is short and repeats no claim the site makes elsewhere as built', () => {
		expect(NOT_YET.items.length).toBeLessThanOrEqual(6);
		expect(NOT_YET.items).not.toContain('One public price table.');
		expect(NOT_YET.items.join('\n')).toMatch(/Google account only/);
	});
});
