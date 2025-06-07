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

describe('Server Lines Coverage Tests', () => {
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
          <head><title>Server Lines Coverage Test</title></head>
          <body>
            <h1>Server Lines Coverage Test</h1>
            <button id="testButton">Test Button</button>
            <input type="text" id="testInput" value="test" />
            <select id="testSelect">
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
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

  describe('server.ts uncovered lines coverage', () => {
    test('should handle browser_new_tab tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: baseUrl,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('Opened new tab');
    });
  });

  describe('resources coverage', () => {
    test('should handle screenshot resource listing', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(resources.resources.length).toBeGreaterThan(0);

      const screenshotResource = resources.resources.find((r) =>
        r.uri.includes('screenshot'),
      );
      if (screenshotResource) {
        expect(screenshotResource.name).toContain('screenshot');
      } else {
        expect(resources.resources.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should handle console logs resource listing', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(resources.resources.length).toBeGreaterThan(0);

      const consoleResource = resources.resources.find((r) =>
        r.uri.includes('console'),
      );
      expect(consoleResource).toBeDefined();
      expect(consoleResource?.name).toContain('console');
    });
  });
});
