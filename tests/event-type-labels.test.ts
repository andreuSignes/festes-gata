import { describe, it, expect } from 'vitest';
import { EVENT_TYPES } from '../src/lib/event-types';
import { LOCALES } from '../src/lib/locale';
import { eventTypeLabels, eventTypeEmoji, getEventTypeLabel } from '../src/lib/event-type-labels';

describe('eventTypeLabels', () => {
  it('has all 9 event types as keys', () => {
    for (const type of EVENT_TYPES) {
      expect(eventTypeLabels).toHaveProperty(type);
    }
  });

  it('each event type has both ca and es labels', () => {
    for (const type of EVENT_TYPES) {
      expect(eventTypeLabels[type]).toHaveProperty('ca');
      expect(eventTypeLabels[type]).toHaveProperty('es');
    }
  });

  it('all label values are non-empty strings', () => {
    for (const type of EVENT_TYPES) {
      for (const locale of LOCALES) {
        expect(typeof eventTypeLabels[type][locale]).toBe('string');
        expect(eventTypeLabels[type][locale].length).toBeGreaterThan(0);
      }
    }
  });

  it('ca and es labels are different for types with locale-specific spelling', () => {
    expect(eventTypeLabels.liturgia.ca).not.toBe(eventTypeLabels.liturgia.es);
    expect(eventTypeLabels.pirotecnia.ca).not.toBe(eventTypeLabels.pirotecnia.es);
  });

  it('ca label uses Catalan spelling for liturgia', () => {
    expect(eventTypeLabels.liturgia.ca).toBe('Litúrgia');
  });

  it('es label uses Spanish spelling for liturgia', () => {
    expect(eventTypeLabels.liturgia.es).toBe('Liturgia');
  });

  it('ca label uses Catalan spelling for pirotecnia', () => {
    expect(eventTypeLabels.pirotecnia.ca).toBe('Pirotècnia');
  });

  it('es label uses Spanish spelling for pirotecnia', () => {
    expect(eventTypeLabels.pirotecnia.es).toBe('Pirotecnia');
  });
});

describe('eventTypeEmoji', () => {
  it('has all 9 event types as keys', () => {
    for (const type of EVENT_TYPES) {
      expect(eventTypeEmoji).toHaveProperty(type);
    }
  });

  it('all emoji values are non-empty strings', () => {
    for (const type of EVENT_TYPES) {
      expect(typeof eventTypeEmoji[type]).toBe('string');
      expect(eventTypeEmoji[type].length).toBeGreaterThan(0);
    }
  });

  it('each emoji represents a single visible glyph (accounts for combined emoji like 🍽️)', () => {
    for (const type of EVENT_TYPES) {
      const emoji = eventTypeEmoji[type];
      expect(emoji.length).toBeGreaterThan(0);
      const graphemeCount = [...emoji].length;
      expect(graphemeCount).toBeLessThanOrEqual(2);
    }
  });

  it('pasacalles has trumpet emoji', () => {
    expect(eventTypeEmoji.pasacalles).toBe('🎺');
  });

  it('bous has bull emoji', () => {
    expect(eventTypeEmoji.bous).toBe('🐂');
  });

  it('verbena has ferris wheel emoji', () => {
    expect(eventTypeEmoji.verbena).toBe('🎡');
  });

  it('musica has music emoji', () => {
    expect(eventTypeEmoji.musica).toBe('🎵');
  });

  it('liturgia has church emoji', () => {
    expect(eventTypeEmoji.liturgia).toBe('⛪');
  });

  it('infantil has baby emoji', () => {
    expect(eventTypeEmoji.infantil).toBe('👶');
  });

  it('comida has plate emoji', () => {
    expect(eventTypeEmoji.comida).toBe('🍽️');
  });

  it('festes has party emoji', () => {
    expect(eventTypeEmoji.festes).toBe('🎊');
  });

  it('pirotecnia has firework emoji', () => {
    expect(eventTypeEmoji.pirotecnia).toBe('🎆');
  });
});

describe('getEventTypeLabel', () => {
  it('returns ca label when locale is ca', () => {
    for (const type of EVENT_TYPES) {
      expect(getEventTypeLabel(type, 'ca')).toBe(eventTypeLabels[type].ca);
    }
  });

  it('returns es label when locale is es', () => {
    for (const type of EVENT_TYPES) {
      expect(getEventTypeLabel(type, 'es')).toBe(eventTypeLabels[type].es);
    }
  });

  it('returns correct label for pasacalles', () => {
    expect(getEventTypeLabel('pasacalles', 'ca')).toBe('Passacarrers');
    expect(getEventTypeLabel('pasacalles', 'es')).toBe('Pasacalles');
  });

  it('returns correct label for bous', () => {
    expect(getEventTypeLabel('bous', 'ca')).toBe('Bous');
    expect(getEventTypeLabel('bous', 'es')).toBe('Bous');
  });

  it('returns correct label for verbena', () => {
    expect(getEventTypeLabel('verbena', 'ca')).toBe('Verbena');
    expect(getEventTypeLabel('verbena', 'es')).toBe('Verbena');
  });

  it('returns correct label for musica', () => {
    expect(getEventTypeLabel('musica', 'ca')).toBe('Música');
    expect(getEventTypeLabel('musica', 'es')).toBe('Música');
  });

  it('returns correct label for liturgia', () => {
    expect(getEventTypeLabel('liturgia', 'ca')).toBe('Litúrgia');
    expect(getEventTypeLabel('liturgia', 'es')).toBe('Liturgia');
  });

  it('returns correct label for infantil', () => {
    expect(getEventTypeLabel('infantil', 'ca')).toBe('Infantil');
    expect(getEventTypeLabel('infantil', 'es')).toBe('Infantil');
  });

  it('returns correct label for comida', () => {
    expect(getEventTypeLabel('comida', 'ca')).toBe('Comida');
    expect(getEventTypeLabel('comida', 'es')).toBe('Comida');
  });

  it('returns correct label for festes', () => {
    expect(getEventTypeLabel('festes', 'ca')).toBe('Festes');
    expect(getEventTypeLabel('festes', 'es')).toBe('Festes');
  });

  it('returns correct label for pirotecnia', () => {
    expect(getEventTypeLabel('pirotecnia', 'ca')).toBe('Pirotècnia');
    expect(getEventTypeLabel('pirotecnia', 'es')).toBe('Pirotecnia');
  });
});
