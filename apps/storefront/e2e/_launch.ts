// STAR-271: the browser specs follow the one launch switch (src/lib/launch.ts), the same way
// the pages do. Playwright builds and serves the current source, so a spec that reads the
// switch from that source always describes the build it is looking at.
//
// Rule for specs: keep the number of tests the same in both states (stats.json counts them);
// branch inside a test with pick() or `if (LAUNCHED)`, never by declaring a test conditionally.
export { LAUNCHED, pick, ACCOUNT_URL } from '../src/lib/launch';
