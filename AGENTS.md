# AGENTS.md — festes-gata

Bilingual (Valencià + Castellano) static site for the **Gata de Gorgos
2026** festival program (Sun 26 Jul → Thu 6 Aug 2026), built on Astro 7
and deployed to GitHub Pages.

**Current state: Phase 2 done (content model + data).** Phase 3
(components + pages) is in progress. Phase 4 (CI + deploy) doesn't
exist yet. See `README.md` for the phased PR plan and
`openspec/changes/festes-gata-2026/tasks.md` for the work-unit list.

## Stack & prerequisites

- Node **≥ 22.12.0** (enforced in `package.json` `engines`).
- Astro 7, `@astrojs/sitemap`, `zod` runtime deps.
- ESLint 10 + Prettier 3 + `eslint-plugin-astro` for dev tooling.
- Output: pure static HTML/CSS into `dist/`. Zero client JS on the
  landing page.
- Hosting: GitHub Pages under
  `https://andreuSignes.github.io/festes-gata` (configured via
  `site` + `base: '/festes-gata'` in `astro.config.mjs`).

## Commands

All scripts are in `package.json`.

```bash
npm run dev            # Astro dev server with HMR
npm run build          # static build → dist/ (runs Zod schema check)
npm run preview        # serve dist/ locally
npm run check          # astro check (TS + Astro diagnostics)
npm run check:content  # scripts/check-content.mjs — filename/date parity,
                       #   shape, event enum, event-field sanity
npm run lint           # eslint . (Astro plugin + Prettier compat)
npm run lint:fix       # eslint . --fix
npm run format         # prettier --write .
npm run format:check   # prettier --check .
```

**Recommended local verification order before pushing:**

1. `npm run check:content` — fastest signal, catches data drift.
2. `npm run build` — Zod schema validation + static generation.
3. `npm run lint` and `npm run format:check` — style hygiene.

