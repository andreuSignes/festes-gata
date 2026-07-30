/**
 * Site configuration helpers — read the deployment origin and base
 * prefix from the Astro build context. Single source of truth so a
 * future hosting change (Cloudflare Pages, custom domain, etc.) only
 * has to update `astro.config.mjs` and these helpers.
 */

import { DEFAULT_LOCALE, type Locale, localizedPath } from './locale';

/**
 * Normalise a site origin (URL instance or string) to its canonical
 * `https://host` form without a trailing slash. Tolerates the
 * `Astro.site` undefined case during early-template work by falling
 * back to the GitHub Pages origin declared in `astro.config.mjs`.
 */
export function getSiteOrigin(site: URL | string | undefined): string {
  const value = site ? new URL(site.toString()) : new URL('https://andreuSignes.github.io');
  return value.origin.replace(/\/+$/, '');
}

/**
 * Strip the trailing slash from an Astro `base` so build-time
 * concatenation with the locale segment is order-independent.
 */
export function normalizeBase(base: string): string {
  return base.replace(/\/+$/, '');
}

/**
 * The locale-prefixed home URL for a given locale. Used by the
 * header brand, the language switcher, and the JSON-LD builders.
 */
export function homeUrl(site: URL | string | undefined, base: string, locale: Locale): string {
  return localizedPath(locale, normalizeBase(base), '/');
}

/**
 * The locale-prefixed home URL for the default locale. Used by the
 * universal 404, the language switcher fallback, and the
 * `x-default` hreflang tag.
 */
export function defaultHomeUrl(site: URL | string | undefined, base: string): string {
  return homeUrl(site, base, DEFAULT_LOCALE);
}
