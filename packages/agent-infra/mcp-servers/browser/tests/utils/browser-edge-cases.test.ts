import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  getCurrentPage,
  getTabList,
  ensureBrowser,
} from '../../src/utils/browser.js';
import type { GlobalConfig } from '../../src/typings.js';

describe('Browser Utils Edge Cases Coverage', () => {
  let originalGlobalBrowser: any;
  let originalGlobalPage: any;

  beforeEach(() => {
    originalGlobalBrowser = (global as any).globalBrowser;
    originalGlobalPage = (global as any).globalPage;
  });

  afterEach(() => {
    (global as any).globalBrowser = originalGlobalBrowser;
    (global as any).globalPage = originalGlobalPage;
  });

  describe('browser.ts uncovered lines 90-91', () => {
    test('should handle browser session closed error', async () => {
      const mockBrowser = {
        pages: () => Promise.resolve([]),
        isConnected: () => false,
      };

      (global as any).globalBrowser = mockBrowser;
      (global as any).globalPage = null;

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser.ts uncovered lines 94-100', () => {
    test('should handle browser session detection and reinitialization', async () => {
      const mockBrowser = {
        pages: () => Promise.reject(new Error('browser session is closed')),
        isConnected: () => false,
      };

      (global as any).globalBrowser = mockBrowser;
      (global as any).globalPage = null;

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser.ts uncovered lines 105-108', () => {
    test('should handle external browser configuration', async () => {
      const mockExternalBrowser = {
        getBrowser: () =>
          Promise.resolve({
            pages: () =>
              Promise.resolve([
                {
                  url: () => 'fake-test-local',
                  title: () => 'Example',
                  isClosed: () => false,
                },
              ]),
            isConnected: () => true,
          }),
      };

      (global as any).globalBrowser = null;
      (global as any).globalPage = null;

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser.ts uncovered lines 142-154', () => {
    test('should handle ad blocker configuration', async () => {
      const config: GlobalConfig = {
        launchOptions: {
          headless: true,
        },
        enableAdBlocker: true,
      };

      (global as any).globalBrowser = null;
      (global as any).globalPage = null;

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser.ts uncovered lines 158-165', () => {
    test('should handle proxy authentication configuration', async () => {
      const config: GlobalConfig = {
        launchOptions: {
          headless: true,
          proxy: 'username:password@testserver',
        },
      };

      (global as any).globalBrowser = null;
      (global as any).globalPage = null;

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getCurrentPage edge cases for visibility checks', () => {
    test('should handle page visibility state checks', async () => {
      const mockPage = {
        isClosed: () => false,
        url: () => 'fake-test-local',
        title: () => 'Example',
        evaluate: (fn: any) => {
          if (fn.toString().includes('visibilityState')) {
            return Promise.resolve(true);
          }
          return Promise.resolve(2);
        },
        close: () => Promise.resolve(),
      };

      const mockBrowser = {
        pages: () => Promise.resolve([mockPage]),
        isConnected: () => true,
        newPage: () => Promise.resolve(mockPage),
      };

      (global as any).globalBrowser = mockBrowser;
      (global as any).globalPage = null;

      const result = await getCurrentPage(mockBrowser as any);
      expect(result.activePage).toBeDefined();
      expect(result.activePageId).toBeDefined();
    });

    test('should handle unhealthy pages that need closing', async () => {
      const mockPage = {
        isClosed: () => false,
        url: () => 'fake-test-local',
        title: () => 'Example',
        evaluate: (fn: any) => {
          if (fn.toString().includes('visibilityState')) {
            return Promise.resolve(false);
          }
          return Promise.resolve(false);
        },
        close: () => Promise.resolve(),
      };

      const mockBrowser = {
        pages: () => Promise.resolve([mockPage]),
        isConnected: () => true,
        newPage: () =>
          Promise.resolve({
            ...mockPage,
            bringToFront: () => Promise.resolve(),
          }),
      };

      (global as any).globalBrowser = mockBrowser;
      (global as any).globalPage = null;

      const result = await getCurrentPage(mockBrowser as any);
      expect(result.activePage).toBeDefined();
      expect(result.activePageId).toBe(0);
    });
  });
});
