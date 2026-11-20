import { loadHero } from '#lib/server/hero-load.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => loadHero(url);
