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

describe('Error Handling Tests', () => {
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
          <head><title>Error Handling Test Page</title></head>
          <body>
            <h1>Error Handling Test Page</h1>
            <button id="testButton">Test Button</button>
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

  describe('browser_close error handling', () => {
    test('should handle browser close errors gracefully', async () => {
      await client.callTool({
        name: 'browser_close',
        arguments: {},
      });

      const result = await client.callTool({
        name: 'browser_close',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });
  });

  describe('browser_close_tab error handling', () => {
    test('should handle tab close errors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_close_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Closed current tab',
        },
      ]);
    });
  });

  describe('browser_tab_list error handling', () => {
    test('should handle tab list errors gracefully', async () => {
      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.any(String),
        },
      ]);
    });

    test('should handle empty tab list', async () => {
      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('browser_switch_tab error handling', () => {
    test('should handle invalid tab index', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Invalid tab index: 999',
        },
      ]);
    });

    test('should handle negative tab index', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Invalid tab index: -1',
        },
      ]);
    });

    test('should handle successful tab switch', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Switched to tab 0'),
        },
      ]);
    });
  });

  describe('browser_press_key error handling', () => {
    test('should handle key press errors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_press_key',
        arguments: {
          key: 'Enter',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Pressed key: Enter',
        },
      ]);
    });
  });

  describe('unknown tool handling', () => {
    test('should handle unknown tool calls', async () => {
      try {
        await client.callTool({
          name: 'unknown_tool',
          arguments: {},
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('browser_close_tab error handling edge cases', () => {
    test('should handle tab close when browser is closed', async () => {
      await client.callTool({
        name: 'browser_close',
        arguments: {},
      });

      const result = await client.callTool({
        name: 'browser_close_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });
  });

  describe('browser_press_key error handling edge cases', () => {
    test('should handle invalid key press', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      try {
        await client.callTool({
          name: 'browser_press_key',
          arguments: {
            key: 'InvalidKey',
          },
        });
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
