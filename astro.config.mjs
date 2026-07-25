// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://andreuSignes.github.io',
  base: '/festes-gata',
  output: 'static',
  // i18n is deferred to v2. v1 ships Spanish only; language will be
  // managed via separate files per locale (content collections keyed by
  // future `locale` field) when we add the second language.
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
