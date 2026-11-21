import { loadHero } from '#lib/server/hero-load.js';
import type { PageServerLoad } from './$types';

// STAR-310: same hero as every other page that has one (STAR-299). The entries are static data
// imported by the page itself.
export const load: PageServerLoad = ({ url }) => loadHero(url);
