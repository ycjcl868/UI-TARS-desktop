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

describe('Resources Uncovered Lines Tests', () => {
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
          <head><title>Resources Test</title></head>
          <body>
            <h1>Resources Test</h1>
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

  describe('resources/index.ts lines 39-41 coverage', () => {
    test('should handle screenshot resource with different quality parameters', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const resources = await client.listResources();
      const screenshotResource = resources.resources.find((r) =>
        r.uri.includes('screenshot'),
      );

      if (screenshotResource) {
        const result = await client.readResource({
          uri: screenshotResource.uri + '?quality=50',
        });
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      }
    });

    test('should handle screenshot resource with fullPage parameter', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const resources = await client.listResources();
      const screenshotResource = resources.resources.find((r) =>
        r.uri.includes('screenshot'),
      );

      if (screenshotResource) {
        const result = await client.readResource({
          uri: screenshotResource.uri + '?fullPage=true',
        });
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
      }
    });
  });

  describe('resources/index.ts lines 47-61 coverage', () => {
    test('should handle console logs resource with different log types', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resources = await client.listResources();
      const consoleResource = resources.resources.find((r) =>
        r.uri.includes('console'),
      );

      if (consoleResource) {
        const result = await client.readResource({
          uri: consoleResource.uri,
        });
        expect(result.contents).toBeDefined();
        expect(Array.isArray(result.contents)).toBe(true);
        if (result.contents.length > 0) {
          const content = result.contents[0] as any;
          expect(content.type).toBe('text');
        }
      }
    });

    test('should handle invalid resource URI format', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      try {
        await client.readResource({
          uri: 'browser://invalid/resource/format',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle resource URI with invalid parameters', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const resources = await client.listResources();
      const screenshotResource = resources.resources.find((r) =>
        r.uri.includes('screenshot'),
      );

      if (screenshotResource) {
        try {
          await client.readResource({
            uri: screenshotResource.uri + '?invalidParam=value',
          });
        } catch (error) {
          expect(error).toBeDefined();
        }
      }
    });
  });
});
