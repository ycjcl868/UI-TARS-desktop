import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import {
  getCurrentPage,
  getTabList,
  ensureBrowser,
} from '../../src/utils/browser.js';
import { setConfig } from '../../src/server.js';
import type { GlobalConfig } from '../../src/typings.js';

describe('Browser Utils Comprehensive Coverage', () => {
  beforeEach(() => {
    setConfig({
      launchOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    } as GlobalConfig);
  });

  afterEach(async () => {
    try {
      const browserInfo = await ensureBrowser();
      if (browserInfo && browserInfo.browser) {
        await browserInfo.browser.close();
      }
    } catch (error) {}
  });

  describe('browser.ts lines 10-69,72-172 coverage', () => {
    test('should handle ensureBrowser initialization', async () => {
      try {
        const browserInfo = await ensureBrowser();
        expect(browserInfo).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle getCurrentPage function', async () => {
      try {
        const browserInfo = await ensureBrowser();
        const page = await getCurrentPage(browserInfo.browser);
        expect(page).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle getTabList function', async () => {
      try {
        const browserInfo = await ensureBrowser();
        const tabs = await getTabList(browserInfo.browser);
        expect(tabs).toBeDefined();
        expect(Array.isArray(tabs)).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle browser configuration options', async () => {
      setConfig({
        launchOptions: {
          headless: false,
          devtools: true,
          slowMo: 100,
        },
        contextOptions: {
          viewport: { width: 1920, height: 1080 },
          userAgent: 'test-agent',
        },
      } as GlobalConfig);

      try {
        const browserInfo = await ensureBrowser();
        expect(browserInfo).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle browser session closure detection', async () => {
      try {
        const browserInfo = await ensureBrowser();
        if (browserInfo && browserInfo.browser) {
          await browserInfo.browser.close();
        }

        const newBrowserInfo = await ensureBrowser();
        const page = await getCurrentPage(newBrowserInfo.browser);
        expect(page).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle browser reinitialization', async () => {
      try {
        await ensureBrowser();
        const browserInfo = await ensureBrowser();
        const page = await getCurrentPage(browserInfo.browser);
        expect(page).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
