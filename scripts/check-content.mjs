#!/usr/bin/env node
/**
 * Walk src/content/days/{ca,es} and assert parity.
 *
 *   1. Same set of dates.
 *   2. Same event count per date.
 *   3. Same time order per date.
 *   4. Per-event shape: time matches HH:MM, title non-empty, type in enum,
 *      optional location/description/sponsor/tags when present.
 *   5. Day shape: date matches filename, weekday non-empty, theme string|null.
 *
 * Exits non-zero on any mismatch. Prints a one-line summary on success.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DAYS_DIR = join(ROOT, 'src', 'content', 'days');
const LOCALES = ['ca', 'es'];
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
const notes = [];

function fail(msg) {
  console.error(`✗ ${msg}`);
  exitCode = 1;
}

function note(msg) {
  notes.push(msg);
  console.warn(`! ${msg}`);
}

function listDates(locale) {
  const dir = join(DAYS_DIR, locale);
  const out = [];
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    if (!DATE_RE.test(basename(name, '.json'))) continue;
    out.push(basename(name, '.json'));
  }
  out.sort();
  return out;
}

function readDay(locale, date) {
  const path = join(DAYS_DIR, locale, `${date}.json`);
  const raw = readFileSync(path, 'utf8');
  return { path, data: JSON.parse(raw) };
}

function validateDay(locale, date, day) {
  const errors = [];
  const fileDate = `${date}.json`;
  if (day.date !== date) {
    errors.push(`date field "${day.date}" does not match filename "${fileDate}"`);
  }
  if (typeof day.weekday !== 'string' || day.weekday.length === 0) {
    errors.push('weekday is empty or missing');
  }
  if (day.theme !== null && day.theme !== undefined && typeof day.theme !== 'string') {
    errors.push('theme must be a string or null');
  }
  if (!Array.isArray(day.events)) {
    errors.push('events is not an array');
    return errors;
  }
  for (const [i, ev] of day.events.entries()) {
    if (typeof ev.time !== 'string' || !TIME_RE.test(ev.time)) {
      errors.push(`events[${i}].time "${ev.time}" does not match HH:MM`);
    }
    if (typeof ev.title !== 'string' || ev.title.length === 0) {
      errors.push(`events[${i}].title is empty`);
    }
    if (ev.location !== undefined && typeof ev.location !== 'string') {
      errors.push(`events[${i}].location must be a string when present`);
    }
    if (ev.description !== undefined && typeof ev.description !== 'string') {
      errors.push(`events[${i}].description must be a string when present`);
    }
    if (ev.sponsor !== undefined && typeof ev.sponsor !== 'string') {
      errors.push(`events[${i}].sponsor must be a string when present`);
    }
    if (ev.tags !== undefined) {
      if (!Array.isArray(ev.tags) || ev.tags.some((t) => typeof t !== 'string')) {
        errors.push(`events[${i}].tags must be a string array when present`);
      }
    }
    if (!TYPES.has(ev.type)) {
      errors.push(`events[${i}].type "${ev.type}" is not one of ${[...TYPES].join(', ')}`);
    }
  }
  if (errors.length) {
    fail(`${locale}/${fileDate}: ${errors.join('; ')}`);
  }
  return errors;
}

function times(day) {
  return day.events.map((e) => e.time);
}

function main() {
  const byLocale = {};
  for (const locale of LOCALES) {
    const dir = join(DAYS_DIR, locale);
    if (!statSync(dir, { throwIfNoEntry: false })) {
      fail(`directory missing: ${dir}`);
      continue;
    }
    byLocale[locale] = listDates(locale);
  }

  if (exitCode !== 0) return finish();

  const [a, b] = LOCALES;
  if (byLocale[a].length !== byLocale[b].length) {
    fail(`date count mismatch: ${a}=${byLocale[a].length} ${b}=${byLocale[b].length}`);
  }

  const setA = new Set(byLocale[a]);
  const setB = new Set(byLocale[b]);
  for (const d of byLocale[a]) {
    if (!setB.has(d)) fail(`date ${d} present in ${a} but missing in ${b}`);
  }
  for (const d of byLocale[b]) {
    if (!setA.has(d)) fail(`date ${d} present in ${b} but missing in ${a}`);
  }

  for (const date of byLocale[a]) {
    const dayA = readDay(a, date);
    const dayB = readDay(b, date);
    validateDay(a, date, dayA.data);
    validateDay(b, date, dayB.data);
    if (dayA.data.events.length !== dayB.data.events.length) {
      fail(`event count mismatch for ${date}: ${a}=${dayA.data.events.length} ${b}=${dayB.data.events.length}`);
    } else {
      const ta = times(dayA.data);
      const tb = times(dayB.data);
      if (ta.join(',') !== tb.join(',')) {
        fail(`time order mismatch for ${date}: ${a}=[${ta}] ${b}=[${tb}]`);
      }
    }
  }

  return finish();
}

function finish() {
  if (exitCode === 0) {
    const total = LOCALES.length * (byLocale?.[LOCALES[0]]?.length ?? 0);
    let events = 0;
    for (const locale of LOCALES) {
      for (const date of byLocale[locale]) {
        events += readDay(locale, date).data.events.length;
      }
    }
    const noteTxt = notes.length ? `, ${notes.length} notes` : '';
    console.log(`OK ${total / LOCALES.length} dates × ${LOCALES.length} locales, ${events} events${noteTxt}`);
  }
  process.exit(exitCode);
}

main();
