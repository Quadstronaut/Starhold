// STAR-303: /.well-known/security.txt (RFC 9116). The file is static; this test keeps it valid and stops it
// going stale unnoticed. RFC 9116 section 2.5.5: Expires MUST be present, once, and SHOULD be under a year away.
// Renewing: bump Expires (keep it under one year), then redeploy the storefront (deploy/DEPLOY.md).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const text = readFileSync(join(__dirname, '../../static/.well-known/security.txt'), 'utf8');
const fields = text
	.split('\n')
	.filter((l) => l.trim() && !l.startsWith('#'))
	.map((l) => [l.slice(0, l.indexOf(':')), l.slice(l.indexOf(':') + 1).trim()] as const);
const all = (name: string) => fields.filter(([k]) => k === name).map(([, v]) => v);

describe('security.txt', () => {
	it('has the required Contact, with the security forward', () => {
		expect(all('Contact')).toEqual(['mailto:security@starhold.dev']);
	});
	it('has exactly one Expires, in the future and under a year away', () => {
		const e = all('Expires');
		expect(e).toHaveLength(1);
		expect(e[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
		const t = Date.parse(e[0]);
		const now = Date.now();
		expect(t).toBeGreaterThan(now);
		expect(t - now).toBeLessThan(366 * 86400_000);
	});
	it('has Preferred-Languages and an https Canonical for this host', () => {
		expect(all('Preferred-Languages')).toEqual(['en']);
		expect(all('Canonical')).toEqual(['https://starhold.dev/.well-known/security.txt']);
	});
	it('names no page that does not exist', () => {
		for (const f of ['Policy', 'Acknowledgments', 'Hiring', 'Encryption']) expect(all(f)).toEqual([]);
	});
	it('is plain ASCII with LF endings', () => {
		expect(text).not.toMatch(/\r/);
		expect(text).toMatch(/^[\x00-\x7f]*$/);
	});
});
