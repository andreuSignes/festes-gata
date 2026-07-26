import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { eventSchema, daySchema } from './content/schema';

export { eventSchema, daySchema };

// Single collection for v1. When v2 adds more languages, we move to
// per-locale files (e.g. days/{es,ca}/*.json) and split into `days-es`
// and `days-ca` collections, or extend the schema with a `locale` field.
const days = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days/es' }),
  schema: daySchema,
});

export const collections = { days };
