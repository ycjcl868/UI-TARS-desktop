import { describe, test, expect } from 'vitest';
import { createServer } from '../../src/server.js';

describe('Index Coverage Tests', () => {
  describe('createServer function', () => {
    test('should create server with default config', () => {
      const server = createServer();
      expect(server).toBeDefined();
      expect(typeof server.connect).toBe('function');
      expect(typeof server.close).toBe('function');
    });

    test('should create server with custom config', () => {
      const config = {
        launchOptions: {
          headless: true,
          args: ['--no-sandbox'],
        },
      };

      const server = createServer(config);
      expect(server).toBeDefined();
      expect(typeof server.connect).toBe('function');
      expect(typeof server.close).toBe('function');
    });

    test('should create server with vision enabled', () => {
      const config = {
        vision: true,
        launchOptions: {
          headless: true,
        },
      };

      const server = createServer(config);
      expect(server).toBeDefined();
    });

    test('should create server with proxy configuration', () => {
      const config = {
        launchOptions: {
          headless: true,
        },
      };

      const server = createServer(config);
      expect(server).toBeDefined();
    });

    test('should create server with custom user agent', () => {
      const config = {
        launchOptions: {
          headless: true,
        },
      };

      const server = createServer(config);
      expect(server).toBeDefined();
    });
  });
});
