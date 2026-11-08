import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/// <reference types="vitest" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({ preprocess: vitePreprocess(), adapter: adapter() })
	],
	// e2e/*.spec.ts belongs to Playwright — keep Vitest scoped to unit tests
	test: { include: ['src/**/*.test.ts'] }
} as Parameters<typeof defineConfig>[0]);
