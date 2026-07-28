/**
 * Shared, locale-aware labels for the ten event types defined in
 * `src/content/config.ts`. Used by `Badge`, `EventItem`, the upcoming
 * `FilterBar` (PR #3), and any future copy that needs a human-readable
 * event-type name. CA/ES strings are pinned in
 * `openspec/changes/festes-gata-ui-2026/specs/design-system/spec.md`.
 *
 * The keys are locale-neutral (they match the Zod enum) — only the
 * values change between locales. Tone hooks (`badge--{type}`) and data
 * attributes (`data-event-type="{type}"`) are unaffected.
 */
export type EventType =
  | 'pasacalles'
  | 'bous'
  | 'verbena'
  | 'musica'
  | 'liturgia'
  | 'infantil'
  | 'comida'
  | 'festes'
  | 'pirotecnia'
  | 'otro';

export type Locale = 'ca' | 'es';

export const eventTypeLabels: Record<EventType, Record<Locale, string>> = {
  pasacalles: { ca: 'Passacarrers', es: 'Pasacalles' },
  bous: { ca: 'Bous', es: 'Bous' },
  verbena: { ca: 'Verbena', es: 'Verbena' },
  musica: { ca: 'Música', es: 'Música' },
  liturgia: { ca: 'Litúrgia', es: 'Liturgia' },
  infantil: { ca: 'Infantil', es: 'Infantil' },
  comida: { ca: 'Comida', es: 'Comida' },
  festes: { ca: 'Festes', es: 'Festes' },
  pirotecnia: { ca: 'Pirotècnia', es: 'Pirotecnia' },
  otro: { ca: 'Altres', es: 'Otro' },
};

export function getEventTypeLabel(type: EventType, lang: Locale): string {
  return eventTypeLabels[type][lang];
}
