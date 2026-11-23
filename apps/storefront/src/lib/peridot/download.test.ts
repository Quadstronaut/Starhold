// PERI-15: the download + official-sources section is built but OFF.
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import { readFileSync } from 'node:fs';
import Page from '../../routes/peridot/+page.svelte';
import Download from './PeridotDownload.svelte';
import { PERIDOT_DOWNLOAD_ENABLED, PERIDOT_CERT_SHA256, PERIDOT_RELEASE, PERIDOT_OTHER_SOURCES, PERIDOT_PLAY_URL } from './page-content';

const norm = (s: string) => s.replace(/\r\n/g, '\n');
const strip = (s: string) => s.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ');
const dl = render(Download);
const dlText = strip(dl.body).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('PERI-15 flag OFF leaves /peridot unchanged', () => {
	it('the flag is false', () => {
		expect(PERIDOT_DOWNLOAD_ENABLED).toBe(false);
	});

	it('page output equals the output captured before PERI-15 (comment markers and whitespace aside)', () => {
		const r = render(Page);
		const now = norm(r.head + '\n=====\n' + r.body);
		const before = norm(readFileSync(new URL('./fixtures/peridot-page-before-peri-15.html', import.meta.url), 'utf8'));
		expect(strip(now)).toBe(strip(before));
	});

	it('none of the new section appears on the page', () => {
		const t = render(Page).body;
		for (const w of ['Official sources', 'Signing certificate', PERIDOT_CERT_SHA256, 'Get-FileHash']) expect(t).not.toContain(w);
	});
});

describe('PERI-15 section content (rendered directly)', () => {
	it('shows the certificate fingerprint and how to verify', () => {
		expect(dlText).toContain('Official sources');
		expect(dl.body).toContain(PERIDOT_CERT_SHA256);
		expect(dlText).toContain('Get-FileHash');
		expect(dlText).toContain('sha256sum');
		expect(dlText).toContain('apksigner verify --print-certs');
	});

	it('carries the Play listing privacy and not-a-medical-device wording', () => {
		expect(dlText).toContain('Peridot is not a medical device and does not give medical advice, diagnosis or treatment.');
		expect(dlText).toContain('Do not rely on Peridot for contraception.');
		expect(dlText).toContain('your cycle data never leaves your phone');
		expect(dlText).toContain('no analytics and no crash reporting');
	});

	it('says no download exists yet while the release is unset, lists no store links, shows no image', () => {
		expect(dlText).toContain('The direct download is not available yet.');
		expect(dl.body).not.toMatch(/<(img|script|form|iframe|link|style)\b/i);
		expect(dl.body).not.toMatch(/\.(png|jpg|svg|webp|ico)/i);
		expect(dl.body.match(/<a\b/g) ?? []).toHaveLength(0);
	});

	it('uses no em dash or exclamation mark', () => {
		expect(dlText).not.toMatch(/[—!]/);
	});
});

describe('PERI-15 the flag cannot go on half-filled', () => {
	it('the certificate fingerprint is 32 hex pairs starting 91:1E:4D:E3', () => {
		expect(PERIDOT_CERT_SHA256.split(':')).toHaveLength(32);
		expect(PERIDOT_CERT_SHA256.startsWith('91:1E:4D:E3')).toBe(true);
	});

	it('if enabled: a release with an https url and a 64-hex checksum is set', () => {
		if (!PERIDOT_DOWNLOAD_ENABLED) return;
		expect(PERIDOT_RELEASE).not.toBeNull();
		expect(PERIDOT_RELEASE!.apkUrl).toMatch(/^https:\/\//);
		expect(PERIDOT_RELEASE!.apkSha256).toMatch(/^[0-9a-f]{64}$/);
		expect(PERIDOT_RELEASE!.apkFileName).toBe(`peridot-${PERIDOT_RELEASE!.version}-${PERIDOT_RELEASE!.build}.apk`);
	});

	it('every listed other source is https', () => {
		for (const u of [PERIDOT_PLAY_URL, ...Object.values(PERIDOT_OTHER_SOURCES)]) if (u) expect(u).toMatch(/^(https:\/\/|obtainium:\/\/)/);
	});
});
