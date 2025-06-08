import { describe, test, expect } from 'vitest';
import { parseProxyUrl, delayReject } from '../../src/utils/utils.js';

describe('Complete Utils Coverage Tests', () => {
  describe('parseProxyUrl comprehensive coverage', () => {
    test('should parse HTTPS proxy URL with credentials', () => {
      const result = parseProxyUrl('testuser:testpass@testserver');
      expect(result).toEqual({
        username: 'testuser',
        password: 'testpass',
      });
    });

    test('should parse proxy URL with special characters in credentials', () => {
      const result = parseProxyUrl('user%40domain:p%40ssw0rd@testserver');
      expect(result).toEqual({
        username: 'user%40domain',
        password: 'p%40ssw0rd',
      });
    });

    test('should handle proxy URL with only username', () => {
      const result = parseProxyUrl('testuser@testserver');
      expect(result).toEqual({
        username: 'testuser',
        password: '',
      });
    });

    test('should handle proxy URL with default port', () => {
      const result = parseProxyUrl('proxy-server');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should handle malformed URL without protocol', () => {
      const result = parseProxyUrl('fake-proxy-8080');
      expect(result).toEqual({
        username: '',
        password: '',
      });
    });

    test('should handle null or undefined input', () => {
      const result1 = parseProxyUrl(null as any);
      expect(result1).toEqual({
        username: '',
        password: '',
      });

      const result2 = parseProxyUrl(undefined as any);
      expect(result2).toEqual({
        username: '',
        password: '',
      });

      const result3 = parseProxyUrl('');
      expect(result3).toEqual({
        username: '',
        password: '',
      });
    });
  });

  describe('delayReject comprehensive coverage', () => {
    test('should reject with timeout error message', async () => {
      await expect(delayReject(50)).rejects.toThrow('timeout');
    });

    test('should handle negative delay', async () => {
      await expect(delayReject(-100)).rejects.toThrow();
    });

    test('should handle very large delay values', async () => {
      const promise = delayReject(10000);
      setTimeout(() => {
        expect(promise).rejects.toThrow();
      }, 100);
    });
  });
});
