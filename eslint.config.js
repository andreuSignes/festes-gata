import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import eslintPluginAstro from 'eslint-plugin-astro';
import * as astroParser from 'astro-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig([
  js.configs.recommended,
  eslintConfigPrettier,
  ...eslintPluginAstro.configs.recommended,
  {
    // `.astro` files contain both HTML/markup and a TypeScript
    // frontmatter block. `eslint-plugin-astro` bundles its own
    // parser (`astro-eslint-parser`) for the markup part, but that
    // parser does NOT understand TypeScript on its own — without a
    // secondary TS parser you get "Parsing error: Unexpected token {"
    // on `import type { ... }`, `interface Props`, etc. Wire the
    // plugin's parser as primary and `@typescript-eslint/parser` (a
    // peerDependency of `eslint-plugin-astro@3.x`) as the TS delegate.
    // project: null → AST parsing only, no type-aware rules. Keeps
    // lint fast and avoids the need for a tsconfig.eslint.json.
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.astro'],
        project: null,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
  {
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**', '.worktrees/**', '*.min.js'],
  },
]);
