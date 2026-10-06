// Regenerates src/lib/content/stats.json from the test suite.
//
// Run it LAST, after tests are added or removed:  npm run stats
// Counts are runtime tests as Vitest and Playwright report them (see
// count-tests.mjs). The acceptance suite recomputes the same numbers and fails
// on drift, so a stale stats.json is a red test rather than a quiet lie on the
// home page.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_ROOT, computeStats, vitestListCount } from './count-tests.mjs';

const out = join(APP_ROOT, 'src', 'lib', 'content', 'stats.json');
const counted = computeStats({ unitSource: 'run' });

// The acceptance check counts with `vitest list` (it cannot execute the suite
// from inside itself). If skipped/todo unit tests make the two disagree, the
// check would flag a freshly written file as stale, so stop here instead.
// Static it.skip / it.todo do not trigger this (list already excludes them);
// it catches runtime skips such as ctx.skip() inside a test body.
const listed = vitestListCount();
if (listed.tests !== counted.unitTests || listed.files !== counted.unitTestFiles) {
	console.error(
		`unit counts differ between run (${counted.unitTestFiles} files, ${counted.unitTests} tests) and list (${listed.files} files, ${listed.tests} tests); ` +
			'a runtime skip (e.g. ctx.skip() inside a test body) is likely present. Remove it or teach count-tests.mjs about it.'
	);
	process.exit(1);
}

const stats = {
	_generated: 'scripts/gen-stats.mjs — do not hand-edit; run `npm run stats`',
	...counted
};

writeFileSync(out, JSON.stringify(stats, null, '\t') + '\n');
console.log(`wrote ${out}`, stats);
