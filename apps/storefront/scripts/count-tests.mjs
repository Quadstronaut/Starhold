// Shared test counter.
//
// Used twice, on purpose: once by scripts/gen-stats.mjs to WRITE
// src/lib/content/stats.json, and once by src/acceptance/a3-evidence.test.ts to
// RECOMPUTE it and fail if the committed file has drifted. A number on the
// marketing site is only allowed to exist if it can be re-derived from source.
//
// Counts are RUNTIME tests, as the test runners themselves report them, not
// source declarations. A regex over `it(` undercounts parametrised cases
// (`it.each`, loops that call `test()` per row); the runners expand those.
//   - Vitest:     `vitest run --reporter=json`  -> numTotalTests (skipped/todo excluded)
//   - Playwright: `playwright test --list --reporter=json` (skipped excluded)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

/** Run a package's JS entry point under the current node (no shell, no npx, cross-platform). */
function runNode(appRoot, entry, args) {
	const script = join(appRoot, 'node_modules', entry);
	if (!existsSync(script)) throw new Error(`${entry} not found; run npm ci first`);
	return spawnSync(process.execPath, [script, ...args], {
		cwd: appRoot,
		encoding: 'utf8',
		maxBuffer: 256 * 1024 * 1024
	});
}

/**
 * Vitest tests via the JSON reporter. This EXECUTES the unit suite, so it must
 * not be called from inside a unit test (it would recurse); tests use
 * vitestListCount() instead. A non-zero exit is expected when tests fail (for
 * example the A3.7 staleness test while stats.json is being regenerated), so
 * the exit code is ignored and only the report is trusted.
 */
export function vitestRunCount(appRoot = APP_ROOT) {
	const dir = mkdtempSync(join(tmpdir(), 'stats-vitest-'));
	const outFile = join(dir, 'report.json');
	try {
		runNode(appRoot, join('vitest', 'vitest.mjs'), ['run', '--reporter=json', `--outputFile=${outFile}`]);
		if (!existsSync(outFile)) throw new Error('vitest produced no JSON report');
		const r = JSON.parse(readFileSync(outFile, 'utf8'));
		return {
			// Same definition as vitestListCount: a file counts only if it has a test
			// that is not skipped/pending/todo.
			files: r.testResults.filter((f) =>
				(f.assertionResults ?? []).some((t) => t.status !== 'pending' && t.status !== 'skipped' && t.status !== 'todo')
			).length,
			tests: r.numTotalTests - r.numPendingTests - r.numTodoTests
		};
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

/**
 * Vitest tests via `vitest list --json`: collects and expands every test
 * (including each `it.each` row) without running any, so it is safe to call
 * from inside a test. It cannot see skip/todo state, so gen-stats checks it
 * against vitestRunCount() and refuses to write if the two disagree.
 */
export function vitestListCount(appRoot = APP_ROOT) {
	const res = runNode(appRoot, join('vitest', 'vitest.mjs'), ['list', '--json']);
	if (res.status !== 0) throw new Error(`vitest list failed:\n${res.stderr}`);
	const rows = JSON.parse(res.stdout);
	return { files: new Set(rows.map((t) => t.file)).size, tests: rows.length };
}

/**
 * Playwright tests via `--list` (does not start the web server or run a browser). Known, accepted limit: --list cannot see
 * env-conditional skips such as `test.skip(!process.env.STRIPE_SECRET_KEY)` in
 * e2e/smoke.spec.ts. Those tests are counted (they run when credentials are set),
 * so a CI run without Stripe credentials reports 1 skipped of the published total.
 */
export function playwrightCount(appRoot = APP_ROOT) {
	const res = runNode(appRoot, join('@playwright', 'test', 'cli.js'), ['test', '--list', '--reporter=json']);
	if (res.status !== 0) throw new Error(`playwright --list failed:\n${res.stderr}`);
	const report = JSON.parse(res.stdout);
	const files = new Set();
	let tests = 0;
	const visit = (suite) => {
		for (const spec of suite.specs ?? []) {
			for (const t of spec.tests ?? []) {
				// In --list mode every test reports status "skipped"; expectedStatus is
				// what distinguishes a declared test.skip / test.fixme.
				if (t.expectedStatus === 'skipped') continue;
				tests++;
				files.add(spec.file);
			}
		}
		for (const child of suite.suites ?? []) visit(child);
	};
	for (const s of report.suites ?? []) visit(s);
	return { files: files.size, tests };
}

/**
 * Recompute every number that stats.json publishes.
 * @param {{ unitSource?: 'list' | 'run' }} [opts] 'list' (default) is safe inside
 *   a unit test; 'run' is what gen-stats uses to write the file.
 */
export function computeStats({ unitSource = 'list', appRoot = APP_ROOT } = {}) {
	const unit = unitSource === 'run' ? vitestRunCount(appRoot) : vitestListCount(appRoot);
	const e2e = playwrightCount(appRoot);
	return {
		unitTestFiles: unit.files,
		unitTests: unit.tests,
		e2eSpecFiles: e2e.files,
		e2eTests: e2e.tests,
		totalTests: unit.tests + e2e.tests
	};
}
