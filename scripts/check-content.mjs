#!/usr/bin/env node
/**
 * Walk src/content/days/{ca,es} and validate using validateProgram().
 *  1. Filename is YYYY-MM-DD.json.
 *  2. Day.date matches filename.
 *  3. weekday is non-empty.
 *  4. theme is string|null.
 *  5. Each event has time HH:MM, non-empty title, type in enum.
 *  6. Optional location/description/sponsor are strings when present.
 *  7. tags is a string array when present.
 * Also enforces CA/ES filename parity: every day in `ca` must exist
 * in `es` and vice versa (drift detection).
 * Exits non-zero on any mismatch.
 */

/* eslint-disable no-console -- CLI tool: console.error reports validation failures, console.log prints the final OK summary. */

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProgram } from '../src/scripts/validate-content.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LOCALES = ['ca', 'es'];
const DAYS_DIR = join(ROOT, 'src', 'content', 'days');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let exitCode = 0;
let totalEventCount = 0;

function fail(msg) {
  console.error(`✗ ${msg}`);
  exitCode = 1;
}

function readDay(locale, date) {
  const path = join(DAYS_DIR, locale, `${date}.json`);
  return { path, data: JSON.parse(readFileSync(path, 'utf8')) };
}

function validate(locale, date, day) {
  // Delegate filename-date match and event structure to validateProgram()
  const filename = `${date}.json`;
  const result = validateProgram(filename, day);

  if (!result.valid) {
    fail(`${locale}/${date}.json: ${result.name} — ${result.message}`);
    return 0;
  }

  // Additional checks not covered by validateProgram()
  const errors = [];
  if (typeof day.weekday !== 'string' || day.weekday.length === 0) errors.push('weekday empty');
  if (day.theme !== null && day.theme !== undefined && typeof day.theme !== 'string')
    errors.push('theme must be string|null');

  if (errors.length) fail(`${locale}/${date}.json: ${errors.join('; ')}`);
  return day.events.length;
}

const perLocaleDates = new Map();
for (const locale of LOCALES) {
  const dates = readdirSync(join(DAYS_DIR, locale))
    .filter((n) => n.endsWith('.json'))
    .map((n) => basename(n, '.json'))
    .filter((n) => DATE_RE.test(n))
    .sort();
  perLocaleDates.set(locale, dates);
}

// CA/ES parity drift detection.
const [firstDates, secondDates] = [...perLocaleDates.values()];
const allDates = new Set([...(firstDates ?? []), ...(secondDates ?? [])]);
for (const date of allDates) {
  for (const locale of LOCALES) {
    if (!perLocaleDates.get(locale).includes(date)) {
      fail(`locale drift: ${locale}/${date}.json missing`);
    }
  }
}

let totalDates = 0;
for (const locale of LOCALES) {
  for (const date of perLocaleDates.get(locale)) {
    const { data } = readDay(locale, date);
    totalEventCount += validate(locale, date, data);
    totalDates += 1;
  }
}

if (exitCode === 0) {
  console.log(`OK ${totalDates} day files (${LOCALES.length} locales), ${totalEventCount} events`);
}
process.exit(exitCode);
