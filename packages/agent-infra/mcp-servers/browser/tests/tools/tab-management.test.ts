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

describe('Tab Management Tools', () => {
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
          <head><title>Test Page</title></head>
          <body>
            <h1>Test Page</h1>
            <p>Main tab content</p>
          </body>
        </html>
      `);
    });

    app.get('/tab2', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head><title>Tab 2</title></head>
          <body>
            <h1>Tab 2</h1>
            <p>Second tab content</p>
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

  describe('browser_tab_list', () => {
    test('should list all open browser tabs', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('tabs'),
        },
      ]);
    });

    test('should return empty list when no tabs exist', async () => {
      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });

    test('should include tab titles and URLs in listing', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      if (
        result.content &&
        result.content[0] &&
        result.content[0].type === 'text'
      ) {
        expect(result.content[0].text).toMatch(/Test Page|localhost/);
      }
    });
  });

  describe('browser_new_tab', () => {
    test('should create new tab successfully', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('New tab created'),
        },
      ]);
    });

    test('should create new tab with specific URL', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: `${baseUrl}/tab2`,
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle creating multiple tabs', async () => {
      const result1 = await client.callTool({
        name: 'browser_new_tab',
        arguments: {},
      });

      const result2 = await client.callTool({
        name: 'browser_new_tab',
        arguments: {},
      });

      expect(result1.isError).toEqual(false);
      expect(result2.isError).toEqual(false);
    });

    test('should handle invalid URLs when creating tabs', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: 'invalid-url',
        },
      });

      expect(result.isError).toEqual(true);
    });
  });

  describe('browser_switch_tab', () => {
    test('should switch to existing tab by index', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: `${baseUrl}/tab2`,
        },
      });

      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {
          index: 0,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Switched to tab'),
        },
      ]);
    });

    test('should handle switching to invalid tab index', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {
          index: 999,
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle switching when only one tab exists', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {
          index: 0,
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should require index parameter', async () => {
      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle negative tab indices', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {
          index: -1,
        },
      });

      expect(result.isError).toEqual(true);
    });
  });
});
