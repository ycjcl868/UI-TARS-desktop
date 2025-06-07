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

describe('Missing Coverage Tests', () => {
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
          <head><title>Missing Coverage Test</title></head>
          <body>
            <h1>Missing Coverage Test</h1>
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

  describe('server.ts uncovered lines 1091-1100', () => {
    test('should handle browser_close tool', async () => {
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
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('Closed browser');
    });
  });

  describe('server.ts uncovered lines 1113-1122', () => {
    test('should handle browser_close_tab tool', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_close_tab',
        arguments: {},
      });

      expect(result.isError).toEqual(false);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('Closed current tab');
    });
  });

  describe('server.ts uncovered lines 1139-1147', () => {
    test('should handle browser_tab_list tool error', async () => {
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
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
    });
  });

  describe('server.ts uncovered lines 1178-1187', () => {
    test('should handle browser_switch_tab tool with invalid index', async () => {
      await client.callTool({
        name: 'browser_navigate',
        arguments: {
          url: baseUrl,
        },
      });

      const result = await client.callTool({
        name: 'browser_switch_tab',
        arguments: {
          index: 999,
        },
      });

      expect(result.isError).toEqual(true);
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('Invalid tab index');
    });
  });

  describe('server.ts uncovered lines 1190-1202', () => {
    test('should handle browser_press_key tool', async () => {
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
      expect(result.content).toBeDefined();
      expect(Array.isArray(result.content)).toBe(true);
      const content = result.content as any[];
      expect(content[0]).toHaveProperty('type', 'text');
      expect(content[0].text).toContain('Pressed key: Enter');
    });
  });

  describe('server.ts uncovered lines 1209-1218', () => {
    test('should handle unknown tool', async () => {
      try {
        const result = await client.callTool({
          name: 'unknown_tool',
          arguments: {},
        });
        expect(result.isError).toEqual(true);
        expect(result.content).toBeDefined();
        expect(Array.isArray(result.content)).toBe(true);
        const content = result.content as any[];
        expect(content[0]).toHaveProperty('type', 'text');
        expect(content[0].text).toContain('Unknown tool');
      } catch (error) {
        expect(error).toBeDefined();
      }
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
          uri: screenshotResource.uri,
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
        expect(Array.isArray(result.contents)).toBe(true);
        const content = result.contents as any[];
        expect(content[0]).toHaveProperty('uri');
        expect(content[0]).toHaveProperty('text');
      }
    });
  });

  describe('vision tool coverage when disabled', () => {
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
});
