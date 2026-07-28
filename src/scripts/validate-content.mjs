/**
 * Pure validator for festival day JSON objects.
 * Validates event/time/type structure without file I/O.
 * @module validate-content
 */

/** @typedef {{ valid: true }} ValidResult */
/** @typedef {{ valid: false; name: string; message: string }} InvalidResult */
/** @typedef {ValidResult | InvalidResult} ValidationResult */

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const VALID_TYPES = new Set([
  'pasacalles',
  'bous',
  'verbena',
  'musica',
  'liturgia',
  'infantil',
  'comida',
  'festes',
  'otro',
]);

/**
 * Validate a parsed day program object.
 * @param {string} filename - The filename to check against data.date (e.g. "2026-07-26.json")
 * @param {unknown} data - The parsed JSON object
 * @returns {ValidationResult}
 */
export function validateProgram(filename, data) {
  if (typeof data !== 'object' || data === null || !Array.isArray(data.events)) {
    return {
      valid: false,
      name: 'ERR_INVALID_STRUCTURE',
      message: 'data must be an object with an events array',
    };
  }

  // Rule 1: filename date must match data.date
  const expectedDate = filename.replace(/\.json$/, '');
  if (data.date !== expectedDate) {
    return {
      valid: false,
      name: 'ERR_DATE_MISMATCH',
      message: `filename date "${expectedDate}" does not match data.date "${data.date}"`,
    };
  }

  // Rule 2: validate each event
  const events = data.events;
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];

    // time must match HH:MM pattern
    if (typeof ev.time !== 'string' || !TIME_RE.test(ev.time)) {
      return {
        valid: false,
        name: 'ERR_INVALID_TIME',
        message: `event[${i}].time "${ev.time}" is not a valid HH:MM time`,
      };
    }

    // type must be in enum
    if (!VALID_TYPES.has(ev.type)) {
      return {
        valid: false,
        name: 'ERR_INVALID_TYPE',
        message: `event[${i}].type "${ev.type}" is not a valid event type`,
      };
    }

    // tags must be array of strings if present
    if (ev.tags !== undefined) {
      if (!Array.isArray(ev.tags) || ev.tags.some((t) => typeof t !== 'string')) {
        return {
          valid: false,
          name: 'ERR_INVALID_TAGS',
          message: `event[${i}].tags must be an array of strings`,
        };
      }
    }
  }

  return { valid: true };
}
