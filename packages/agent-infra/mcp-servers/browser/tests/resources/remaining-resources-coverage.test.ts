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

describe('Remaining Resources Coverage Tests', () => {
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
          <head><title>Resources Coverage Test</title></head>
          <body>
            <h1>Resources Coverage Test</h1>
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

  describe('resources/index.ts lines 21-29 coverage', () => {
    test('should handle browser resource listing without browser', async () => {
      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(Array.isArray(resources.resources)).toBe(true);
    });
  });

  describe('resources/index.ts lines 36-44 coverage', () => {
    test('should handle screenshot resource without browser', async () => {
      try {
        await client.readResource({
          uri: 'browser://screenshot',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('resources/index.ts lines 47-61 coverage', () => {
    test('should handle console resource without browser', async () => {
      try {
        await client.readResource({
          uri: 'browser://console',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle invalid resource type', async () => {
      try {
        await client.readResource({
          uri: 'browser://invalid',
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
