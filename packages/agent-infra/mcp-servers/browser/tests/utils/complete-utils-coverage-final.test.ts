import { describe, test, expect } from 'vitest';
import {
  delayReject,
  validateSelectorOrIndex,
  parseViewportSize,
  parserFactor,
} from '../../src/utils/utils.js';

describe('Complete Utils Coverage Final Tests', () => {
  describe('utils.ts lines 19-25 coverage', () => {
    test('should handle delayReject function', async () => {
      const start = Date.now();
      try {
        await delayReject(50);
      } catch (error) {
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(40);
        expect(error).toBe(false);
      }
    });
  });

  describe('utils.ts lines 52-67 coverage', () => {
    test('should handle validateSelectorOrIndex with selector', () => {
      const result = validateSelectorOrIndex({ selector: '#test' });
      expect(result).toBe(true);
    });

    test('should handle validateSelectorOrIndex with index', () => {
      const result = validateSelectorOrIndex({ index: 0 });
      expect(result).toBe(true);
    });

    test('should handle validateSelectorOrIndex with both', () => {
      const result = validateSelectorOrIndex({ selector: '#test', index: 0 });
      expect(result).toBe(true);
    });

    test('should handle validateSelectorOrIndex with neither', () => {
      const result = validateSelectorOrIndex({});
      expect(result).toBe(false);
    });
  });

  describe('utils.ts lines 77-86 coverage', () => {
    test('should handle parseViewportSize with valid string', () => {
      const result = parseViewportSize('1920,1080');
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    test('should handle parseViewportSize with invalid string', () => {
      const result = parseViewportSize('invalid');
      expect(result).toEqual({ width: undefined, height: undefined });
    });

    test('should handle parseViewportSize with empty string', () => {
      const result = parseViewportSize('');
      expect(result).toBeUndefined();
    });
  });

  describe('utils.ts lines 89-98 coverage', () => {
    test('should handle parserFactor with valid string', () => {
      const result = parserFactor('1000,800');
      expect(result).toEqual([1000, 800]);
    });

    test('should handle parserFactor with invalid string', () => {
      const result = parserFactor('invalid');
      expect(result).toEqual([undefined, undefined]);
    });

    test('should handle parserFactor with empty string', () => {
      const result = parserFactor('');
      expect(result).toBeUndefined();
    });

    test('should handle parserFactor with single number', () => {
      const result = parserFactor('500');
      expect(result).toEqual([500, 500]);
    });
  });
});
