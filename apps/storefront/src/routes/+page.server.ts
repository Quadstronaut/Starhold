import { loadHero } from '#lib/server/hero-load.js';
import type { PageServerLoad } from './$types';

// STAR-166 hero pool: one entry per load, picked on the server (see lib/server/hero-load.ts).
export const load: PageServerLoad = ({ url }) => loadHero(url);
