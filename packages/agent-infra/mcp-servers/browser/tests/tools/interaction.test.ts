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

describe('Interaction Tools', () => {
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
            <input type="text" id="testInput" placeholder="Enter text" />
            <button id="testButton">Click Me</button>
            <select id="testSelect">
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
            <div id="hoverTarget">Hover over me</div>
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

  describe('browser_click', () => {
    test('should click element by selector successfully', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Clicked'),
        },
      ]);
    });

    test('should click element by index successfully', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {
          index: 0,
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle clicking non-existent elements', async () => {
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
    });

    test('should handle invalid selector formats', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {
          selector: '###invalid-selector',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should require either selector or index parameter', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {},
      });

      expect(result.isError).toEqual(true);
    });
  });

  describe('browser_form_input_fill', () => {
    test('should fill form inputs by selector', async () => {
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
          value: 'test input value',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Filled'),
        },
      ]);
    });

    test('should fill form inputs by index', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_form_input_fill',
        arguments: {
          index: 0,
          value: 'test input value',
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle filling non-existent form fields', async () => {
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
    });

    test('should handle special characters in input values', async () => {
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
          value: 'Special chars: !@#$%^&*()_+{}|:"<>?[]\\;\',./',
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should require value parameter', async () => {
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
        },
      });

      expect(result.isError).toEqual(true);
    });
  });

  describe('browser_select', () => {
    test('should select dropdown options by value', async () => {
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
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Selected'),
        },
      ]);
    });

    test('should select dropdown options by text', async () => {
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
          text: 'Option 1',
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle selecting from non-existent dropdowns', async () => {
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
          value: '1',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should handle selecting non-existent option values', async () => {
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
          value: 'nonExistentValue',
        },
      });

      expect(result.isError).toEqual(true);
    });

    test('should require either value or text parameter', async () => {
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
        },
      });

      expect(result.isError).toEqual(true);
    });
  });

  describe('browser_hover', () => {
    test('should hover over elements by selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {
          selector: '#hoverTarget',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Hovered'),
        },
      ]);
    });

    test('should hover over elements by index', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {
          index: 0,
        },
      });

      expect(result.isError).toEqual(false);
    });

    test('should handle hovering over non-existent elements', async () => {
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
    });

    test('should require either selector or index parameter', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {},
      });

      expect(result.isError).toEqual(true);
    });
  });
});
