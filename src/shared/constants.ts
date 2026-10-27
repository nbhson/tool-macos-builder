/** Shared application constants used by main and renderer processes. */

/** Base URL of the Photopea web application loaded in the iframe. */
export const PHOTOPEA_URL = 'https://www.photopea.com/';

/** Maximum time (ms) to wait for the iframe to load before showing the error state. */
export const LOAD_TIMEOUT_MS = 30_000;

/** IPC channel names. */
export const IPC_CHANNELS = {
  GET_APP_VERSION: 'app:get-version',
} as const;
