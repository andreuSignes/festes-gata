import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { daySchema } from '../src/content/schema';
import { EVENT_TYPES } from '../src/lib/event-types';
import { LOCALES } from '../src/lib/locale';

const CONTENT_DIR = join(__dirname, '../src/content/days');

type DayEntry = {
  date: string;
  events: { time: string; type: string }[];
};

describe('content-schema', () => {
  const jsonFilesByLocale = LOCALES.map((locale) => ({
    locale,
    files: readdirSync(join(CONTENT_DIR, locale)).filter((f) => f.endsWith('.json')),
  }));
  const [caFiles, esFiles] = jsonFilesByLocale;
  if (!caFiles || !esFiles) {
    throw new Error('Expected exactly two locales (ca, es)');
  }

  it('should have the same number of day files in ca and es', () => {
    expect(caFiles.files.length).toBe(esFiles.files.length);
  });

  it('should have filename sets in sync across ca and es', () => {
    const caSet = new Set(caFiles.files);
    const esSet = new Set(esFiles.files);
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

  it('should have parity between ca and es (same dates, same event counts and times)', () => {
    // Locale parity beyond file existence: every day must have the same
    // event count and the same event times in both locales (titles,
    // descriptions, and locations differ).
    const caSet = new Set(caFiles.files);
    const esSet = new Set(esFiles.files);
    const sharedFiles = [...caSet].filter((f) => esSet.has(f)).sort();

    for (const file of sharedFiles) {
      const caData = JSON.parse(readFileSync(join(CONTENT_DIR, 'ca', file), 'utf-8')) as DayEntry;
      const esData = JSON.parse(readFileSync(join(CONTENT_DIR, 'es', file), 'utf-8')) as DayEntry;

      expect(caData.events.length, `${file}: ca/es event count mismatch`).toBe(
        esData.events.length
      );
      expect(
        caData.events.map((e) => e.time),
        `${file}: ca/es event times must match`
      ).toEqual(esData.events.map((e) => e.time));
    }
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
            (EVENT_TYPES as readonly string[]).includes(event.type),
            `${locale}/${file}: event at index ${i} has invalid type "${event.type}"`
          ).toBe(true);
        }
      }
    }
  });
});
