import { describe, it, expect } from 'vitest';
import { validateProgram } from '../src/scripts/validate-content.mjs';

const VALID_EVENT = {
  time: '20:00',
  title: 'Concert',
  type: 'musica',
};

const VALID_DAY = {
  date: '2026-07-26',
  weekday: 'diumenge',
  theme: 'Dia del Pregon',
  events: [
    { ...VALID_EVENT, time: '20:00' },
    { ...VALID_EVENT, time: '22:00', title: 'Sardanes', type: 'musica' },
  ],
};

describe('validate-program', () => {
  describe('valid input passes', () => {
    it('returns valid: true for a valid day object with 2 events', () => {
      const result = validateProgram('2026-07-26.json', VALID_DAY);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid: true when events array is empty', () => {
      const day = { ...VALID_DAY, events: [] };
      const result = validateProgram('2026-07-26.json', day);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid: true when tags are absent (exactOptionalPropertyTypes)', () => {
      const eventNoTags = { time: '20:00', title: 'Concert', type: 'musica' };
      const day = { ...VALID_DAY, events: [eventNoTags] };
      const result = validateProgram('2026-07-26.json', day);
      expect(result).toEqual({ valid: true });
    });

    it('returns valid: true when tags is an empty array', () => {
      const eventWithTags = { time: '20:00', title: 'Concert', type: 'musica', tags: [] };
      const day = { ...VALID_DAY, events: [eventWithTags] };
      const result = validateProgram('2026-07-26.json', day);
      expect(result).toEqual({ valid: true });
    });
  });

  describe('ERR_DATE_MISMATCH', () => {
    it('returns invalid with ERR_DATE_MISMATCH when filename date does not match data.date', () => {
      const result = validateProgram('2026-07-26.json', { ...VALID_DAY, date: '2026-07-27' });
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_DATE_MISMATCH');
        expect(result.message).toContain('2026-07-26');
        expect(result.message).toContain('2026-07-27');
      }
    });

    it('returns invalid with ERR_DATE_MISMATCH when filename is completely different', () => {
      const result = validateProgram('2026-07-99.json', VALID_DAY);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_DATE_MISMATCH');
      }
    });
  });

  describe('ERR_INVALID_TIME', () => {
    it('returns invalid with ERR_INVALID_TIME for time 25:00', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, time: '25:00' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TIME');
        expect(result.message).toContain('25:00');
      }
    });

    it('returns invalid with ERR_INVALID_TIME for time 12:60', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, time: '12:60' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TIME');
      }
    });

    it('returns invalid with ERR_INVALID_TIME for malformed time string', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, time: '8pm' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TIME');
      }
    });

    it('returns invalid with ERR_INVALID_TIME for missing time', () => {
      const day = {
        ...VALID_DAY,
        events: [{ title: 'Concert', type: 'musica' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TIME');
      }
    });
  });

  describe('ERR_INVALID_TYPE', () => {
    it('returns invalid with ERR_INVALID_TYPE for type "invalid-type"', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, type: 'invalid-type' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TYPE');
        expect(result.message).toContain('invalid-type');
      }
    });

    it('returns invalid with ERR_INVALID_TYPE for type "fiesta" (not in enum)', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, type: 'fiesta' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TYPE');
      }
    });
  });

  describe('ERR_INVALID_TAGS', () => {
    it('returns invalid with ERR_INVALID_TAGS when tags is a string', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, tags: 'not-an-array' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TAGS');
      }
    });

    it('returns invalid with ERR_INVALID_TAGS when tags is an object', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, tags: { key: 'value' } }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TAGS');
      }
    });

    it('returns invalid with ERR_INVALID_TAGS when tags array contains non-strings', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, tags: ['valid', 123, 'also-valid'] }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TAGS');
      }
    });

    it('returns invalid with ERR_INVALID_TAGS when tags array contains numbers', () => {
      const day = {
        ...VALID_DAY,
        events: [{ ...VALID_EVENT, tags: [1, 2, 3] }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_INVALID_TAGS');
      }
    });
  });

  describe('first error wins', () => {
    it('returns ERR_DATE_MISMATCH before ERR_INVALID_TIME when both are wrong', () => {
      const day = {
        ...VALID_DAY,
        date: '2026-07-27',
        events: [{ ...VALID_EVENT, time: '25:00' }],
      };
      const result = validateProgram('2026-07-26.json', day);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.name).toBe('ERR_DATE_MISMATCH');
      }
    });
  });
});
