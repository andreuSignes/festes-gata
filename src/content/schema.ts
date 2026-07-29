import { z } from 'astro:content';
import type { output } from 'zod';

// String bounds — `.min(1)` rejects empty strings (UX/integrity),
// `.max(N)` caps payload size and prevents the JSON-LD `</script>`
// escape vector (see `serializeJsonLd` in `src/lib/json-ld.ts`).
// The maxes are 2x the current observed maxima so contributors have
// headroom without enabling megabyte payloads.
const TITLE_MAX = 1000;
const LOCATION_MAX = 200;
const DESCRIPTION_MAX = 2000;
const SPONSOR_MAX = 200;
const THEME_MAX = 200;
const WEEKDAY_MAX = 50;

export const eventSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  title: z.string().min(1).max(TITLE_MAX),
  location: z.string().min(1).max(LOCATION_MAX).optional(),
  description: z.string().min(1).max(DESCRIPTION_MAX).optional(),
  sponsor: z.string().min(1).max(SPONSOR_MAX).optional(),
  type: z.enum([
    'pasacalles',
    'bous',
    'verbena',
    'musica',
    'liturgia',
    'infantil',
    'comida',
    'festes',
    'pirotecnia',
  ]),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

export const daySchema = z.object({
  date: z.string().date(),
  weekday: z.string().min(1).max(WEEKDAY_MAX),
  theme: z.string().min(1).max(THEME_MAX).nullable().optional(),
  events: z.array(eventSchema).max(50),
});

export type Event = output<typeof eventSchema>;
export type Day = output<typeof daySchema>;
export type DayProgram = output<typeof daySchema>;
