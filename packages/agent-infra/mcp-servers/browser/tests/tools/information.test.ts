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

describe('Information Tools', () => {
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
            <button id="clickableButton">Clickable Button</button>
            <a href="/page2" id="clickableLink">Clickable Link</a>
            <div id="content">Page content for HTML extraction</div>
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

  describe('browser_screenshot', () => {
    test('should take full page screenshot successfully', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'image',
          data: expect.any(String),
          mimeType: 'image/png',
        },
      ]);
    });

    test('should take element screenshot by selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {
          selector: '#clickableButton',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'image',
          data: expect.any(String),
          mimeType: 'image/png',
        },
      ]);
    });

    test('should handle screenshot with custom dimensions', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {
          width: 800,
          height: 600,
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle screenshot of non-existent elements', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {
          selector: '#nonExistentElement',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle invalid screenshot dimensions', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {
          width: -100,
          height: -100,
        },
      });

      expect(result.isError).toEqual(true);
    });
  });

  describe('browser_get_clickable_elements', () => {
    test('should retrieve all clickable elements on page', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('clickable elements'),
        },
      ]);
    });

    test('should handle pages with no clickable elements', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: 'data:text/html,<html><body><p>No clickable elements</p></body></html>',
        },
      });

      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle browser not initialized', async () => {
      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });
  });

  describe('browser_get_html', () => {
    test('should get full page HTML content', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('<html>'),
        },
      ]);
    });

    test('should get HTML content of specific elements', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_html',
        arguments: {
          selector: '#content',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Page content for HTML extraction'),
        },
      ]);
    });

    test('should handle getting HTML from non-existent elements', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_html',
        arguments: {
          selector: '#nonExistentElement',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle getting HTML when browser not initialized', async () => {
      const result = await client.callTool({
        name: 'browser_get_html',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle invalid selector formats', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_html',
        arguments: {
          selector: '###invalid-selector',
        },
      });

      expect(result.isError).toEqual(true);
    });
  });
});
