// Shared test counter.
//
// Used twice, on purpose: once by scripts/gen-stats.mjs to WRITE
// src/lib/content/stats.json, and once by src/acceptance/a3-evidence.test.ts to
// RECOMPUTE it and fail if the committed file has drifted. A number on the
// marketing site is only allowed to exist if it can be re-derived from source.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const APP_ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');

// A test *declaration* is `it(` / `test(` / `it.each(` … immediately followed by
// a string or template literal (the test name). That trailing quote is what
// distinguishes a declaration from an in-body `test.skip(condition, reason)`.
const DECLARATION = /^[ \t]*(it|test)(\.[A-Za-z]+)*\s*\(\s*['"`]/gm;

function walk(dir, match, out = []) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return out;
	}
	for (const name of entries) {
		if (name === 'node_modules' || name.startsWith('.')) continue;
		const full = join(dir, name);
		if (statSync(full).isDirectory()) walk(full, match, out);
		else if (match.test(name)) out.push(full);
	}
	return out;
}

function count(files) {
	let tests = 0;
	for (const f of files) {
		const src = readFileSync(f, 'utf8');
		tests += (src.match(DECLARATION) ?? []).length;
	}
	return tests;
}

/** Recompute every number that stats.json publishes. Pure; no side effects. */
export function computeStats(appRoot = APP_ROOT) {
	const unitFiles = walk(join(appRoot, 'src'), /\.test\.ts$/).sort();
	const e2eFiles = walk(join(appRoot, 'e2e'), /\.spec\.ts$/).sort();
	return {
		unitTestFiles: unitFiles.length,
		unitTests: count(unitFiles),
		e2eSpecFiles: e2eFiles.length,
		e2eTests: count(e2eFiles),
		totalTests: count(unitFiles) + count(e2eFiles)
	};
}
