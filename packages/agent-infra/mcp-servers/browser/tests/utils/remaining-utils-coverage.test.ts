import { describe, test, expect } from 'vitest';
import { delay, parseProxyUrl } from '../../src/utils/utils.js';

describe('Remaining Utils Coverage Tests', () => {
  describe('utils.ts line 8 coverage', () => {
    test('should handle delay function', async () => {
      const start = Date.now();
      await delay(10);
      const end = Date.now();
      expect(end - start).toBeGreaterThanOrEqual(10);
    });
  });

  describe('utils.ts lines 42-43 coverage', () => {
    test('should handle parseProxyUrl with null input', () => {
      const result = parseProxyUrl(null as any);
      expect(result).toEqual({ username: '', password: '' });
    });

    test('should handle parseProxyUrl with undefined input', () => {
      const result = parseProxyUrl(undefined as any);
      expect(result).toEqual({ username: '', password: '' });
    });
  });

  describe('utils.ts lines 69-70 coverage', () => {
    test('should handle parseProxyUrl with malformed URL', () => {
      const result = parseProxyUrl('not-a-valid-url-at-all');
      expect(result).toEqual({ username: '', password: '' });
    });
  });
});
