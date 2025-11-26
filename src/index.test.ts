import { describe, it, expect } from 'vitest';
import { validateFinnishHetu } from './index';

describe('validateFinnishHetu', () => {
  describe('valid HETUs', () => {
    it('should accept valid HETU with - separator (1900s)', () => {
      // 131052-308T is a known valid Finnish HETU
      expect(validateFinnishHetu('131052-308T')).toBe(true);
    });

    it('should accept valid HETU with A separator (2000s)', () => {
      // 010100A123D: Jan 1, 2000
      expect(validateFinnishHetu('010100A123D')).toBe(true);
    });

    it('should accept valid HETU with + separator (1800s)', () => {
      // 010190+123M: Jan 1, 1890
      expect(validateFinnishHetu('010190+123M')).toBe(true);
    });

    it('should accept valid HETU with B separator (2000s)', () => {
      // 010105B123P: Jan 1, 2005
      expect(validateFinnishHetu('010105B123P')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(validateFinnishHetu('131052-308t')).toBe(true);
      expect(validateFinnishHetu('010100a123d')).toBe(true);
    });

    it('should accept HETU for someone born today or earlier', () => {
      // Create a valid HETU for Jan 1, 1990
      expect(validateFinnishHetu('010190-123M')).toBe(true);
    });
  });

  describe('invalid format', () => {
    it('should reject HETU with wrong length', () => {
      expect(validateFinnishHetu('131052-308')).toBe(false);
      expect(validateFinnishHetu('131052-308TT')).toBe(false);
      expect(validateFinnishHetu('')).toBe(false);
    });

    it('should reject HETU with invalid separator', () => {
      // X is valid, so let's use G which is invalid
      expect(validateFinnishHetu('131052G308T')).toBe(false);
      expect(validateFinnishHetu('131052/308T')).toBe(false);
    });

    it('should reject HETU with non-numeric date parts', () => {
      expect(validateFinnishHetu('AB1052-308T')).toBe(false);
      expect(validateFinnishHetu('13AB52-308T')).toBe(false);
    });

    it('should reject HETU with non-numeric individual number', () => {
      expect(validateFinnishHetu('131052-A08T')).toBe(false);
    });
  });

  describe('invalid check character', () => {
    it('should reject HETU with wrong check character', () => {
      // 131052-308T is valid, so 131052-308A should be invalid
      expect(validateFinnishHetu('131052-308A')).toBe(false);
      expect(validateFinnishHetu('131052-308X')).toBe(false);
      expect(validateFinnishHetu('131052-3081')).toBe(false);
    });
  });

  describe('invalid dates', () => {
    it('should reject HETU with invalid day', () => {
      // Day 32 doesn't exist
      expect(validateFinnishHetu('320190-123X')).toBe(false);
      // Day 00 doesn't exist
      expect(validateFinnishHetu('000190-123X')).toBe(false);
    });

    it('should reject HETU with invalid month', () => {
      // Month 13 doesn't exist
      expect(validateFinnishHetu('011390-123X')).toBe(false);
      // Month 00 doesn't exist
      expect(validateFinnishHetu('010090-123X')).toBe(false);
    });

    it('should reject HETU with Feb 30', () => {
      expect(validateFinnishHetu('300290-123X')).toBe(false);
    });

    it('should reject HETU with Feb 29 on non-leap year', () => {
      // 1990 was not a leap year
      expect(validateFinnishHetu('290290-123X')).toBe(false);
    });

    it('should accept HETU with Feb 29 on leap year', () => {
      // 2000 was a leap year
      // 290200 + 123
      // 290200123 % 31 = 9
      // chars[9] = '9'
      expect(validateFinnishHetu('290200A1239')).toBe(true);
    });
  });

  describe('test IDs', () => {
    it('should reject test ID by default', () => {
      // 900 series individual number
      expect(validateFinnishHetu('010101-900R')).toBe(false);
    });

    it('should accept test ID when allowed', () => {
      expect(validateFinnishHetu('010101-900R', { allowTestIds: true })).toBe(true);
    });
  });

  describe('whitespace', () => {
    it('should trim whitespace by default', () => {
       expect(validateFinnishHetu('  131052-308T  ')).toBe(true);
    });

    it('should fail if whitespace exists and trimInput is false', () => {
       expect(validateFinnishHetu('  131052-308T  ', { trimInput: false })).toBe(false);
    });
  });

  describe('future dates', () => {
    it('should reject HETU with birth date in the future', () => {
      // This test might be brittle if run after 2050 or 2099, but for now it's fine.
      // 2099
      expect(validateFinnishHetu('010199A123X')).toBe(false);
    });
  });
});