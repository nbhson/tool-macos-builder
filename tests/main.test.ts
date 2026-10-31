/**
 * Tests for the Electron main process: IPC handler registration, window
 * security configuration, external link handling, and app lifecycle
 * (window-all-closed behavior per platform).
 *
 * The electron module is mocked; main/index.ts runs its side effects at
 * import time, so each test re-imports a fresh module instance.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'node:path';
import { IPC_CHANNELS } from '../src/shared/constants';

const state = vi.hoisted(() => ({
  windowOptions: [] as unknown[],
  loadFileArgs: [] as string[],
  openHandler: undefined as undefined | ((opts: { url: string }) => { action: string }),
  willNavigate: undefined as undefined | { preventDefault: () => void; url: string },
  permissionRequests: [] as { permission: string; allowed: boolean }[],
  permissionHandler:
    undefined as
    | undefined
    | ((_wc: unknown, permission: string, callback: (allowed: boolean) => void) => void),
  openExternalArgs: [] as string[],
  ipcHandlers: new Map<string, (channel: string) => string>(),
  appListeners: new Map<string, (...args: unknown[]) => void>(),
  quitCount: 0,
  // Track created windows so getAllWindows() reflects real state for activate logic
  windows: [] as unknown[],
}));

vi.mock('electron', () => {
  class BrowserWindow {
    webContents = {
      setWindowOpenHandler: (cb: typeof state.openHandler) => {
        state.openHandler = cb;
      },
      on: (
        _event: string,
        cb: (event: { preventDefault: () => void }, url: string) => void,
      ) => {
        state.willNavigate = (opts: { preventDefault: () => void; url: string }) =>
          cb(opts, opts.url);
      },

      session: {
        setPermissionRequestHandler: (
          cb: (_wc: unknown, permission: string, callback: (allowed: boolean) => void) => void,
        ) => {
          state.permissionHandler = cb;
        },
      },
    };
    loadFile = (file: string) => {
      state.loadFileArgs.push(file);
    };
    static getAllWindows(): unknown[] {
      return state.windows;
    }
    constructor(opts: unknown) {
      state.windowOptions.push(opts);
      state.windows.push(this);
    }
  }

  return {
    app: {
      whenReady: () => Promise.resolve(),
      getVersion: () => '9.9.9-test',
      on: (event: string, cb: (...args: unknown[]) => void) => {
        state.appListeners.set(event, cb);
      },
      quit: () => {
        state.quitCount += 1;
      },
    },
    BrowserWindow,
    shell: {
      openExternal: (url: string) => {
        state.openExternalArgs.push(url);
      },
    },
    ipcMain: {
      handle: (channel: string, handler: (ch: string) => string) => {
        state.ipcHandlers.set(channel, handler);
      },
    },
  };
});

async function importMain(): Promise<void> {
  vi.resetModules();
  await import('../src/main/index');
  // Flush the app.whenReady().then(...) chain and its side effects.
  await new Promise((resolve) => setImmediate(resolve));
}

/** Temporarily stub process.platform (read-only getter) and restore after. */
function withPlatform(platform: string, fn: () => void): void {
  const descriptor = Object.getOwnPropertyDescriptor(process, 'platform');
  Object.defineProperty(process, 'platform', { value: platform, configurable: true });
  try {
    fn();
  } finally {
    Object.defineProperty(process, 'platform', descriptor as PropertyDescriptor);
  }
}

