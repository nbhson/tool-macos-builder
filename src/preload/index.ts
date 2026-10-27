import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';

/**
 * Expose a minimal, safe API surface to the renderer via contextBridge.
 * No Node.js APIs are leaked into the web page.
 */
const api = {
  /** Runtime versions (useful for About dialog / diagnostics) */
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },

  /** Host platform, e.g. 'darwin' | 'win32' | 'linux' */
  platform: process.platform,

  /** App version from package.json, resolved in the main process */
  getAppVersion: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),
};

contextBridge.exposeInMainWorld('photopeaAPI', api);

export type PhotopeaAPI = typeof api;
