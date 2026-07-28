/**
 * Sibling-URL helper for bilingual SEO hreflang.
 *
 * Produces the three `<link rel="alternate">` tags every page must
 * declare so search engines serve the right locale:
 *   - hreflang="ca-ES" pointing to the CA sibling URL
 *   - hreflang="es-ES" pointing to the ES sibling URL
 *   - hreflang="x-default" pointing to /ca/ (the site's default locale
 *     per `astro.config.mjs → i18n.defaultLocale`)
 *
 * `pathname` MUST include the project's `base` prefix (e.g.
 * `/festes-gata/ca/programa/2026-07-26/`) — same as
 * `Astro.url.pathname`, which carries `base: '/festes-gata'`
 * automatically and is what `BaseLayout.astro:22-23` already passes to
 * `new URL(pathname, Astro.site)`.
 *
 * `site` is the absolute origin (e.g. `Astro.site`). `base` is the
 * project base prefix (`import.meta.env.BASE_URL`, trailing slash
 * optional). The helper strips `base`, swaps the leading
 * `/{currentLang}/` segment to `/{otherLang}/`, and prepends `base`
 * back. `x-default` always resolves to `${base}/ca/`.
 */

import type { Locale } from './event-type-labels';

export interface HreflangTag {
  rel: 'alternate';
  hreflang: string;
  href: string;
}

const HREFLANG_MAP: Record<Locale, string> = {
  ca: 'ca-ES',
  es: 'es-ES',
};

const DEFAULT_LOCALE: Locale = 'ca';

export function buildHreflangTags(
  pathname: string,
  currentLang: Locale,
  site: URL | string,
  base: string = ''
): HreflangTag[] {
  const otherLang: Locale = currentLang === 'ca' ? 'es' : 'ca';
  const basePrefix = base.replace(/\/$/, '');

  // Strip `base` prefix so the locale-swap regex can match `/ca/` or
  // `/es/` at the start of the remainder. `Astro.url.pathname`
  // includes the base prefix; this keeps the swap logic simple.
  const remainder =
    basePrefix && pathname.startsWith(basePrefix + '/')
      ? pathname.slice(basePrefix.length)
      : pathname;
  const swappedRemainder = remainder.replace(
    new RegExp(`^/${currentLang}(/|$)`),
    (_match, slash: string) => `/${otherLang}${slash}`
  );
  // If the remainder had no leading locale segment, fall back to the
  // bare landing under the other locale.
  const otherRemainder = swappedRemainder === remainder ? `/${otherLang}/` : swappedRemainder;

  const selfHref = new URL(pathname, site).toString();
  const otherHref = new URL(`${basePrefix}${otherRemainder}`, site).toString();
  const xDefaultHref = new URL(`${basePrefix}/${DEFAULT_LOCALE}/`, site).toString();

  return [
    { rel: 'alternate', hreflang: HREFLANG_MAP[currentLang], href: selfHref },
    { rel: 'alternate', hreflang: HREFLANG_MAP[otherLang], href: otherHref },
    { rel: 'alternate', hreflang: 'x-default', href: xDefaultHref },
  ];
}
