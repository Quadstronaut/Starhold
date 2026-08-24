// Tier A · A3 — anti-fabrication contract.
// Every factual claim resolves to a registry row, every row has a verifier a
// stranger can check, pending rows never ship, and every number is re-derived.
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import registry from '../lib/content/evidence.json';
import stats from '../lib/content/stats.json';
import * as copy from '../lib/content/copy';
import { computeStats } from '../../scripts/count-tests.mjs';
import {
	REPO_ROOT,
	srcFiles,
	collectStrings,
	collectEvidenceRefs,
	findTerms,
	BANNED_ENTITY_SUFFIX
} from './_helpers';

type Item = {
	id: string;
	claim: string;
	status: string;
	verifier: string;
	sources?: string[];
	note?: string;
};

const ITEMS = registry.items as Item[];
const BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

const REQUIRED_IDS = [
	'self-hosted-fleet',
	'public-status-page',
	'stripe-live-checkout',
	'automated-tests',
	'cert-aws-saa',
	'cert-python',
	'cert-log-admin',
	'day-job-global-automation',
	'docs-site',
	'qnix-design-docs',
	'linkedin'
];

/** Hosts a claim may point at. Anything else is not a verifier we control or
 *  that a reader can meaningfully check against this business. */
const ALLOWED_HOSTS = [
	'starhold.dev',
	'www.starhold.dev',
	'starhold.fyi',
	'status.starhold.fyi',
	'starhold.app',
	'shushgame.com',
	'github.com',
	'linkedin.com',
	'www.linkedin.com',
	'stripe.com',
	'discord.com'
];

function verifierOk(v: string): string | null {
	if (/^https?:\/\//.test(v)) {
		const host = new URL(v).host;
		return ALLOWED_HOSTS.includes(host) ? null : `host not allowlisted: ${host}`;
	}
	return existsSync(join(REPO_ROOT, v)) ? null : `repo path missing: ${v}`;
}

/** Evidence ids actually referenced by shipping code: static attributes plus
 *  every `evidence:` value in the copy module. */
const USED = new Set<string>([
	...collectEvidenceRefs({
		home: copy.home,
		work: copy.work,
		principles: copy.principles,
		operator: copy.operator,
		customBots: copy.customBots,
		qnix: copy.qnix,
		shushgame: copy.shushgame
	}),
	...srcFiles(['.svelte']).flatMap((f) =>
		[...readFileSync(f, 'utf8').matchAll(/data-evidence\s*=\s*"([^"{}]+)"/g)].map((m) => m[1])
	)
]);

describe('A3 · anti-fabrication', () => {
	it('A3.1 the registry covers every required proof id', () => {
		expect(REQUIRED_IDS.filter((id) => !BY_ID.has(id))).toEqual([]);
	});

	it('A3.2 every item has a unique kebab id, a short claim, a status, a verifier', () => {
		expect(ITEMS.length).toBe(new Set(ITEMS.map((i) => i.id)).size);
		for (const i of ITEMS) {
			expect(i.id, `${i.id} is not kebab-case`).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
			expect(i.claim.length, `${i.id} claim too long`).toBeLessThanOrEqual(160);
			expect(i.claim.length, `${i.id} claim empty`).toBeGreaterThan(0);
			expect(['verified', 'pending'], `${i.id} status`).toContain(i.status);
			expect(i.verifier, `${i.id} verifier`).toBeTruthy();
		}
	});

	it('A3.3 every verifier is an allowlisted host or a path that exists', () => {
		const problems: string[] = [];
		for (const i of ITEMS) {
			const bad = verifierOk(i.verifier);
			if (bad) problems.push(`${i.id}: ${bad}`);
			for (const s of i.sources ?? []) {
				const badSource = verifierOk(s);
				if (badSource) problems.push(`${i.id} source: ${badSource}`);
			}
		}
		expect(problems).toEqual([]);
	});

	it('A3.4 every evidence reference resolves to a registry item', () => {
		expect([...USED].filter((id) => !BY_ID.has(id))).toEqual([]);
		expect(USED.size).toBeGreaterThanOrEqual(8);
	});

	it('A3.5 no pending claim ships', () => {
		const pendingShipped = [...USED].filter((id) => BY_ID.get(id)?.status !== 'verified');
		expect(pendingShipped).toEqual([]);
		// and the registry really does carry at least one pending row, so this
		// rule is exercised rather than vacuously true
		expect(ITEMS.some((i) => i.status === 'pending')).toBe(true);
	});

	it('A3.6 no employer is named and no entity suffix appears on a marketing surface', () => {
		const surface = [
			collectStrings({
				home: copy.home,
				capabilities: copy.capabilities,
				work: copy.work,
				principles: copy.principles,
				operator: copy.operator,
				contact: copy.contact,
				automation: copy.automation,
				customBots: copy.customBots,
				qnix: copy.qnix,
				shushgame: copy.shushgame,
				site: copy.site
			}).join('\n'),
			ITEMS.map((i) => i.claim).join('\n')
		].join('\n');
		expect(findTerms(surface, BANNED_ENTITY_SUFFIX)).toEqual([]);
		// the day-job row states the withholding explicitly
		expect(BY_ID.get('day-job-global-automation')!.claim).toMatch(/not named|unnamed|withheld/i);
	});

	it('A3.7 stats.json matches the recomputed test counts', () => {
		const fresh = computeStats();
		expect({
			unitTestFiles: stats.unitTestFiles,
			unitTests: stats.unitTests,
			e2eSpecFiles: stats.e2eSpecFiles,
			e2eTests: stats.e2eTests,
			totalTests: stats.totalTests
		}).toEqual(fresh);
	});

	it('A3.8 the only bare number allowed in marketing copy is the founding year', () => {
		const derived = new Set(
			[stats.unitTests, stats.e2eTests, stats.unitTestFiles, stats.e2eSpecFiles, stats.totalTests, copy.site.foundedYear].map(String)
		);
		const strings = collectStrings({
			home: copy.home,
			capabilities: copy.capabilities,
			work: copy.work,
			principles: copy.principles,
			operator: copy.operator,
			contact: copy.contact,
			automation: copy.automation,
			customBots: copy.customBots,
			qnix: copy.qnix,
			shushgame: copy.shushgame
		}).join('\n');
		const numbers = (strings.match(/\d+/g) ?? []).filter((n) => !derived.has(n));
		expect(numbers).toEqual([]);
	});
});
