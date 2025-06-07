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
  let httpServer: any;
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
  });

  afterEach(async () => {
    await client.callTool({
      name: 'browser_close',
    });
    await client.close();
  });

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
      expect((result.content as any)[0].text).toContain('Browser closed');
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
      expect((result.content as any)[0].text).toContain('testButton');
    });

    test('should get input elements', async () => {
      const result = await client.callTool({
        name: 'browser_get_input_elements',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('input');
      expect((result.content as any)[0].text).toContain('testInput');
    });

    test('should get select elements', async () => {
      const result = await client.callTool({
        name: 'browser_get_select_elements',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('select');
      expect((result.content as any)[0].text).toContain('testSelect');
    });
  });

  describe('Page Information', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should get current URL', async () => {
      const result = await client.callTool({
        name: 'browser_get_url',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain(baseUrl);
    });

    test('should get page title', async () => {
      const result = await client.callTool({
        name: 'browser_get_title',
        arguments: {},
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Utility Test Page');
    });
  });

  describe('Wait Operations', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should wait for element to be visible', async () => {
      const result = await client.callTool({
        name: 'browser_wait_for_element',
        arguments: {
          selector: '#testDiv',
          timeout: 5000,
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Element found');
    });

    test('should handle timeout when waiting for non-existent element', async () => {
      const result = await client.callTool({
        name: 'browser_wait_for_element',
        arguments: {
          selector: '#nonExistentElement',
          timeout: 1000,
        },
      });
      expect(result.isError).toBe(true);
      expect((result.content as any)[0].text).toContain('Timeout');
    });
  });

  describe('Scroll Operations', () => {
    beforeEach(async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });
    });

    test('should scroll page down', async () => {
      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'down',
          amount: 100,
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Scrolled');
    });

    test('should scroll page up', async () => {
      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'up',
          amount: 100,
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Scrolled');
    });

    test('should scroll to element', async () => {
      const result = await client.callTool({
        name: 'browser_scroll_to_element',
        arguments: {
          selector: '#testButton',
        },
      });
      expect(result.isError).toBe(false);
      expect((result.content as any)[0].text).toContain('Scrolled to element');
    });
  });

  describe('Error Handling', () => {
    test('should handle operations without browser session', async () => {
      const result = await client.callTool({
        name: 'browser_get_text',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      expect(result.isError).toBe(true);
    });

    test('should handle invalid tool arguments', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: { url: baseUrl },
      });

      const result = await client.callTool({
        name: 'browser_wait_for_element',
        arguments: {
          timeout: -1,
        },
      });
      expect(result.isError).toBe(true);
    });
  });
});
