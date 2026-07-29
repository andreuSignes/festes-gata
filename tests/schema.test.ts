import { describe, it, expect } from 'vitest';
import { eventSchema, daySchema } from '../src/content/schema.ts';

describe('eventSchema', () => {
  const validEvent = {
    time: '20:00',
    title: 'Concert',
    type: 'musica',
  };

  describe('valid events', () => {
    it('passes with required fields only', () => {
      const result = eventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('passes with all optional fields', () => {
      const result = eventSchema.safeParse({
        ...validEvent,
        location: 'Plaça Major',
        description: 'Live music performance',
        sponsor: 'Local Business',
        tags: ['outdoor', 'family-friendly'],
      });
      expect(result.success).toBe(true);
    });

    it.each([
      { time: '00:00', label: 'midnight' },
      { time: '01:30', label: 'early morning' },
      { time: '12:00', label: 'noon' },
      { time: '23:59', label: 'one minute to midnight' },
    ])('passes with valid time $label ($time)', ({ time }) => {
      const result = eventSchema.safeParse({ ...validEvent, time });
      expect(result.success).toBe(true);
    });

    it.each([
      'pasacalles',
      'bous',
      'verbena',
      'musica',
      'liturgia',
      'infantil',
      'comida',
      'festes',
      'pirotecnia',
    ])('passes with type: %s', (type) => {
      const result = eventSchema.safeParse({ ...validEvent, type });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid time', () => {
    it.each([
      { time: '25:00', reason: 'hour out of range' },
      { time: '12:60', reason: 'minutes out of range' },
      { time: '1:00', reason: 'single digit hour' },
      { time: '12:0', reason: 'single digit minutes' },
      { time: '12', reason: 'missing minutes' },
      { time: ':00', reason: 'missing hour' },
      { time: '12:00:00', reason: 'extra seconds' },
      { time: '12-00', reason: 'wrong separator' },
      { time: 'abc', reason: 'non-numeric' },
    ])('fails with $reason (time: $time)', ({ time }) => {
      const result = eventSchema.safeParse({ ...validEvent, time });
      expect(result.success).toBe(false);
    });
  });

  describe('missing required fields', () => {
    it.each([
      { field: 'time', event: { title: 'Test', type: 'musica' } },
      { field: 'title', event: { time: '20:00', type: 'musica' } },
      { field: 'type', event: { time: '20:00', title: 'Test' } },
    ])('fails when $field is missing', ({ event }) => {
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(false);
    });
  });

  describe('optional fields work correctly', () => {
    it('passes without location', () => {
      const result = eventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('passes without description', () => {
      const result = eventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('passes without sponsor', () => {
      const result = eventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('passes without tags', () => {
      const result = eventSchema.safeParse(validEvent);
      expect(result.success).toBe(true);
    });

    it('passes with empty tags array', () => {
      const result = eventSchema.safeParse({ ...validEvent, tags: [] });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid type', () => {
    it('fails with invalid type value', () => {
      const result = eventSchema.safeParse({ ...validEvent, type: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('fails with empty string type', () => {
      const result = eventSchema.safeParse({ ...validEvent, type: '' });
      expect(result.success).toBe(false);
    });
  });
});

describe('daySchema', () => {
  const validDay = {
    date: '2026-07-26',
    weekday: 'diumenge',
    events: [],
  };

  describe('valid days', () => {
    it('passes with required fields only', () => {
      const result = daySchema.safeParse(validDay);
      expect(result.success).toBe(true);
    });

    it('passes with events', () => {
      const result = daySchema.safeParse({
        ...validDay,
        events: [{ time: '20:00', title: 'Concert', type: 'musica' }],
      });
      expect(result.success).toBe(true);
    });

    it('passes with multiple events', () => {
      const result = daySchema.safeParse({
        ...validDay,
        events: [
          { time: '10:00', title: 'Morning Event', type: 'pasacalles' },
          { time: '14:00', title: 'Lunch', type: 'comida' },
          { time: '20:00', title: 'Evening Concert', type: 'musica' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('passes with null theme', () => {
      const result = daySchema.safeParse({ ...validDay, theme: null });
      expect(result.success).toBe(true);
    });

    it('passes with string theme', () => {
      const result = daySchema.safeParse({ ...validDay, theme: 'Día del Pregón' });
      expect(result.success).toBe(true);
    });

    it('passes without theme (optional)', () => {
      const result = daySchema.safeParse(validDay);
      expect(result.success).toBe(true);
    });

    it('passes with empty events array', () => {
      const result = daySchema.safeParse({ ...validDay, events: [] });
      expect(result.success).toBe(true);
    });
  });

  describe('invalid date format', () => {
    it.each([
      { date: '26-07-2026', reason: 'wrong separator (hyphens)' },
      { date: '2026/07/26', reason: 'forward slashes' },
      { date: '07-26-2026', reason: 'MM-DD-YYYY order' },
      { date: '2026-7-26', reason: 'single digit month' },
      { date: '2026-07-6', reason: 'single digit day' },
      { date: '2026-13-01', reason: 'month out of range' },
      { date: '2026-01-32', reason: 'day out of range' },
      { date: '26/07/2026', reason: 'slashes with hyphens pattern' },
      { date: 'invalid', reason: 'non-date string' },
    ])('fails with $reason (date: $date)', ({ date }) => {
      const result = daySchema.safeParse({ ...validDay, date });
      expect(result.success).toBe(false);
    });
  });

  describe('missing weekday', () => {
    it('fails when weekday is missing', () => {
      const { weekday: _weekday, ...withoutWeekday } = validDay;
      const result = daySchema.safeParse(withoutWeekday);
      expect(result.success).toBe(false);
    });

    it('rejects empty string (min(1) enforces non-empty weekday)', () => {
      const result = daySchema.safeParse({ ...validDay, weekday: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('events array validation', () => {
    it('fails with invalid event in array', () => {
      const result = daySchema.safeParse({
        ...validDay,
        events: [{ time: 'invalid', title: 'Test', type: 'musica' }],
      });
      expect(result.success).toBe(false);
    });

    it('fails with mixed valid and invalid events', () => {
      const result = daySchema.safeParse({
        ...validDay,
        events: [
          { time: '20:00', title: 'Valid', type: 'musica' },
          { time: 'invalid', title: 'Invalid', type: 'musica' },
        ],
      });
      expect(result.success).toBe(false);
    });
  });
});
