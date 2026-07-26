import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { daySchema } from '../src/content/schema';

const DAYS_DIR = join(__dirname, '../src/content/days/es');

const VALID_EVENT_TYPES = [
  'pasacalles',
  'bous',
  'verbena',
  'musica',
  'liturgia',
  'infantil',
  'paelles',
  'festes',
  'otro',
] as const;

describe('content-schema', () => {
  const jsonFiles = readdirSync(DAYS_DIR).filter((f) => f.endsWith('.json'));

  it('should have exactly 13 day files', () => {
    expect(jsonFiles).toHaveLength(13);
  });

  it('should validate all 13 days with exactly 80 events total', () => {
    let totalEvents = 0;
    const validatedDays: string[] = [];

    for (const file of jsonFiles) {
      const filePath = join(DAYS_DIR, file);
      const raw = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      const result = daySchema.safeParse(data);
      expect(
        result.success,
        `Failed to parse ${file}: ${JSON.stringify(result.error?.issues ?? result.error)}`
      ).toBe(true);

      if (result.success) {
        totalEvents += result.data.events.length;
        validatedDays.push(result.data.date);
      }
    }

    expect(totalEvents).toBe(80);
    expect(validatedDays).toHaveLength(13);
  });

  it('should have filename date equal to JSON date field for all 13 files', () => {
    for (const file of jsonFiles) {
      const filePath = join(DAYS_DIR, file);
      const raw = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const filenameDate = file.replace('.json', '');

      expect(data.date, `${file}: date field should match filename`).toBe(filenameDate);
    }
  });

  it('should have valid event types for all events across all 13 days', () => {
    for (const file of jsonFiles) {
      const filePath = join(DAYS_DIR, file);
      const raw = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      const events = data.events;
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        expect(
          VALID_EVENT_TYPES.includes(event.type),
          `${file}: event at index ${i} has invalid type "${event.type}"`
        ).toBe(true);
      }
    }
  });
});
