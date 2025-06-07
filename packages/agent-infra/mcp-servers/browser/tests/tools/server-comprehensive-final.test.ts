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

describe('Server Comprehensive Final Coverage', () => {
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
          <head><title>Server Final Test</title></head>
          <body>
            <h1>Server Final Test</h1>
            <button id="testButton">Test Button</button>
            <input type="text" id="testInput" value="test" />
            <select id="testSelect">
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
            <div id="testDiv">Test Div</div>
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
            <h1>Page 2</h1>
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
    await client.close();
  });

  describe('server.ts comprehensive tool coverage', () => {
    test('should handle browser_navigate tool', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_go_back tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: `${baseUrl}/page2`,
        },
      });

      const result = await client.callTool({
        name: 'browser_go_back',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_go_forward tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: `${baseUrl}/page2`,
        },
      });

      await client.callTool({
        name: 'browser_go_back',
        arguments: {},
      });

      const result = await client.callTool({
        name: 'browser_go_forward',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_click tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {
          selector: '#testButton',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_form_input_fill tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_form_input_fill',
        arguments: {
          selector: '#testInput',
          value: 'test value',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_select tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_select',
        arguments: {
          selector: '#testSelect',
          value: '2',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_hover tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {
          selector: '#testDiv',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_screenshot tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_get_clickable_elements tool', async () => {
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

    test('should handle browser_get_html tool', async () => {
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
      expect(Array.isArray(result.content)).toBe(true);
    });
  });
});
