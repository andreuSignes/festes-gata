// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://andreuSignes.github.io',
  base: '/festes-gata',
  output: 'static',
  i18n: {
    locales: ['ca', 'es'],
    defaultLocale: 'ca',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [sitemap()],
});
