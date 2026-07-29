import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { daySchema } from '../src/content/schema';

const CONTENT_DIR = join(__dirname, '../src/content/days');
const LOCALES = ['ca', 'es'] as const;

const VALID_EVENT_TYPES = [
  'pasacalles',
  'bous',
  'verbena',
  'musica',
  'liturgia',
  'infantil',
  'comida',
  'festes',
  'pirotecnia',
] as const;

describe('content-schema', () => {
  const jsonFilesByLocale = LOCALES.map((locale) => ({
    locale,
    files: readdirSync(join(CONTENT_DIR, locale)).filter((f) => f.endsWith('.json')),
  }));

  it('should have the same number of day files in ca and es', () => {
    expect(jsonFilesByLocale[0].files.length).toBe(jsonFilesByLocale[1].files.length);
  });

  it('should have filename sets in sync across ca and es', () => {
    const caSet = new Set(jsonFilesByLocale[0].files);
    const esSet = new Set(jsonFilesByLocale[1].files);
    for (const file of caSet) {
      expect(esSet.has(file), `${file} is in ca but missing from es`).toBe(true);
    }
    for (const file of esSet) {
      expect(caSet.has(file), `${file} is in es but missing from ca`).toBe(true);
    }
  });

  it('should validate every day file across both locales', () => {
    let totalEvents = 0;
    const validatedDays: string[] = [];

    for (const { locale, files } of jsonFilesByLocale) {
      for (const file of files) {
        const filePath = join(CONTENT_DIR, locale, file);
        const raw = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        const result = daySchema.safeParse(data);
        expect(
          result.success,
          `Failed to parse ${locale}/${file}: ${JSON.stringify(result.error?.issues ?? result.error)}`
        ).toBe(true);

        if (result.success) {
          totalEvents += result.data.events.length;
          validatedDays.push(`${locale}:${result.data.date}`);
        }
      }
    }

    expect(totalEvents).toBeGreaterThan(0);
    expect(validatedDays.length).toBeGreaterThan(0);
  });

  it('should have filename date equal to JSON date field for every file', () => {
    for (const { locale, files } of jsonFilesByLocale) {
      for (const file of files) {
        const filePath = join(CONTENT_DIR, locale, file);
        const raw = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        const filenameDate = file.replace('.json', '');

        expect(data.date, `${locale}/${file}: date field should match filename`).toBe(filenameDate);
      }
    }
  });

  it('should have valid event types for all events across every file', () => {
    for (const { locale, files } of jsonFilesByLocale) {
      for (const file of files) {
        const filePath = join(CONTENT_DIR, locale, file);
        const raw = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);

        const events = data.events;
        for (let i = 0; i < events.length; i++) {
          const event = events[i];
          expect(
            VALID_EVENT_TYPES.includes(event.type),
            `${locale}/${file}: event at index ${i} has invalid type "${event.type}"`
          ).toBe(true);
        }
      }
    }
  });
});
