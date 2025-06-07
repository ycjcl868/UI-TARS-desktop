import {
  afterEach,
  beforeEach,
  beforeAll,
  afterAll,
  describe,
  expect,
  test,
} from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer, type GlobalConfig } from '../src/server';
import express from 'express';
import { AddressInfo } from 'net';

describe('Browser Utility Comprehensive Tests', () => {
  let client: Client;
  let app: express.Express;
  let httpServer: ReturnType<typeof app.listen>;
  let baseUrl: string;

  beforeAll(async () => {
    app = express();

    app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Utility Test Page</title></head>
          <body>
            <h1>Browser Utility Tests</h1>
            <div id="testDiv">Test content</div>
            <button id="testButton">Click me</button>
            <input type="text" id="testInput" value="initial value" />
            <select id="testSelect">
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
            </select>
            <a href="/page2" id="testLink">Test Link</a>
          </body>
        </html>
      `);
    });

    app.get('/page2', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Page 2</title></head>
          <body>
            <h1>Page 2 Content</h1>
            <p>This is page 2</p>
          </body>
        </html>
      `);
    });

    httpServer = app.listen(0);
    const address = httpServer.address() as AddressInfo;
    baseUrl = `http://localhost:${address.port}`;
  });

  afterAll(async () => {
    await httpServer.close();
  });

  beforeEach(async () => {
    client = new Client(
      {
        name: 'test client',
        version: '1.0',
      },
      {
        capabilities: {
          roots: {
            listChanged: true,
          },
        },
      },
    );

    const server = createServer({
      launchOptions: {
        headless: true,
      },
    } as GlobalConfig);

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  }, 20000);

  afterEach(async () => {
    try {
      await client.callTool({
        name: 'browser_close',
      });
    } catch (error) {
      console.warn('Error closing browser in afterEach:', error);
    }
    await client.close();
  }, 20000);

  describe('Browser Session Management', () => {
    test('should open browser session', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Navigated to');
    });

    test('should close browser session', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });

      const result = await client.callTool({
        name: 'browser_close',
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Closed browser');
    });
  });

  describe('Element Discovery', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should get clickable elements', async () => {
      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('button');
      expect((result.content as any)[0].text).toContain('Click me');
    });

    test('should get page text content', async () => {
      const result = await client.callTool({
        name: 'browser_get_text',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain(
        'Browser Utility Tests',
      );
      expect((result.content as any)[0].text).toContain('Test content');
    });

    test('should get page HTML content', async () => {
      const result = await client.callTool({
        name: 'browser_get_html',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain(
        '<title>Utility Test Page</title>',
      );
      expect((result.content as any)[0].text).toContain('id="testButton"');
    });
  });

  describe('Page Information', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should get page markdown content', async () => {
      const result = await client.callTool({
        name: 'browser_get_markdown',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain(
        'Browser Utility Tests',
      );
      expect((result.content as any)[0].text).toContain('Click me');
    });

    test('should read all links on page', async () => {
      const result = await client.callTool({
        name: 'browser_read_links',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Test Link');
      expect((result.content as any)[0].text).toContain('/page2');
    });
  });

  describe('JavaScript Evaluation', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should execute JavaScript and return result', async () => {
      const result = await client.callTool({
        name: 'browser_evaluate',
        arguments: {
          script: 'document.title',
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Utility Test Page');
    });

    test('should handle JavaScript errors gracefully', async () => {
      const result = await client.callTool({
        name: 'browser_evaluate',
        arguments: {
          script: 'nonExistentFunction()',
        },
      });
      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain(
        'Script execution failed',
      );
    });
  });

  describe('Scroll Operations', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should scroll page with amount', async () => {
      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          amount: 100,
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Scrolled');
    });

    test('should scroll to bottom of page', async () => {
      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Scrolled');
    });
  });

  describe('Error Handling', () => {
    test('should handle operations without browser session', async () => {
      const result = await client.callTool({
        name: 'browser_get_text',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toBeDefined();
    });

    test('should handle invalid JavaScript evaluation', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });

      const result = await client.callTool({
        name: 'browser_evaluate',
        arguments: {
          script: 'throw new Error("Test error")',
        },
      });
      expect(result.isError).toBe(true);
    }, 15000);
  });
});