describe('main process', () => {
  beforeEach(() => {
    state.windowOptions.length = 0;
    state.windows.length = 0;
    state.loadFileArgs.length = 0;
    state.openExternalArgs.length = 0;
    state.openHandler = undefined;
    state.willNavigate = undefined;
    state.permissionHandler = undefined;
    state.permissionRequests.length = 0;
    state.ipcHandlers.clear();
    state.appListeners.clear();
    state.quitCount = 0;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers the GET_APP_VERSION IPC handler after app ready', async () => {
    await importMain();

    expect(state.ipcHandlers.has(IPC_CHANNELS.GET_APP_VERSION)).toBe(true);
  });

  it('GET_APP_VERSION handler resolves the app version from the main process', async () => {
    await importMain();

    const handler = state.ipcHandlers.get(IPC_CHANNELS.GET_APP_VERSION);
    expect(handler).toBeDefined();
    expect(handler(IPC_CHANNELS.GET_APP_VERSION)).toBe('9.9.9-test');
  });

  it('creates a window with a secure webPreferences configuration', async () => {
    await importMain();

    expect(state.windowOptions).toHaveLength(1);
    const webPreferences = (state.windowOptions[0] as { webPreferences: Record<string, unknown> })
      .webPreferences;

    expect(webPreferences.contextIsolation).toBe(true);
    expect(webPreferences.nodeIntegration).toBe(false);
    expect(webPreferences.sandbox).toBe(true);
    expect(webPreferences.webviewTag).toBe(false);
    expect(String(webPreferences.preload)).toContain(path.join('preload', 'index.js'));
  });

  it('loads the local renderer index.html', async () => {
    await importMain();

    expect(state.loadFileArgs).toHaveLength(1);
    expect(state.loadFileArgs[0]).toContain(path.join('renderer', 'index.html'));
  });

  it('denies window.open and routes https URLs to the system browser', async () => {
    await importMain();

    expect(state.openHandler).toBeDefined();
    const result = state.openHandler({ url: 'https://example.com/help' });

    expect(result).toEqual({ action: 'deny' });
    expect(state.openExternalArgs).toEqual(['https://example.com/help']);
  });

  it('denies window.open without opening non-https URLs externally', async () => {
    await importMain();

    const result = state.openHandler({ url: 'file:///etc/passwd' });

    expect(result).toEqual({ action: 'deny' });
    expect(state.openExternalArgs).toHaveLength(0);
  });

  it('blocks main-frame navigation away from local app files', async () => {
    await importMain();

    expect(state.willNavigate).toBeDefined();
    const prevented: string[] = [];
    const event = { preventDefault: () => prevented.push('nav') };

    state.willNavigate({ ...event, url: 'https://evil.example.com' });
    expect(prevented).toEqual(['nav']);
  });

  it('allows navigation to local file:// URLs', async () => {
    await importMain();

    const prevented: string[] = [];
    const event = { preventDefault: () => prevented.push('nav') };

    state.willNavigate({ ...event, url: 'file:///app/renderer/index.html' });
    expect(prevented).toEqual([]);
  });

  it('registers a permission request handler that denies every permission', async () => {
    await importMain();

    expect(state.permissionHandler).toBeDefined();
    for (const permission of ['media', 'geolocation', 'notifications', 'clipboard-read']) {
      let allowed: boolean | undefined;
      state.permissionHandler({}, permission, (result: boolean) => {
        allowed = result;
      });
      expect(allowed).toBe(false);
    }
  });

  it('quits when all windows are closed on non-darwin platforms', async () => {
    await importMain();
    expect(state.appListeners.has('window-all-closed')).toBe(true);

    withPlatform('win32', () => {
      state.appListeners.get('window-all-closed')();
      expect(state.quitCount).toBe(1);
    });
  });

  it('stays running when all windows are closed on darwin (macOS)', async () => {
    await importMain();

    withPlatform('darwin', () => {
      state.appListeners.get('window-all-closed')();
      expect(state.quitCount).toBe(0);
    });
  });

  it('re-creates a window on activate (macOS dock click) when no windows exist', async () => {
    await importMain();
    expect(state.windowOptions).toHaveLength(1);

    // Simulate the user having closed the window before clicking the dock icon
    state.windows.length = 0;
    state.appListeners.get('activate')();

    expect(state.windowOptions).toHaveLength(2);
  });

  it('does not create an extra window on activate when windows already exist', async () => {
    await importMain();

    state.appListeners.get('activate')();

    expect(state.windowOptions).toHaveLength(1);
  });
});
