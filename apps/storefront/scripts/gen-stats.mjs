// Regenerates src/lib/content/stats.json from the test suite.
//
// Run it LAST, after tests are added or removed:  npm run stats
// The acceptance suite recomputes the same numbers and fails on drift, so a
// stale stats.json is a red test rather than a quiet lie on the home page.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { APP_ROOT, computeStats } from './count-tests.mjs';

const out = join(APP_ROOT, 'src', 'lib', 'content', 'stats.json');
const stats = {
	_generated: 'scripts/gen-stats.mjs — do not hand-edit; run `npm run stats`',
	...computeStats()
};

writeFileSync(out, JSON.stringify(stats, null, '\t') + '\n');
console.log(`wrote ${out}`, stats);