There is no test runner. CI is not yet wired (PR #4).

## `v1 ships Spanish only` — the bilingual gotcha

The README, `openspec/`, and historical commit messages describe a
two-locale (Valencià + Castellano) site. **The executable code is
single-locale (Spanish).** The bilingual split was deferred to v2 (see
the 2026-07-25 scope note at the top of `openspec/changes/festes-gata-2026/*.md`).

What this means in practice:

- `src/content.config.ts` defines a single `days` collection, loading
  `src/content/days/es/*.json` only. There is no `days-ca` collection.
- `src/content/days/es/` holds 12 day files (26 Jul → 06 Aug 2026).
  `src/content/days/ca/` does **not** exist.
- `astro.config.mjs` does **not** set `i18n` or `prefixDefaultLocale`.
- `src/pages/index.astro` is a meta-refresh fallback pointing at
  `/festes-gata/ca/`. The real 302 redirect ships with PR #3, and the
  `/ca/` + `/es/` routes are also PR #3 work.

When you read `openspec/changes/festes-gata-2026/specs/` or
`design.md`, expect references to `days-ca` / `days-es` /
`src/content/days/ca/`, `i18n` routing, `LanguageSwitcher`, etc. —
all of that is **planned, not implemented**. The current `main`
reflects v1 reality. If you change anything, trust the code in
`src/` over the spec docs.

## Content model

- One JSON file per festival day at
  `src/content/days/es/YYYY-MM-DD.json` (12 files, 26 Jul → 06 Aug 2026).
- Filename must equal `date` inside the file. `scripts/check-content.mjs`
  enforces this and exits non-zero on mismatch.
- Zod schema lives in `src/content.config.ts` (root of `src/`, **not**
  `src/content/config.ts` — Astro 7 moved to this location; the
  design.md still says the old path).
- `npm run build` re-validates every JSON file against the Zod schema
  and fails with the file + field name on any mismatch.

### Event shape

```ts
{
  time: string,           // HH:MM 24h, regex /^([01]\d|2[0-3]):[0-5]\d$/
  title: string,
  location?: string,
  description?: string,
  sponsor?: string,
  type: 'pasacalles' | 'bous' | 'verbena' | 'musica' | 'liturgia'
      | 'infantil' | 'paelles' | 'festes' | 'otro',
  tags?: string[],
}
```

The 9-value `type` enum **includes `paelles` and `festes`**, which
`openspec/.../specs/festival-program/spec.md` and `design.md` omit
(those docs still list the original 7). Use the Zod schema and
`src/content/days/README.md` as the source of truth — the spec docs
are stale on this. See `src/content/days/README.md` for the type
glossary (Spanish source → closest enum value).

### Day shape

```ts
{
  date: string,           // YYYY-MM-DD, must match filename
  weekday: string,        // non-empty
  theme?: string | null,  // day theme (e.g. 'Día del Pregón')
  events: event[],
}
```

`src/content/days/PROGRAM_SOURCE.txt` is the **absolute source of
truth** for programme data. Don't edit data from this PR; the
authoring flow is documented in `src/content/days/README.md`.

## Files & directories worth knowing

- `astro.config.mjs` — `site`, `base: '/festes-gata'`, `output: 'static'`,
  `@astrojs/sitemap` integration. Internal links should be site-relative
  paths; Astro prepends `base`. OG/twitter meta in `BaseLayout` (PR #3
  work) will use absolute URLs derived from `site`.
- `tsconfig.json` — extends `astro/tsconfigs/strict` + adds
  `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Be
  defensive with array/object index access.
- `eslint.config.js` — flat config; ESLint + Prettier compat last so
  Prettier wins. `no-unused-vars` and `no-console` are `warn` for
  `.mjs`/`.cjs`.
- `.prettierrc` — 2-space, single quotes, semicolons, printWidth 100,
  LF endings.
- `src/pages/index.astro` — temporary build-time placeholder
  (meta-refresh to `/ca/`). Will be replaced by a real 302 redirect
  in PR #3. Don't add real content here.
- `dist/` — build output. Ignored by git. Do not edit.
- `.astro/` — generated by Astro (types, schemas, dev cache). Ignored
  by git. Do not edit. After a brand-new install, `.astro/collections/`
  may carry stale `days-ca.schema.json` / `days-es.schema.json` from
  before the v1 revert — they're inert.
- `openspec/` — gitignored planning workspace. Specs, design, tasks,
  and proposals for the change. Not the deployable artefact. See
  `openspec/README.md`.
- `.atl/`, `.codegraph/` — local runtime artefacts (editor caches).
  Ignored by git.

## Workflow conventions

- **PRs are chained and budget-bounded.** The change plan targets a
  400-line review budget per PR, with stacked-to-main merging (single
  author). When proposing changes, keep them small and self-contained.
  PRD roadmap is in `openspec/changes/festes-gata-2026/tasks.md`.
- **No tests; CI ships Phase 4 deploy.** `.github/workflows/deploy.yml`
  triggers on push to `main` (and `workflow_dispatch`), runs on Node 22
  (matches `package.json` `engines.node: ">=22.12.0"`), uses
  `actions/setup-node@v4`, `actions/upload-pages-artifact@v4`, and
  `actions/deploy-pages@v4`, and deploys to the `github-pages`
  environment. Workflow concurrency (`group: pages`,
  `cancel-in-progress: false`) serialises deploys without aborting an
  in-flight publish. Don't add a test runner before the rules in
  `openspec/config.yaml` change — they set `testing.strict_tdd: false`
  and `testing.runner: none`.
- **Content changes are JSON edits + push.** Authoring flow is
  documented in `src/content/days/README.md`. Spec workflow lives
  under `openspec/`.

## Don't

- Don't add `src/content/days/ca/` data files — v1 is Spanish-only.
- Don't add `i18n` to `astro.config.mjs` until the v2 plan lands.
- Don't hand-edit `dist/` or `.astro/` — both are generated.
- Don't add a `LanguageSwitcher`, `/ca/`, `/es/`, or `404.astro` —
  these are PR #3 work.
- Don't add dependencies beyond what's needed for one PR's scope; the
  400-line review budget is the cap.
