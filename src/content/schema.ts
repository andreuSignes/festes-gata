import { z } from 'astro:content';
import type { output } from 'zod';

export const eventSchema = z.object({
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
    'comida',
    'festes',
    'pirotecnia',
  ]),
  tags: z.array(z.string()).optional(),
});

export const daySchema = z.object({
  date: z.string().date(),
  weekday: z.string(),
  theme: z.string().nullable().optional(),
  events: z.array(eventSchema),
});

export type Event = output<typeof eventSchema>;
export type Day = output<typeof daySchema>;
export type DayProgram = output<typeof daySchema>;
