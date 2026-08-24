import { defineConfig } from '@playwright/test';

// Port is overridable so two checkouts of this repo can run e2e at the same time
// without silently testing each other's server. Default is unchanged.
const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: 'e2e',
	use: { baseURL: BASE },
	webServer: {
		// production build via adapter-node — same artifact the production host runs
		command: 'npm run build && node build',
		port: PORT,
		timeout: 120_000, // cold adapter-node build can exceed the 60s default
		reuseExistingServer: !process.env.CI,
		env: { ...(process.env as Record<string, string>), PORT: String(PORT), ORIGIN: BASE }
	}
});
