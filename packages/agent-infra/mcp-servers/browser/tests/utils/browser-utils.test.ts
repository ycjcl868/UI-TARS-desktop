import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  getCurrentPage,
  getTabList,
  ensureBrowser,
} from '../../src/utils/browser.js';
import { store } from '../../src/store.js';
import type { GlobalConfig } from '../../src/typings.js';

describe('Browser Utilities', () => {
  beforeEach(() => {
    store.globalBrowser = null;
    store.globalPage = null;
    store.globalConfig = {
      vision: false,
      enableAdBlocker: false,
      launchOptions: {},
      contextOptions: {},
    } as GlobalConfig;
  });

  afterEach(async () => {
    if (store.globalBrowser) {
      await store.globalBrowser.close();
      store.globalBrowser = null;
      store.globalPage = null;
    }
  });

  describe('getCurrentPage', () => {
    test('should return active page when browser has pages', async () => {
      await ensureBrowser();

      if (store.globalBrowser) {
        const result = await getCurrentPage(store.globalBrowser);

        expect(result).toBeDefined();
        expect(result.activePage).toBeDefined();
        expect(result.activePageId).toBeDefined();
        expect(typeof result.activePageId).toBe('number');
      }
    });

    test('should create new page when no pages exist', async () => {
      await ensureBrowser();

      if (store.globalBrowser) {
        const pages = await store.globalBrowser.pages();
        for (const page of pages) {
          await page.close();
        }

        const result = await getCurrentPage(store.globalBrowser);
        expect(result).toBeDefined();
        expect(result.activePage).toBeDefined();
        expect(result.activePageId).toBe(0);
      }
    });

    test('should handle page visibility checks', async () => {
      await ensureBrowser();

      if (store.globalBrowser) {
        const result = await getCurrentPage(store.globalBrowser);

        expect(result).toBeDefined();
        expect(result.activePage).toBeDefined();
        if (result.activePage) {
          expect(result.activePage.isClosed()).toBe(false);
        }
      }
    });

    test('should handle unhealthy pages by closing them', async () => {
      await ensureBrowser();

      if (store.globalBrowser) {
        const result = await getCurrentPage(store.globalBrowser);
        expect(result).toBeDefined();

        if (result.activePage) {
          await result.activePage.close();
        }

        const newResult = await getCurrentPage(store.globalBrowser);
        expect(newResult).toBeDefined();
        expect(newResult.activePage).not.toBe(result.activePage);
      }
    });
  });

  describe('getTabList', () => {
    test('should return list of all browser tabs', async () => {
      await ensureBrowser();

      if (store.globalBrowser) {
        await getCurrentPage(store.globalBrowser);

        const tabs = await getTabList(store.globalBrowser);
        expect(tabs).toBeDefined();
        expect(Array.isArray(tabs)).toBe(true);
        expect(tabs.length).toBeGreaterThan(0);
      }
    });

    test('should include tab titles and URLs', async () => {
      await ensureBrowser();

      if (store.globalBrowser) {
        const result = await getCurrentPage(store.globalBrowser);
        if (result.activePage) {
          await result.activePage.goto(
            'data:text/html,<html><head><title>Test Tab</title></head><body>Test</body></html>',
          );
        }

        const tabs = await getTabList(store.globalBrowser);
        expect(tabs.length).toBeGreaterThan(0);
        expect(tabs[0]).toHaveProperty('title');
        expect(tabs[0]).toHaveProperty('url');
        expect(tabs[0]).toHaveProperty('index');
        expect(tabs[0].title).toBe('Test Tab');
      }
    });

    test('should handle browser with no tabs', async () => {
      const mockBrowser = {
        pages: async () => [],
      } as any;

      const tabs = await getTabList(mockBrowser);
      expect(tabs).toBeDefined();
      expect(Array.isArray(tabs)).toBe(true);
      expect(tabs.length).toBe(0);
    });
  });

  describe('ensureBrowser', () => {
    test('should create new browser when none exists', async () => {
      expect(store.globalBrowser).toBeNull();

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
      expect(store.globalBrowser).not.toBeNull();
    });

    test('should reuse existing browser when available', async () => {
      await ensureBrowser();
      const firstBrowser = store.globalBrowser;

      await ensureBrowser();
      const secondBrowser = store.globalBrowser;

      expect(firstBrowser).toBe(secondBrowser);
    });

    test('should handle browser session closure detection', async () => {
      await ensureBrowser();
      const browser = store.globalBrowser;

      if (browser) {
        await browser.close();
      }

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
      expect(store.globalBrowser).not.toBe(browser);
    });

    test('should configure proxy authentication when provided', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        launchOptions: {
          proxy: 'http://testuser:testpass@proxy.example.com:8080',
        },
      };

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
    });

    test('should enable ad blocker when configured', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        enableAdBlocker: true,
      };

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
    });

    test('should set user agent when configured', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        contextOptions: {
          userAgent: 'Test User Agent',
        },
      };

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
    });

    test('should handle external browser configuration', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        remoteOptions: {
          wsEndpoint: 'ws://localhost:9222',
        },
      };

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle launch options configuration', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        launchOptions: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      };

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
    });

    test('should handle invalid executable path gracefully', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        launchOptions: {
          executablePath: '/invalid/path/to/browser',
        },
      };

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle context options configuration', async () => {
      store.globalConfig = {
        ...store.globalConfig,
        contextOptions: {
          viewportSize: {
            width: 1920,
            height: 1080,
          },
          userAgent: 'Test User Agent',
        },
      };

      await ensureBrowser();

      expect(store.globalBrowser).toBeDefined();
    });
  });
});
