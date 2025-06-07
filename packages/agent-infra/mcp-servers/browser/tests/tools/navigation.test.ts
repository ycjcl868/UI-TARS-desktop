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

describe('Navigation Tools', () => {
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
            <a href="/page2">Go to Page 2</a>
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
            <a href="/">Back to Home</a>
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

  describe('browser_navigate', () => {
    test('should navigate to valid URL successfully', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Navigated to'),
        },
      ]);
    });

    test('should handle invalid URLs gracefully', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: 'invalid-url',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Invalid URL'),
        },
      ]);
    });

    test('should handle network errors during navigation', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: 'http://non-existent-domain-12345.com',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should require URL parameter', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {},
      });

      expect(result.isError).toEqual(true);
    });
  });

  describe('browser_go_back', () => {
    test('should navigate back in browser history', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Navigated back'),
        },
      ]);
    });

    test('should handle going back when no history exists', async () => {
      const result = await client.callTool({
        name: 'browser_go_back',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });
  });

  describe('browser_go_forward', () => {
    test('should navigate forward in browser history', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Navigated forward'),
        },
      ]);
    });

    test('should handle going forward when no forward history exists', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_go_forward',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });
  });
});
