import { describe, test, expect } from 'vitest';
import { parseProxyUrl, delayReject } from '../../src/utils/utils.js';

describe('Utils Coverage Tests', () => {
  describe('parseProxyUrl function', () => {
    test('should parse proxy URL with username and password', () => {
      const result = parseProxyUrl('username:password@proxy-server-8080');
      expect(result).toEqual({
        username: 'username',
        password: 'password',
      });
    });

    test('should parse proxy URL without credentials', () => {
      const result = parseProxyUrl('proxy-server-8080');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should handle malformed proxy URL', () => {
      const result = parseProxyUrl('invalid-url');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should handle empty proxy URL', () => {
      const result = parseProxyUrl('');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });
  });

  describe('delayReject function', () => {
    test('should reject after specified delay', async () => {
      const startTime = Date.now();
      await expect(delayReject(100)).rejects.toThrow();
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
    });

    test('should reject immediately with zero delay', async () => {
      await expect(delayReject(0)).rejects.toThrow();
    });
  });
});
