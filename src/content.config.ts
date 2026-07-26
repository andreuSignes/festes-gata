import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { eventSchema, daySchema } from './content/schema';

export { eventSchema, daySchema };

// v1: single Spanish collection
// v2 (this change): split into days-es and days-ca parallel collections
const daysEs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days/es' }),
  schema: daySchema,
});

const daysCa = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/days/ca' }),
  schema: daySchema,
});

export const collections = { 'days-es': daysEs, 'days-ca': daysCa };
