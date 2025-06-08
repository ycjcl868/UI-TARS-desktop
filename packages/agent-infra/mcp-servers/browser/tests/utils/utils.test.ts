import { describe, test, expect } from 'vitest';
import {
  validateSelectorOrIndex,
  parseProxyUrl,
  parseViewportSize,
  parserFactor,
  defineTools,
  delay,
  delayReject,
} from '../../src/utils/utils.js';

describe('Utility Functions', () => {
  describe('validateSelectorOrIndex', () => {
    test('should return true when selector is provided', () => {
      const result = validateSelectorOrIndex({ selector: '#test' });
      expect(result).toBe(true);
    });

    test('should return true when index is provided', () => {
      const result = validateSelectorOrIndex({ index: 0 });
      expect(result).toBe(true);
    });

    test('should return true when both selector and index are provided', () => {
      const result = validateSelectorOrIndex({ selector: '#test', index: 0 });
      expect(result).toBe(true);
    });

    test('should return false when neither selector nor index is provided', () => {
      const result = validateSelectorOrIndex({});
      expect(result).toBe(false);
    });

    test('should return false when args is undefined', () => {
      const result = validateSelectorOrIndex(undefined as any);
      expect(result).toBe(false);
    });

    test('should return false when index is undefined and selector is undefined', () => {
      const result = validateSelectorOrIndex({
        index: undefined,
        selector: undefined,
      });
      expect(result).toBe(false);
    });
  });

  describe('parseProxyUrl', () => {
    test('should parse valid proxy URL with username and password', () => {
      const result = parseProxyUrl('user-pass-testserver');
      expect(result).toEqual({
        username: 'user',
        password: 'pass',
      });
    });

    test('should parse proxy URL without credentials', () => {
      const result = parseProxyUrl('proxy-server-8080');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should handle malformed URLs gracefully', () => {
      const result = parseProxyUrl('invalid-url');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should parse proxy URL with @ symbol in fallback mode', () => {
      const result = parseProxyUrl('user-pass-testserver');
      expect(result.username).toBe('user');
      expect(result.password).toBe('pass');
    });

    test('should handle empty proxy URL', () => {
      const result = parseProxyUrl('');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should handle proxy URL with only username', () => {
      const result = parseProxyUrl('user-testserver');
      expect(result.username).toBe('user');
      expect(result.password).toBe('');
    });
  });

  describe('parseViewportSize', () => {
    test('should parse valid viewport size string', () => {
      const result = parseViewportSize('1920,1080');
      expect(result).toEqual({
        width: 1920,
        height: 1080,
      });
    });

    test('should handle invalid viewport size string', () => {
      const result = parseViewportSize('invalid');
      expect(result).toEqual({ width: undefined, height: undefined });
    });

    test('should handle empty viewport size string', () => {
      const result = parseViewportSize('');
      expect(result).toBeUndefined();
    });

    test('should handle non-string input', () => {
      const result = parseViewportSize(null as any);
      expect(result).toBeUndefined();
    });

    test('should filter out NaN values', () => {
      const result = parseViewportSize('1920,abc');
      expect(result).toEqual({ width: 1920, height: undefined });
    });

    test('should handle single number', () => {
      const result = parseViewportSize('1920');
      expect(result).toEqual({ width: 1920, height: undefined });
    });
  });

  describe('parserFactor', () => {
    test('should parse valid factor string with two values', () => {
      const result = parserFactor('0.5,0.8');
      expect(result).toEqual([0.5, 0.8]);
    });

    test('should parse valid factor string with single value', () => {
      const result = parserFactor('0.5');
      expect(result).toEqual([0.5, 0.5]);
    });

    test('should handle invalid factor string', () => {
      const result = parserFactor('invalid');
      expect(result).toEqual([undefined, undefined]);
    });

    test('should handle empty factor string', () => {
      const result = parserFactor('');
      expect(result).toBeUndefined();
    });

    test('should handle non-string input', () => {
      const result = parserFactor(null as any);
      expect(result).toBeUndefined();
    });

    test('should filter out NaN values', () => {
      const result = parserFactor('0.5,abc');
      expect(result).toEqual([0.5, 0.5]);
    });
  });

  describe('defineTools', () => {
    test('should return the same tools object', () => {
      const tools = {
        tool1: { description: 'Test tool 1' },
        tool2: { description: 'Test tool 2' },
      };
      const result = defineTools(tools);
      expect(result).toBe(tools);
    });

    test('should handle empty tools object', () => {
      const tools = {};
      const result = defineTools(tools);
      expect(result).toBe(tools);
    });
  });

  describe('delay', () => {
    test('should resolve after specified time', async () => {
      const start = Date.now();
      await delay(100);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(90);
    });

    test('should handle zero delay', async () => {
      const start = Date.now();
      await delay(0);
      const end = Date.now();
      expect(end - start).toBeLessThan(50);
    });
  });

  describe('delayReject', () => {
    test('should reject after specified time', async () => {
      const start = Date.now();
      try {
        await delayReject(100);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(90);
        expect(error).toBe(false);
      }
    });

    test('should handle zero delay rejection', async () => {
      const start = Date.now();
      try {
        await delayReject(0);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        const end = Date.now();
        expect(end - start).toBeLessThan(50);
        expect(error).toBe(false);
      }
    });
  });
});
