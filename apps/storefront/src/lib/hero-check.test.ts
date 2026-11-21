// STAR-310 item 1: the home hero's domain box. A plain GET form to Zenithmark that works without JavaScript,
// adds no script, and says in one plain paragraph what happens when the button is pressed.
import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import HomePage from '../routes/+page.svelte';
import { home } from './content/copy';
import { read } from '../acceptance/_helpers';

const { body } = render(HomePage, { props: { data: { hero: 'opus' } } });

function heroForm(html: string): string {
	const m = html.match(/<form\b[^>]*data-testid="hero-check"[\s\S]*?<\/form>/);
	expect(m, 'hero form missing').toBeTruthy();
	return m![0];
}
const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

describe('STAR-310 hero domain check', () => {
	const form = heroForm(body);
	const formTag = form.match(/<form\b[^>]*>/)![0];
	const input = form.match(/<input\b[^>]*>/)![0];

	it('submits a GET to the Zenithmark landing page with the field the landing reads', () => {
		expect(attr(formTag, 'method')).toBe('get');
		expect(attr(formTag, 'action')).toBe('https://domainscanner.starhold.app/');
		expect(attr(input, 'name')).toBe('domain');
		expect([...form.matchAll(/<input\b/g)]).toHaveLength(1); // one field
		expect([...form.matchAll(/<button\b[^>]*type="submit"/g)]).toHaveLength(1); // one button
	});

	it('sits in the hero, before the existing buttons and before the proof strip', () => {
		const hero = body.indexOf('class="hero');
		const at = body.indexOf('data-testid="hero-check"');
		expect(hero).toBeGreaterThanOrEqual(0);
		expect(at).toBeGreaterThan(body.indexOf('<h1'));
		expect(at).toBeLessThan(body.indexOf('data-testid="cta-primary"'));
		expect(at).toBeLessThan(body.indexOf('class="proof'));
	});

	it('validates in the browser with HTML attributes only', () => {
		expect(attr(input, 'type')).toBe('text');
		expect(attr(input, 'inputmode')).toBe('url');
		expect(attr(input, 'autocapitalize')).toBe('off');
		expect(attr(input, 'autocomplete')).toBe('off');
		expect(attr(input, 'spellcheck')).toBe('false');
		expect(input).toMatch(/\srequired(=""|\s|\/|>)/);
		const pattern = new RegExp(`^(?:${attr(input, 'pattern')})$`, 'v');
		for (const ok of ['example.com', ' example.com ', 'https://example.com/path', 'bücher.example', 'xn--bcher-kva.example'])
			expect(pattern.test(ok), ok).toBe(true);
		for (const bad of ['example', 'two words.com', ''])
			expect(pattern.test(bad), bad).toBe(false);
	});

	it('is accessible: a real label, a described-by note, the example as placeholder', () => {
		const id = attr(input, 'id')!;
		expect(form).toMatch(new RegExp(`<label for="${id}"[^>]*>${home.heroCheck.label}</label>`));
		const note = attr(input, 'aria-describedby')!;
		expect(form).toMatch(new RegExp(`<p id="${note}"[^>]*>`));
		expect(attr(input, 'placeholder')).toBe('example.com');
	});

	it('pins the copy, word for word', () => {
		expect(home.heroCheck.label).toBe('Type a domain, get a grade');
		expect(home.heroCheck.button).toBe('Get a grade');
		expect(home.heroCheck.note).toBe(
			'Free, no account needed. This opens Zenithmark, my domain checker, with the domain filled in. Press Scan there, pass a short bot check, and get a letter grade for the domain’s public email and DNS settings.'
		);
		expect(form).toContain('Get a grade');
		expect(form).toContain('my domain checker');
	});

	it('adds no script: the component has none and the home page still emits only its own two', () => {
		const component = read('src/lib/components/HeroDomainCheck.svelte');
		expect([...component.matchAll(/<script\b[^>]*>/g)].map((m) => m[0])).toEqual(['<script lang="ts">']);
		expect(form).not.toMatch(/<script|\son[a-z]+=|turnstile|cloudflare/i);
	});
});
