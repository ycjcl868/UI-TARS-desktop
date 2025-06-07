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

describe('Browser Utils Coverage', () => {
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
          <head><title>Browser Utils Test</title></head>
          <body>
            <h1>Browser Utils Test</h1>
            <form>
              <input type="text" id="textInput" />
              <select id="selectElement">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </form>
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

  describe('browser error handling paths', () => {
    test('should handle browser initialization errors', async () => {
      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: 'invalid://url',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle form input with invalid selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_form_input_fill',
        arguments: {
          selector: '#nonExistentInput',
          value: 'test value',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle click with invalid selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {
          selector: '#nonExistentElement',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle hover with invalid selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {
          selector: '#nonExistentElement',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle select with invalid selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_select',
        arguments: {
          selector: '#nonExistentSelect',
          value: 'option1',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle screenshot with invalid selector', async () => {
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
      expect(result.content).toBeDefined();
    });
  });

  describe('browser utility edge cases', () => {
    test('should handle multiple browser operations', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
        arguments: {},
      });

      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle browser close and reinitialize', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_close',
        arguments: {},
      });

      const result = await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });
});
