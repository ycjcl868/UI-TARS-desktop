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

describe('Additional Coverage Tests', () => {
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
          <head><title>Additional Coverage Test</title></head>
          <body>
            <h1>Additional Coverage Test</h1>
            <input type="text" id="testInput" value="test" />
            <select id="testSelect">
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
            <button id="testButton">Test Button</button>
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

  describe('server.ts uncovered lines', () => {
    test('should handle browser_get_html tool', async () => {
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
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('<!DOCTYPE html>');
    });

    test('should handle browser_screenshot tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type');
      expect(['image', 'text']).toContain(content[0].type);
    });

    test('should handle browser_screenshot with selector', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_screenshot',
        arguments: {
          selector: '#testButton',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_get_console_logs tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

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

    test('should handle browser_evaluate tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_evaluate',
        arguments: {
          script: 'document.title',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('Additional Coverage Test');
    });

    test('should handle browser_evaluate with complex script', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_evaluate',
        arguments: {
          script:
            'JSON.stringify({title: document.title, url: window.location.href})',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_get_clickable_elements with complex selectors', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_get_clickable_elements',
        arguments: {
          selector: 'button, input, select',
        },
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
    });
  });

  describe('resources coverage', () => {
    test('should handle screenshot resource with parameters', async () => {
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
        const result = await client.readResource({
          uri: screenshotResource.uri + '?selector=%23testButton',
        });
        expect(result.contents).toBeDefined();
      }
    });

    test('should handle console logs resource', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

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

  describe('vision tool coverage', () => {
    test('should handle vision tools when vision is disabled', async () => {
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
        vision: false,
      } as GlobalConfig);
      const [visionClientTransport, visionServerTransport] =
        InMemoryTransport.createLinkedPair();

      await Promise.all([
        visionClient.connect(visionClientTransport),
        visionServer.connect(visionServerTransport),
      ]);

      try {
        const result = await visionClient.callTool({
          name: 'browser_vision_screen_capture',
          arguments: {},
        });
        expect(result.isError).toEqual(true);
      } catch (error) {
        expect(error).toBeDefined();
      }

      await visionClient.close();
    });
  });

  describe('error handling coverage', () => {
    test('should handle invalid tool arguments', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_evaluate',
        arguments: {
          script: 'throw new Error("Test error")',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    });

    test('should handle browser_click with invalid selector', async () => {
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

    test('should handle browser_form_input_fill with invalid selector', async () => {
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
    }, 10000);

    test('should handle browser_select with invalid selector', async () => {
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
          value: 'test',
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
    }, 10000);

    test('should handle browser_hover with invalid selector', async () => {
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
    }, 10000);
  });
});
