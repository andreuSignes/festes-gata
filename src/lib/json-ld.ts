/**
 * Schema.org JSON-LD builders for the Festes de Gata 2026 site.
 *
 * Four pure functions that return Schema.org-shaped objects the
 * `BaseLayout` then serialises inside
 * `<script type="application/ld+json">` blocks via Astro's `set:html`.
 *
 * Mirrors the typed, no-side-effects pattern of
 * `src/lib/event-type-labels.ts`. The buildings were chosen to match
 * what social platforms / search engines actually render for
 * Valencià + Castellano festival sites:
 *
 *   - Landing:  `Organization` + parent `Event` (the festival)
 *   - Per-day:  per-day `Event` + `BreadcrumbList`
 *
 * The festival always lives in `Europe/Madrid` and runs Sun 26 Jul →
 * Thu 6 Aug 2026. Daylight saving is in effect throughout that
 * window (CEST = UTC+2), so `dateTimeWithOffset` hard-codes the
 * `+02:00` offset literal. No runtime TZ database needed.
 */

import type { Locale } from './event-type-labels';
import type { DayProgram } from '../content/schema';

export interface JsonLdObject {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: unknown;
}

// CEST offset during the festival window (26 Jul → 06 Aug) —
// Europe/Madrid. Hard-coded as a literal because the festival lives
// in a single calendar window when DST is always in effect.
const TIMEZONE_OFFSET = '+02:00';

// Hard-coded festival window (single-year site).
const FESTIVAL_START = '2026-07-26';
const FESTIVAL_END = '2026-08-06';

const FESTIVAL_NAMES: Record<Locale, string> = {
  ca: 'Festes de Gata 2026',
  es: 'Fiestas de Gata 2026',
};

const NOON_FALLBACK = '12:00';

// Base URL for absolute `BreadcrumbList` items. Astro.site is the
// project origin (`https://andreuSignes.github.io`); the
// `base: '/festes-gata'` prefix is added below per locale.
const SITE_ORIGIN = 'https://andreuSignes.github.io';
const BASE_PREFIX = '/festes-gata';

const PLACE: JsonLdObject = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: 'Gata de Gorgos',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Gata de Gorgos',
    addressRegion: 'Alicante',
    addressCountry: 'ES',
  },
};

/**
 * Combine a YYYY-MM-DD date with an HH:MM time and produce an ISO 8601
 * timestamp with a hard-coded `+02:00` offset (CEST during the
 * festival window).
 *
 * Schema.org best practice for events is local time with explicit
 * UTC offset rather than a bare `Z` (UTC). The festival never
 * crosses a DST boundary, so the literal offset is safe.
 */
export function dateTimeWithOffset(date: string, time: string): string {
  return `${date}T${time}:00${TIMEZONE_OFFSET}`;
}

export function buildOrganization(_lang: Locale): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Comissió de Festes de Gata 2026',
    url: `${SITE_ORIGIN}${BASE_PREFIX}/ca/`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Gata de Gorgos',
      addressRegion: 'Alicante',
      addressCountry: 'ES',
    },
  };
}

export function buildFestival(lang: Locale): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: FESTIVAL_NAMES[lang],
    startDate: FESTIVAL_START,
    endDate: FESTIVAL_END,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: PLACE,
  };
}

export function buildDayEvent(day: DayProgram, lang: Locale): JsonLdObject {
  // Earliest event time of the day, in HH:MM 24h. Fall back to noon
  // when the day has no events (rare, defensive).
  const times = day.events.map((event) => event.time).sort();
  const earliestTime = times[0] ?? NOON_FALLBACK;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Programa del ${day.date} — ${FESTIVAL_NAMES[lang]}`,
    startDate: dateTimeWithOffset(day.date, earliestTime),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: PLACE,
  };
}

export function buildBreadcrumbList(date: string, lang: Locale): JsonLdObject {
  const baseUrl = `${SITE_ORIGIN}${BASE_PREFIX}/${lang}`;
  const homeLabel = lang === 'ca' ? 'Inici' : 'Inicio';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: homeLabel,
        item: `${baseUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Programa',
        item: `${baseUrl}/#programa`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: date,
        item: `${baseUrl}/programa/${date}/`,
      },
    ],
  };
}
