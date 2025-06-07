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

describe('Vision Tools', () => {
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
          <head><title>Vision Test Page</title></head>
          <body>
            <h1>Vision Test Page</h1>
            <button id="visionButton" style="position: absolute; top: 100px; left: 100px;">Vision Click Target</button>
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
      vision: true,
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

  describe('browser_vision_screen_capture', () => {
    test('should capture screen with vision capabilities', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {},
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[1]).toHaveProperty('type', 'image');
      expect(content[1]).toHaveProperty('mimeType', 'image/jpeg');
    });

    test('should handle vision capture without browser', async () => {
      const result = await client.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {},
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle screen capture with custom factors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {
          factor: '0.5',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle screen capture errors gracefully', async () => {
      const result = await client.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {},
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle invalid factor values', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {
          factor: 'invalid',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle zero and negative factor values', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {
          factor: '0',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });
  });

  describe('browser_vision_screen_click', () => {
    test('should click using vision coordinates', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '100,100',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Clicked'),
        },
      ]);
    });

    test('should handle coordinate normalization with factors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '50,50',
          factor: '0.5',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle invalid vision coordinates', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: 'invalid-coordinate',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle factor parsing edge cases', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '100,100',
          factor: 'invalid-factor',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should require coordinate parameter', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {},
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle coordinates outside viewport', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '9999,9999',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle negative coordinates', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '-10,-10',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();
    });

    test('should handle malformed coordinate formats', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '100',
        },
      });

      expect(result.isError).toEqual(true);
    });
  });
});
