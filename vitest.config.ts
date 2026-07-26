import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(async () => {
  const astroConfig = await getViteConfig({});
  return {
    ...astroConfig,
    resolve: {
      alias: {
        // Tests import schema.ts which uses 'astro:content' for Astro type generation.
        // vitest can't resolve astro:content virtual module, but we only need { z },
        // which zod re-exports identically.
        'astro:content': 'zod',
      },
    },
    test: {
      environment: 'node',
      include: ['tests/**/*.test.ts'],
    },
  };
});
