#!/usr/bin/env node
/**
 * Walk src/content/days/es and validate using validateProgram().
 *  1. Filename is YYYY-MM-DD.json.
 *  2. Day.date matches filename.
 *  3. weekday is non-empty.
 *  4. theme is string|null.
 *  5. Each event has time HH:MM, non-empty title, type in enum.
 *  6. Optional location/description/sponsor are strings when present.
 *  7. tags is a string array when present.
 * Exits non-zero on any mismatch.
 */

/* eslint-disable no-console -- CLI tool: console.error reports validation failures, console.log prints the final OK summary. */

import { readFileSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProgram } from '../src/scripts/validate-content.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DAYS_DIR = join(ROOT, 'src', 'content', 'days', 'es');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

let exitCode = 0;
let eventCount = 0;

function fail(msg) {
  console.error(`✗ ${msg}`);
  exitCode = 1;
}

function readDay(date) {
  const path = join(DAYS_DIR, `${date}.json`);
  return { path, data: JSON.parse(readFileSync(path, 'utf8')) };
}

function validate(date, day) {
  // Delegate filename-date match and event structure to validateProgram()
  const filename = `${date}.json`;
  const result = validateProgram(filename, day);

  if (!result.valid) {
    fail(`${date}.json: ${result.name} — ${result.message}`);
    return;
  }

  // Additional checks not covered by validateProgram()
  const errors = [];
  if (typeof day.weekday !== 'string' || day.weekday.length === 0) errors.push('weekday empty');
  if (day.theme !== null && day.theme !== undefined && typeof day.theme !== 'string')
    errors.push('theme must be string|null');

  eventCount += day.events.length;
  if (errors.length) fail(`${date}.json: ${errors.join('; ')}`);
}

const dates = readdirSync(DAYS_DIR)
  .filter((n) => n.endsWith('.json'))
  .map((n) => basename(n, '.json'))
  .filter((n) => DATE_RE.test(n))
  .sort();

for (const date of dates) {
  const { data } = readDay(date);
  validate(date, data);
}

if (exitCode === 0) {
  console.log(`OK ${dates.length} dates, ${eventCount} events`);
}
process.exit(exitCode);
