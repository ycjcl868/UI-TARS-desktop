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

describe('Server Coverage Tests', () => {
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
          <head><title>Server Coverage Test</title></head>
          <body>
            <h1>Server Coverage Test</h1>
            <form>
              <input type="text" id="textInput" />
              <select id="selectElement">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
            </form>
            <script>
              console.log('Test log');
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

  describe('browser navigation tools', () => {
    test('should handle browser_go_back', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: `${baseUrl}?page=2`,
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
          text: 'Navigated back',
        },
      ]);
    });

    test('should handle browser_go_forward', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: `${baseUrl}?page=2`,
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
          text: 'Navigated forward',
        },
      ]);
    });
  });

  describe('browser key press tools', () => {
    test('should handle browser_press_key with Enter', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_press_key',
        arguments: {
          key: 'Enter',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Pressed key: Enter',
        },
      ]);
    });

    test('should handle browser_press_key with Tab', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_press_key',
        arguments: {
          key: 'Tab',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Pressed key: Tab',
        },
      ]);
    });

    test('should handle browser_press_key with Escape', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_press_key',
        arguments: {
          key: 'Escape',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Pressed key: Escape',
        },
      ]);
    });
  });

  describe('browser tab management tools', () => {
    test('should handle browser_new_tab with URL', async () => {
      const result = await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: baseUrl,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: `Opened new tab with URL: ${baseUrl}`,
        },
      ]);
    });

    test('should handle browser_close_tab', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_close_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Closed current tab',
        },
      ]);
    });

    test('should handle browser_close_tab with index', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_close_tab',
        arguments: {
          index: 1,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Closed current tab',
        },
      ]);
    });

    test('should handle browser_switch_tab', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_new_tab',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {
          index: 0,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Switched to tab 0'),
        },
      ]);
    });
  });

  describe('browser information tools', () => {
    test('should handle browser_get_clickable_elements', async () => {
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
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
    });

    test('should handle browser_get_clickable_elements with selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {
          selector: 'input',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_scroll down', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'down',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Scrolled'),
        },
      ]);
    });

    test('should handle browser_scroll up', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'up',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: expect.stringContaining('Scrolled'),
        },
      ]);
    });

    test('should handle browser_scroll with pixels', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_scroll',
        arguments: {
          direction: 'down',
          pixels: 100,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('browser interaction tools', () => {
    test('should handle browser_form_input_fill', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_form_input_fill',
        arguments: {
          selector: '#textInput',
          value: 'test value',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_select', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_select',
        arguments: {
          selector: '#selectElement',
          value: 'option1',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_click', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {
          selector: '#textInput',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_hover', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {
          selector: '#textInput',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('browser utility tools', () => {
    test('should handle browser_close', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_close',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Closed browser',
        },
      ]);
    });

    test('should handle browser_tab_list', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_tab_list',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });
});
