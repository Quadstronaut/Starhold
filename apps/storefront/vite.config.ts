import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// STAR-299: small per-component stylesheets (hero, product card, wordmark) are inlined into the
		// page instead of being fetched one by one, which keeps first paint inside its request budget
		// (e2e B5.6). The two big sheets (site and page) stay as cacheable files.
		sveltekit({ preprocess: vitePreprocess(), adapter: adapter(), inlineStyleThreshold: 4096 })
	],
	// e2e/*.spec.ts belongs to Playwright — keep Vitest scoped to unit tests
	test: { include: ['src/**/*.test.ts'] }
} as Parameters<typeof defineConfig>[0]);
