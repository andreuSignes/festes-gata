import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const eventSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  title: z.string(),
  location: z.string().optional(),
  description: z.string().optional(),
  sponsor: z.string().optional(),
  type: z.enum([
    'pasacalles',
    'bous',
    'verbena',
    'musica',
    'liturgia',
    'infantil',
    'paelles',
    'festes',
    'otro',
  ]),
  tags: z.array(z.string()).optional(),
});

const daySchema = z.object({
  date: z.string().date(),
  weekday: z.string(),
  theme: z.string().nullable().optional(),
  events: z.array(eventSchema),
});

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
