# Festes de Gata — 2026

> **This is a work in progress.** The site is being scaffolded under the
> spec-driven workflow described in `openspec/`. The first preview is
> expected after PR #3 (components + pages); the first deployable
> artefact ships with PR #4 (GitHub Actions + Pages).

Bilingual static site for the **Gata de Gorgos** festival program
(Sunday 26 July → Thursday 6 August 2026), built with
[Astro](https://astro.build) and zero client JS on the landing page.

- **Default locale**: Valencià (`/ca/`)
- **Secondary locale**: Castellano (`/es/`)
- **Output**: pure static HTML/CSS, hosted on GitHub Pages under
  [`andreuSignes.github.io/festes-gata`](https://andreuSignes.github.io/festes-gata).

## Status

| Phase | Scope | Status |
|------|-------|--------|
| PR #1 | Scaffold (Astro, i18n, sitemap, TypeScript) | in progress |
| PR #2 | Content model + 22 day JSON files + content check | pending |
| PR #3 | Components + bilingual pages | pending |
| PR #4 | GitHub Actions deploy + README + OG assets | pending |

The full plan, scenarios and design rationale live in
[`openspec/`](openspec/). See in particular:

- [`openspec/changes/festes-gata-2026/proposal.md`](openspec/changes/festes-gata-2026/proposal.md)
- [`openspec/changes/festes-gata-2026/design.md`](openspec/changes/festes-gata-2026/design.md)
- [`openspec/changes/festes-gata-2026/tasks.md`](openspec/changes/festes-gata-2026/tasks.md)
- Specs: `openspec/changes/festes-gata-2026/specs/`

## Quick look (operators)

```bash
npm install         # install dependencies
npm run dev         # local dev server
npm run build       # produce dist/
npm run preview     # serve dist/ locally
```

See the deploy-ready README in PR #4 for the full developer and
content-authoring guide.

## License

Programme data is owned by the Comissió de Festes 2026. Source code is
released under the terms stated in `LICENSE` (TBD).
