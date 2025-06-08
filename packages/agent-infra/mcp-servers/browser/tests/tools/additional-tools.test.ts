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

describe('Additional Browser Tools', () => {
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
          <head><title>Additional Tools Test Page</title></head>
          <body>
            <h1>Additional Tools Test Page</h1>
            <div style="height: 2000px;">Long content for scrolling</div>
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
          amount: 500,
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

    test('should handle negative scroll amounts', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          amount: -500,
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
  });

  describe('browser_new_tab', () => {
    test('should open new tab with URL', async () => {
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
          text: expect.stringContaining('Opened new tab'),
        },
      ]);
    });

    test('should handle new tab creation errors', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: 'invalid-url',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Failed to open new tab'),
        },
      ]);
    });
  });

  describe('browser_close', () => {
    test('should close browser successfully', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_close',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Closed browser',
        },
      ]);
    });

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

  describe('browser_close_tab', () => {
    test('should close current tab', async () => {
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

    test('should handle closing tab when multiple tabs exist', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
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

  describe('browser_press_key', () => {
    test('should press key successfully', async () => {
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

    test('should handle special key combinations', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_press_key',
        arguments: {
          key: 'Tab',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Pressed key: Tab',
        },
      ]);
    });
  });

  describe('browser_switch_tab', () => {
    test('should switch between tabs successfully', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
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
          text: expect.stringContaining('Switched to tab'),
        },
      ]);
    });
  });
});
