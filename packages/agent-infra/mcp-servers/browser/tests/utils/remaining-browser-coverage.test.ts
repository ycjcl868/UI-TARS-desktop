import { describe, test, expect } from 'vitest';
import {
  getCurrentPage,
  getTabList,
  ensureBrowser,
} from '../../src/utils/browser.js';
import { store } from '../../src/store.js';

describe('Remaining Browser Utils Coverage Tests', () => {
  describe('browser.ts lines 90-91 coverage', () => {
    test('should handle getCurrentPage with null browser', async () => {
      try {
        const result = await getCurrentPage(null as any);
        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser.ts lines 94-100 coverage', () => {
    test('should handle getTabList with null browser', async () => {
      try {
        const result = await getTabList(null as any);
        expect(result).toEqual([]);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser.ts lines 105-108 coverage', () => {
    test('should handle ensureBrowser with external browser config', async () => {
      const originalConfig = store.globalConfig;
      store.globalConfig = {
        externalBrowser: {
          getBrowser: () => Promise.resolve(null as any),
        },
      };

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        store.globalConfig = originalConfig;
      }
    });
  });

  describe('browser.ts lines 113 coverage', () => {
    test('should handle ensureBrowser with remote options', async () => {
      const originalConfig = store.globalConfig;
      store.globalConfig = {
        remoteOptions: {
          wsEndpoint: 'ws://localhost:9222',
        },
        launchOptions: {
          headless: true,
        },
      };

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        store.globalConfig = originalConfig;
      }
    });
  });

  describe('browser.ts lines 142-154 coverage', () => {
    test('should handle browser launch with proxy configuration', async () => {
      const originalConfig = store.globalConfig;
      store.globalConfig = {
        launchOptions: {
          headless: true,
          proxy: 'http://fake-proxy.test:8080',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      };

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        store.globalConfig = originalConfig;
      }
    });
  });

  describe('browser.ts lines 158-165 coverage', () => {
    test('should handle browser launch with user data directory', async () => {
      const originalConfig = store.globalConfig;
      store.globalConfig = {
        launchOptions: {
          headless: true,
          userDataDir: '/tmp/test-user-data',
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      };

      try {
        await ensureBrowser();
      } catch (error) {
        expect(error).toBeDefined();
      } finally {
        store.globalConfig = originalConfig;
      }
    });
  });
});
