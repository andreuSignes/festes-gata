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

const SCRIPT_CLOSE_RE = /<\/(script)/gi;
const U2028 = '\u2028';
const U2029 = '\u2029';

/**
 * Safely serialise a JSON-LD value for embedding inside a
 * `<script type="application/ld+json">` block via Astro's `set:html`.
 *
 * `JSON.stringify` alone does NOT escape the bytes `<`, `>`, or `&`,
 * and does NOT escape the U+2028 / U+2029 line-separator characters,
 * which are valid JSON but break JS string literals. A string field
 * containing the literal sequence `</script>` would close the
 * surrounding `<script>` element early and start a new script
 * execution context (XSS).
 *
 * The escape map below is the OWASP-recommended `</script>` mitigation
 * (`\u003c` for `<`, plus the U+2028/9 safe escapes). It is applied
 * AFTER `JSON.stringify` so the output is still valid JSON plus the
 * minimum extra escapes.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
    .replace(SCRIPT_CLOSE_RE, '\\u003c/$1');
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

/**
 * Strip trailing slashes from a site origin so concatenation with
 * `base` is order-independent. Tolerates `URL` instances and strings.
 */
function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, '');
}

/**
 * Strip a single trailing slash from a base prefix so concatenation
 * with the locale segment is order-independent.
 */
function normalizeBase(base: string): string {
  return base.replace(/\/$/, '');
}

/**
 * Build an absolute URL for the locale root: `${origin}${base}/${lang}/`.
 */
function localeUrl(site: string, base: string, lang: Locale): string {
  return `${normalizeOrigin(site)}${normalizeBase(base)}/${lang}/`;
}

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

export function buildOrganization(site: string, base: string, _lang: Locale): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Comissió de Festes de Gata 2026',
    url: localeUrl(site, base, 'ca'),
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

export function buildBreadcrumbList(
  date: string,
  lang: Locale,
  site: string,
  base: string
): JsonLdObject {
  const baseUrl = localeUrl(site, base, lang).replace(/\/$/, '');
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
