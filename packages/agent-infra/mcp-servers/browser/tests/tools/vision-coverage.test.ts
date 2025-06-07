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

describe('Vision Coverage Tests', () => {
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
          <head><title>Vision Test</title></head>
          <body>
            <h1>Vision Test</h1>
            <button id="testButton">Test Button</button>
            <input type="text" id="testInput" value="test" />
            <div id="testDiv">Test Div</div>
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
      vision: true,
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

  describe('vision.ts lines 53-76 coverage', () => {
    test('should handle browser_vision_screen_capture', async () => {
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

      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[1]).toHaveProperty('type', 'image');
    });
  });

  describe('vision.ts lines 78-133 coverage', () => {
    test('should handle browser_vision_screen_click with valid coordinates', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          x: 100,
          y: 100,
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
    });

    test('should handle browser_vision_screen_click with factors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          x: 0.5,
          y: 0.5,
          factors: [1000, 1000],
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
    });

    test('should handle browser_vision_screen_click error case', async () => {
      const result = await client.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          x: -1,
          y: -1,
        },
      });

      expect(result.isError).toBeFalsy();
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
    });
  });
});
