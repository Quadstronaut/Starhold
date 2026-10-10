import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
	// UI string overrides (src/content/i18n/en.json). Used to give Starlight's
	// sidebar toggle its own accessible name, distinct from the fleet "Menu".
	i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};