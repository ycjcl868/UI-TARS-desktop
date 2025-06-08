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

describe('Comprehensive Coverage Tests', () => {
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
          <head><title>Comprehensive Test Page</title></head>
          <body>
            <h1>Comprehensive Test Page</h1>
            <form>
              <input type="text" id="textInput" value="initial" />
              <select id="selectElement">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
              </select>
              <button type="submit" id="submitButton">Submit</button>
            </form>
            <div id="clickableDiv" style="cursor: pointer;">Click me</div>
            <script>
              console.log('Page loaded');
              console.error('Test error');
              console.warn('Test warning');
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

  describe('server.ts coverage gaps', () => {
    test('should handle browser_go_back navigation', async () => {
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

    test('should handle browser_go_forward navigation', async () => {
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

    test('should handle browser_press_key with valid keys', async () => {
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

    test('should handle browser_press_key with Tab key', async () => {
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

    test('should handle browser_press_key with Escape key', async () => {
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

    test('should handle browser_close_tab', async () => {
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
        name: 'browser_close_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Tab closed',
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
        arguments: {},
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
          text: 'Tab closed',
        },
      ]);
    });

    test('should handle browser_switch_tab with valid index', async () => {
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
        name: 'browser_switch_tab',
        arguments: {
          index: 0,
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toEqual([
        {
          type: 'text',
          text: 'Switched to tab 0',
        },
      ]);
    });
  });

  describe('resources/index.ts coverage gaps', () => {
    test('should handle screenshot resource with browser not initialized', async () => {
      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(Array.isArray(resources.resources)).toBe(true);
    });

    test('should handle console log resource with browser not initialized', async () => {
      const resources = await client.listResources();
      expect(resources.resources).toBeDefined();
      expect(Array.isArray(resources.resources)).toBe(true);
    });

    test('should read screenshot resource after browser initialization', async () => {
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
          uri: screenshotResource.uri,
        });
        expect(result.contents).toBeDefined();
      }
    });

    test('should read console log resource after browser initialization', async () => {
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
      }
    });
  });

  describe('vision.ts coverage gaps', () => {
    test('should handle vision screen capture with factor', async () => {
      const visionClient = new Client(
        {
          name: 'vision test client',
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

      const visionServer = createServer({
        launchOptions: {
          headless: true,
        },
        vision: true,
      } as GlobalConfig);
      const [visionClientTransport, visionServerTransport] =
        InMemoryTransport.createLinkedPair();

      await Promise.all([
        visionClient.connect(visionClientTransport),
        visionServer.connect(visionServerTransport),
      ]);

      await visionClient.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await visionClient.callTool({
        name: 'browser_vision_screen_capture',
        arguments: {
          factor: '0.8',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();

      await visionClient.close();
    });

    test('should handle vision screen click with factor', async () => {
      const visionClient = new Client(
        {
          name: 'vision test client',
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

      const visionServer = createServer({
        launchOptions: {
          headless: true,
        },
        vision: true,
      } as GlobalConfig);
      const [visionClientTransport, visionServerTransport] =
        InMemoryTransport.createLinkedPair();

      await Promise.all([
        visionClient.connect(visionClientTransport),
        visionServer.connect(visionServerTransport),
      ]);

      await visionClient.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await visionClient.callTool({
        name: 'browser_vision_screen_click',
        arguments: {
          coordinate: '100,100',
          factor: '0.8',
        },
      });

      expect(result.isError).toBeUndefined();
      expect(result.content).toBeDefined();

      await visionClient.close();
    });
  });

  describe('browser.ts coverage gaps', () => {
    test('should handle browser operations with proper initialization', async () => {
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
      expect(result.content).toBeDefined();
    });

    test('should handle multiple browser operations in sequence', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      await client.callTool({
        name: 'browser_screenshot',
        arguments: {},
      });

      await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {},
      });

      const result = await client.callTool({
        name: 'browser_get_console_logs',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });

  describe('utils.ts coverage gaps', () => {
    test('should handle form input with complex selectors', async () => {
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
          value: 'test value with special chars !@#$%',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle select operations with complex values', async () => {
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
          value: 'option2',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle hover operations', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_hover',
        arguments: {
          selector: '#clickableDiv',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle click operations with complex selectors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_click',
        arguments: {
          selector: '#submitButton',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });
  });
});
