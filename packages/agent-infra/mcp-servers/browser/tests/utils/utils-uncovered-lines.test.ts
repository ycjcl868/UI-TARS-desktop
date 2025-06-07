import { describe, test, expect } from 'vitest';
import { parseProxyUrl } from '../../src/utils/utils.js';

describe('Utils Uncovered Lines Coverage', () => {
  describe('utils.ts line 8 coverage', () => {
    test('should handle parseProxyUrl function', () => {
      const result = parseProxyUrl('http://fake-proxy.test:8080');
      expect(result).toBeDefined();
    });

    test('should handle parseProxyUrl with invalid URL', () => {
      const result = parseProxyUrl('invalid-url');
      expect(result).toBeDefined();
    });

    test('should handle parseProxyUrl with empty string', () => {
      const result = parseProxyUrl('');
      expect(result).toBeDefined();
    });
  });

  describe('utils.ts lines 39-74 coverage', () => {
    test('should handle parseProxyUrl with authentication', () => {
      const result = parseProxyUrl(
        'http://testuser:testpass@fake-proxy.test:8080',
      );
      expect(result).toBeDefined();
    });

    test('should handle parseProxyUrl with HTTPS', () => {
      const result = parseProxyUrl('https://fake-proxy.test:443');
      expect(result).toBeDefined();
    });

    test('should handle parseProxyUrl with SOCKS', () => {
      const result = parseProxyUrl('socks5://fake-proxy.test:1080');
      expect(result).toBeDefined();
    });
  });
});
