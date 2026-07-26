import { z } from 'zod';

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
    'paelles',
    'festes',
    'otro',
  ]),
  tags: z.array(z.string()).optional(),
});

export const daySchema = z.object({
  date: z.string().date(),
  weekday: z.string(),
  theme: z.string().nullable().optional(),
  events: z.array(eventSchema),
});

export type Event = z.infer<typeof eventSchema>;
export type Day = z.infer<typeof daySchema>;
export type DayProgram = z.infer<typeof daySchema>;
