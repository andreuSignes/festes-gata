# Program data — `festes-gata-2026`

This directory contains the bilingual program for **Festes de Gata de Gorgos 2026**,
arranged in two parallel collections, one per locale:

```
src/content/days/
├── PROGRAM_SOURCE.txt     # absolute source of truth (do not edit from this PR)
├── README.md              # this file
├── ca/                    # Valenciano (default locale)
│   └── 2026-07-26.json … 2026-08-06.json
└── es/                    # Castellano
    └── 2026-07-26.json … 2026-08-06.json
```

12 days × 2 locales = **24 JSON files**, each validated against a Zod schema
declared in `src/content.config.ts` (Astro 7's `glob` loader).

## Editing flow

1. Open the file for the day you want to change, in the locale(s) you want to
   change. The filename is `YYYY-MM-DD.json`; the file is the source of truth
   for that day in that locale.
2. Keep the structure flat. Each event has `time`, `title`, optional
   `location` / `description` / `sponsor` / `tags`, and a `type` (one of
   `pasacalles`, `bous`, `verbena`, `musica`, `liturgia`, `infantil`,
   `comida`, `festes`, `otro`).
3. The `description` field should be the full event text (everything after the
   `HH:MM horas:` prefix in the original program).
4. Run `pnpm build`. Astro 7's content collection will reject any file that
   does not satisfy the Zod schema, with the file name and the field that
   failed.
5. Run `pnpm check:content` to confirm the two locales stay in parity (same
   date set, same event count per date, same time order).
6. Commit and push. CI re-runs the same checks and deploys to Pages.

## Schema

```ts
const event = {
  time:        string,   // HH:MM 24h
  title:       string,
  location?:   string,
  description?: string,
  sponsor?:    string,
  type:        'pasacalles' | 'bous' | 'verbena' | 'musica' | 'liturgia'
               | 'infantil' | 'comida' | 'festes' | 'otro',
  tags?:       string[],
};

const day = {
  date:     string,             // YYYY-MM-DD, must match filename
  weekday:  string,             // 'Domingo' | 'Lunes' | 'Martes' | ...
  theme?:   string | null,      // day theme (e.g. 'Día del Pregón')
  events:   event[],
};
```

The `type` field is the badge shown next to each event. Use the closest match:

| `type`       | Use for                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| `pasacalles` | `pasacalle(s)`, `despertà`, `Entrada de la Murta`                                        |
| `bous`       | bulls / cows / `ganadería` / `corro` / `bous a banda` / `trashumancia` / `mansos`        |
| `verbena`    | open-air dance / `verbena`                                                               |
| `musica`     | `actuación`, `concierto`, `orquesta`, `DJ`, `banda musical`, `festa de la espuma`        |
| `liturgia`   | `misa`, `novena`, `procesión`, `ofrenda`                                                 |
| `infantil`   | `parque acuático`, `hinchables`, `magia`, `carretones`, `quintà infantil`, kids-only     |
| `comida`     | paella contests / `concurs de paelles`                                                   |
| `festes`     | generic festival events: `inauguración`, `barracas`, `carrozas`, `disfraces`, `correfoc` |
| `otro`       | everything else (e.g. `Campeonato de TRUC`, `ajedrez`)                                   |

## Parity

Both locales must list the same dates, with the same number of events per date
and the same `time` order. The script `scripts/check-content.mjs` (run as
`pnpm check:content`) walks both trees, validates shape, and exits non-zero
on any mismatch.
