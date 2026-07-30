/**
 * Locale-aware labels + emoji for the event-type taxonomy defined in
 * `src/lib/event-types.ts`. Used by `Badge`, `EventItem`, `FilterBar`,
 * and any future copy that needs a human-readable event-type name.
 *
 * The keys MUST match `EVENT_TYPES` from `event-types.ts` exactly; this
 * is enforced at the type level by the `Record<EventType, …>` shape and
 * at runtime by the `event-types` test suite.
 *
 * `Locale` is re-exported from `src/lib/locale.ts` so existing callers
 * (`EventItem`, `EventList`, `FilterBar`, `DaySection`) keep their
 * single import path.
 */
import { EVENT_TYPES, type EventType } from './event-types';
import type { Locale } from './locale';

export { EVENT_TYPES };
export type { EventType, Locale };

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
};

export function getEventTypeLabel(type: EventType, lang: Locale): string {
  return eventTypeLabels[type][lang];
}

export const eventTypeEmoji: Record<EventType, string> = {
  pasacalles: '🎺',
  bous: '🐂',
  verbena: '🎡',
  musica: '🎵',
  liturgia: '⛪',
  infantil: '👶',
  comida: '🍽️',
  festes: '🎊',
  pirotecnia: '🎆',
};
