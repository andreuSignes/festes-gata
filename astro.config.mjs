// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://festes-gata.asignes.cc',
  base: '/',
  output: 'static',
  i18n: {
    defaultLocale: 'ca',
    locales: ['ca', 'es'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'ca',
        locales: {
          ca: 'ca-ES',
          es: 'es-ES',
        },
      },
      // Exclude the universal 404 (any path containing `/404`) and
      // the root redirector `/`. Locale-prefixed 404s (`/ca/404/`,
      // `/es/404/`) are caught by the `/404` substring test.
      //
      // `@astrojs/sitemap` 3.x passes the **full URL** to `filter`
      // (e.g. `https://festes-gata.asignes.cc/`), so the
      // bare `page !== '/'` check would never match — compare against
      // the URL pathname instead, which is `/` for the root redirector.
      filter: (page) => {
        if (page.includes('/404')) return false;
        const pathname = new URL(page).pathname;
        return pathname !== '/';
      },
      // lastmod: Date — sets a static <lastmod> for every sitemap entry.
      // @astrojs/sitemap 3.x does not auto-derive per-URL lastmod from
      // source file mtime; a serialize hook could do it but would need
      // fs access at build time. A fixed date is acceptable for a static
      // content site where pages change only on new deployments.
      lastmod: new Date('2026-07-20'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
