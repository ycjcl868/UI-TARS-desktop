import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer, type GlobalConfig } from '../../src/server.js';
import express from 'express';
import { AddressInfo } from 'net';

describe('Server Tools Coverage', () => {
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
          <head><title>Server Tools Test Page</title></head>
          <body>
            <h1>Server Tools Test Page</h1>
            <div id="content">Test content</div>
            <script>
              console.log('Test log message');
              console.error('Test error message');
              console.warn('Test warning message');
            </script>
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
    await client.close();
  });

  describe('browser_get_console_logs', () => {
    test('should capture console logs with different log levels', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await client.callTool({
        name: 'browser_get_console_logs',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle console logs when no logs exist', async () => {
      const result = await client.callTool({
        name: 'browser_get_console_logs',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('browser_get_clickable_elements', () => {
    test('should get clickable elements from page', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle clickable elements with selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {
          selector: 'div',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('browser_scroll', () => {
    test('should scroll page down', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'down',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Scrolled'),
        },
      ]);
    });

    test('should scroll page up', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'up',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Scrolled'),
        },
      ]);
    });

    test('should handle scroll with pixels', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'down',
          pixels: 100,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('browser_new_tab', () => {
    test('should create new tab', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'New tab created',
        },
      ]);
    });

    test('should create new tab with URL', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: baseUrl,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'New tab created',
        },
      ]);
    });
  });

  describe('buildDomTree coverage', () => {
    test('should handle DOM tree building', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_html',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });
});
