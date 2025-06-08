import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  createServer,
  setConfig,
  setInitialBrowser,
  type GlobalConfig,
} from '../../src/server.js';
import { store } from '../../src/store.js';

describe('Server Configuration', () => {
  afterEach(() => {
    store.globalBrowser = null;
    store.globalPage = null;
    store.globalConfig = {
      vision: false,
      enableAdBlocker: false,
      launchOptions: {},
      contextOptions: {},
    } as GlobalConfig;
  });

  describe('createServer', () => {
    test('should create server with default config', () => {
      const server = createServer();
      expect(server).toBeDefined();
    });

    test('should create server with vision tools enabled', () => {
      const server = createServer({
        vision: true,
      } as GlobalConfig);
      expect(server).toBeDefined();
    });

    test('should create server with custom launch options', () => {
      const server = createServer({
        launchOptions: {
          headless: true,
          args: ['--no-sandbox'],
        },
      } as GlobalConfig);
      expect(server).toBeDefined();
    });

    test('should create server with ad blocker enabled', () => {
      const server = createServer({
        enableAdBlocker: true,
      } as GlobalConfig);
      expect(server).toBeDefined();
    });

    test('should create server with context options', () => {
      const server = createServer({
        contextOptions: {
          userAgent: 'Test User Agent',
        },
      } as GlobalConfig);
      expect(server).toBeDefined();
    });
  });

  describe('setConfig', () => {
    test('should set global config', () => {
      const config = {
        vision: true,
        enableAdBlocker: true,
      } as GlobalConfig;

      setConfig(config);

      expect(store.globalConfig.vision).toBe(true);
      expect(store.globalConfig.enableAdBlocker).toBe(true);
    });

    test('should merge with existing config', () => {
      store.globalConfig = {
        vision: false,
        enableAdBlocker: false,
        launchOptions: { headless: true },
        contextOptions: {},
      } as GlobalConfig;

      setConfig({
        vision: true,
      } as GlobalConfig);

      expect(store.globalConfig.vision).toBe(true);
      expect(store.globalConfig.launchOptions?.headless).toBe(true);
    });
  });

  describe('setInitialBrowser', () => {
    test('should set initial browser and page', () => {
      const mockBrowser = {} as any;
      const mockPage = {} as any;

      setInitialBrowser(mockBrowser, mockPage);

      expect(store.globalBrowser).toBe(mockBrowser);
      expect(store.globalPage).toBe(mockPage);
    });

    test('should handle undefined browser and page', () => {
      setInitialBrowser(undefined, undefined);

      expect(store.globalBrowser).toBeNull();
      expect(store.globalPage).toBeNull();
    });
  });
});
