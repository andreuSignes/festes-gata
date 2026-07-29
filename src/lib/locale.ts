/**
 * Locale utilities — single source of truth for the bilingual
 * `ca` / `es` routing.
 *
 * Before this module, helpers like `detectLocale`, `stripLocalePrefix`,
 * and the storage key string were duplicated across BaseLayout,
 * Header, LanguageSwitcher, 404.astro, and the inline redirect scripts.
 */

export const LOCALES = ['ca', 'es'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * The localStorage key that stores the visitor's preferred locale.
 * Versioned (`:v1`) so a future migration can coexist with the old
 * value. The literal must match across every reader/writer.
 */
export const LOCALE_STORAGE_KEY = 'festes-gata:locale:v1';

/**
 * Defensive runtime guard. `Astro.params.lang` is typed as `string`
 * because dynamic route params are not statically narrowed by the
 * Astro 7 type generator — only by `getStaticPaths`. A future
 * contributor who adds a third locale to `astro.config.mjs` without
 * updating `getStaticPaths` would pass an unknown value through;
 * `parseLocale` rejects it explicitly instead of letting TypeScript
 * silently cast it to `Locale`.
 */
export function parseLocale(value: string | undefined | null): Locale | undefined {
  return value === 'ca' || value === 'es' ? value : undefined;
}

/**
 * Default to Valencià for unauthenticated / first-visit users.
 * Matches the festival's location (Gata de Gorgos, Marina Alta).
 */
export const DEFAULT_LOCALE: Locale = 'ca';

/**
 * Resolve a locale from a route param, falling back to the default.
 * Use as the canonical "what locale is this page" lookup.
 */
export function resolveLocale(value: string | undefined | null): Locale {
  return parseLocale(value) ?? DEFAULT_LOCALE;
}

/**
 * Locale detection from a URL pathname. The pathname is expected to
 * start with `base` (optional) followed by `/${locale}/...`. Returns
 * the locale found, or `undefined` if the URL has no recognisable
 * locale prefix.
 */
export function detectLocaleFromPathname(pathname: string, base: string): Locale | undefined {
  const baseNorm = base.replace(/\/+$/, '');
  const re = new RegExp(`^${escapeRegExp(baseNorm)}/?(ca|es)(/|$)`);
  const match = pathname.match(re);
  if (!match) return undefined;
  return parseLocale(match[1]);
}

/**
 * Strip the locale prefix from a pathname, returning the path that
 * should be appended to `/<otherLocale>/` when swapping languages.
 *
 * Example:
 *   stripLocalePrefix('/festes-gata/ca/programa/2026-07-27/', '/festes-gata')
 *     → '/programa/2026-07-27/'
 */
export function stripLocalePrefix(pathname: string, base: string): string {
  const baseNorm = base.replace(/\/+$/, '');
  const re = new RegExp(`^${escapeRegExp(baseNorm)}/?(?:ca|es)(/|$)`);
  const remainder = pathname.replace(re, '$1') || '/';
  return remainder.startsWith('/') ? remainder : `/${remainder}`;
}

/**
 * Build an absolute, locale-prefixed URL from a locale-stripped path.
 * Trailing slashes are normalised away from `base` and the locale
 * segment to make concatenation order-independent.
 */
export function localizedPath(locale: Locale, base: string, remainder: string): string {
  const baseNorm = base.replace(/\/+$/, '');
  const tail = remainder.startsWith('/') ? remainder : `/${remainder}`;
  return `${baseNorm}/${locale}${tail === '/' ? '/' : tail}`;
}

/**
 * Escape a string for safe injection into a `new RegExp(...)` pattern.
 * Used by the locale-prefix helpers above so a `base` of `/` (or any
 * other regex-meta-laden string) cannot break the regex.
 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
