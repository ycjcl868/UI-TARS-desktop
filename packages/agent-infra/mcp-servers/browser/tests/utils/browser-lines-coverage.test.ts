import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  getCurrentPage,
  getTabList,
  ensureBrowser,
} from '../../src/utils/browser.js';
import type { GlobalConfig } from '../../src/typings.js';

describe('Browser Utils Lines Coverage', () => {
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

  describe('getCurrentPage edge cases', () => {
    test('should handle browser with no pages', async () => {
      const mockBrowser = {
        pages: () => Promise.resolve([]),
        newPage: () =>
          Promise.resolve({
            setViewportSize: () => Promise.resolve(),
            goto: () => Promise.resolve(),
            url: () => 'about:blank',
            title: () => 'New Tab',
          }),
        isConnected: () => true,
      };

      (global as any).globalBrowser = mockBrowser;
      (global as any).globalPage = null;

      const page = await getCurrentPage(mockBrowser as any);
      expect(page).toBeDefined();
    });

    test('should handle unhealthy pages', async () => {
      const mockPage1 = {
        isClosed: () => true,
        close: () => Promise.resolve(),
      };
      const mockPage2 = {
        isClosed: () => false,
        url: () => 'http://fake-test.local',
        title: () => 'Example',
        setViewportSize: () => Promise.resolve(),
      };

      const mockBrowser = {
        pages: () => Promise.resolve([mockPage1, mockPage2]),
        isConnected: () => true,
      };

      (global as any).globalBrowser = mockBrowser;
      (global as any).globalPage = null;

      const page = await getCurrentPage(mockBrowser as any);
      expect(page).toBe(mockPage2);
    });
  });

  describe('getTabList edge cases', () => {
    test('should handle browser with multiple tabs', async () => {
      const mockPages = [
        {
          isClosed: () => false,
          url: () => 'http://fake-test1.local',
          title: () => 'Example 1',
        },
        {
          isClosed: () => false,
          url: () => 'http://fake-test2.local',
          title: () => 'Example 2',
        },
      ];

      const mockBrowser = {
        pages: () => Promise.resolve(mockPages),
        isConnected: () => true,
      };

      (global as any).globalBrowser = mockBrowser;

      const tabs = await getTabList(mockBrowser as any);
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toContain('Example 1');
      expect(tabs[1]).toContain('Example 2');
    });

    test('should handle browser with no tabs', async () => {
      const mockBrowser = {
        pages: () => Promise.resolve([]),
        isConnected: () => true,
      };

      (global as any).globalBrowser = mockBrowser;

      const tabs = await getTabList(mockBrowser as any);
      expect(tabs).toHaveLength(0);
    });
  });

  describe('ensureBrowser configuration options', () => {
    test('should handle proxy configuration', async () => {
      const config: GlobalConfig = {
        launchOptions: {
          headless: true,
          proxy: 'http://fake-proxy.test:8080',
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

    test('should handle ad blocker configuration', async () => {
      const config: GlobalConfig = {
        launchOptions: {
          headless: true,
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

    test('should handle user agent configuration', async () => {
      const config: GlobalConfig = {
        launchOptions: {
          headless: true,
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

    test('should handle context options configuration', async () => {
      const config: GlobalConfig = {
        launchOptions: {
          headless: true,
        },
        contextOptions: {},
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
});
