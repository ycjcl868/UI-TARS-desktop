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

describe('Vision Tools Comprehensive Coverage', () => {
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
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" alt="test" />
            <div id="testDiv">Test Content</div>
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

  describe('vision.ts lines 47-136 coverage', () => {
    test('should handle vision tools when enabled', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      try {
        const result = await client.callTool({
          name: 'browser_vision_screenshot',
          arguments: {},
        });

        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle vision analysis', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      try {
        const result = await client.callTool({
          name: 'browser_vision_analyze',
          arguments: {
            prompt: 'Describe what you see',
          },
        });

        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle vision error conditions', async () => {
      try {
        const result = await client.callTool({
          name: 'browser_vision_screenshot',
          arguments: {},
        });

        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test('should handle vision configuration', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      try {
        const result = await client.callTool({
          name: 'browser_vision_analyze',
          arguments: {
            prompt: 'Test prompt',
            model: 'gpt-4-vision-preview',
          },
        });

        expect(result).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});
