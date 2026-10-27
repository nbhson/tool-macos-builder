/**
 * Tests for the preload script: verifies the contextBridge API surface
 * exposed to the renderer is minimal and safe.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IPC_CHANNELS } from '../src/shared/constants';

const exposeInMainWorld = vi.fn();
const invoke = vi.fn();

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: (name: string, api: unknown) => exposeInMainWorld(name, api),
  },
  ipcRenderer: {
    invoke: (channel: string) => invoke(channel),
  },
}));

type PhotopeaAPI = {
  versions: { electron?: string; chrome?: string; node?: string };
  platform: string;
  getAppVersion: () => Promise<string>;
};

async function importPreload(): Promise<Record<string, unknown>> {
  vi.resetModules();
  await import('../src/preload/index');
}

describe('preload contextBridge API', () => {
  beforeEach(() => {
    exposeInMainWorld.mockClear();
    invoke.mockClear();
    invoke.mockResolvedValue('1.1.0');
  });

  it('exposes the API under the "photopeaAPI" global name', async () => {
    await importPreload();

    expect(exposeInMainWorld).toHaveBeenCalledTimes(1);
    expect(exposeInMainWorld.mock.calls[0][0]).toBe('photopeaAPI');
  });

  it('exposes runtime version info (electron, chrome, node)', async () => {
    await importPreload();

    const api = exposeInMainWorld.mock.calls[0][1] as PhotopeaAPI;
    expect(api.versions).toHaveProperty('electron');
    expect(api.versions).toHaveProperty('chrome');
    expect(api.versions).toHaveProperty('node');
  });

  it('exposes the host platform', async () => {
    await importPreload();

    const api = exposeInMainWorld.mock.calls[0][1] as PhotopeaAPI;
    expect(api.platform).toBe(process.platform);
  });

  it('getAppVersion invokes the correct IPC channel and resolves the version', async () => {
    await importPreload();

    const api = exposeInMainWorld.mock.calls[0][1] as PhotopeaAPI;
    const version = await api.getAppVersion();

    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith(IPC_CHANNELS.GET_APP_VERSION);
    expect(version).toBe('1.1.0');
  });

  it('does not leak Node.js process object into the exposed API', async () => {
    await importPreload();

    const api = exposeInMainWorld.mock.calls[0][1] as Record<string, unknown>;
    const keys = Object.keys(api);
    expect(keys).toEqual(['versions', 'platform', 'getAppVersion']);
    expect(api).not.toHaveProperty('process');
    expect(api).not.toHaveProperty('require');
  });
});
