/**
 * Single source of truth for the event-type taxonomy.
 *
 * Before this module existed, the same 9-value `EventType` union was
 * declared in 5 places (Zod schema, event-type-labels, two locations
 * in festival-interactivity, validate-content). Adding a 10th type
 * required editing all of them — and the authoring-flow doc still
 * listed a stale value (`otro` instead of `pirotecnia`).
 *
 * Now: every consumer (Zod schema, labels, client-side script, tests)
 * derives its set from `EVENT_TYPES`. Drift is impossible without a
 * build error.
 *
 * `as const` preserves the literal string types so the derived
 * `EventType` is a 9-value union, not `string`.
 */
export const EVENT_TYPES = [
  'pasacalles',
  'bous',
  'verbena',
  'musica',
  'liturgia',
  'infantil',
  'comida',
  'festes',
  'pirotecnia',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/**
 * Runtime form of the type set for O(1) membership checks. Use this
 * in validators / hot paths instead of `EVENT_TYPES.includes(x)`.
 */
export const eventTypeSet: ReadonlySet<EventType> = new Set(EVENT_TYPES);

/**
 * Shared time regex for an HH:MM 24h clock. Used by the Zod schema
 * and the fast-fail `validate-content.mjs` script so the two stay
 * in lockstep.
 */
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
