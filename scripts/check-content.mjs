#!/usr/bin/env node
/**
 * Walk src/content/days/es and validate.
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

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DAYS_DIR = join(ROOT, 'src', 'content', 'days', 'es');
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = new Set([
  'pasacalles',
  'bous',
  'verbena',
  'musica',
  'liturgia',
  'infantil',
  'paelles',
  'festes',
  'otro',
]);

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
  const errors = [];
  if (day.date !== date) errors.push(`date ${day.date} != filename ${date}`);
  if (typeof day.weekday !== 'string' || day.weekday.length === 0) errors.push('weekday empty');
  if (day.theme !== null && day.theme !== undefined && typeof day.theme !== 'string')
    errors.push('theme must be string|null');
  if (!Array.isArray(day.events)) return errors.concat('events is not an array');
  day.events.forEach((ev, i) => {
    if (typeof ev.time !== 'string' || !TIME_RE.test(ev.time))
      errors.push(`events[${i}].time "${ev.time}"`);
    if (typeof ev.title !== 'string' || ev.title.length === 0)
      errors.push(`events[${i}].title empty`);
    if (ev.location !== undefined && typeof ev.location !== 'string')
      errors.push(`events[${i}].location`);
    if (ev.description !== undefined && typeof ev.description !== 'string')
      errors.push(`events[${i}].description`);
    if (ev.sponsor !== undefined && typeof ev.sponsor !== 'string')
      errors.push(`events[${i}].sponsor`);
    if (
      ev.tags !== undefined &&
      (!Array.isArray(ev.tags) || ev.tags.some((t) => typeof t !== 'string'))
    )
      errors.push(`events[${i}].tags`);
    if (!TYPES.has(ev.type)) errors.push(`events[${i}}.type "${ev.type}"`);
  });
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
