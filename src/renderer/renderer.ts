/**
 * Renderer logic for the Photopea desktop wrapper.
 * Handles iframe lifecycle: loading state, error state with retry, and ready transitions.
 */

import { PHOTOPEA_URL, LOAD_TIMEOUT_MS } from '../shared/constants';
import {
  createOverlayController,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
} from './overlay';

const elements = {
  iframe: document.getElementById('photopea-frame') as HTMLIFrameElement,
  loadingOverlay: document.getElementById('loading-overlay') as HTMLDivElement,
  errorOverlay: document.getElementById('error-overlay') as HTMLDivElement,
  errorDetail: document.getElementById('error-detail') as HTMLParagraphElement,
  retryButton: document.getElementById('retry-button') as HTMLButtonElement,
};

const overlays = createOverlayController(elements);

let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

function clearTimeoutTimer(): void {
  if (loadTimeoutId !== null) {
    clearTimeout(loadTimeoutId);
    loadTimeoutId = null;
  }
}

/**
 * Reload the Photopea iframe and manage loading/error overlay states.
 */
function loadPhotopea(): void {
  clearTimeoutTimer();
  overlays.showLoading();

  elements.iframe.src = PHOTOPEA_URL;

  // If iframe hasn't fired onLoad within the timeout, assume failure
  loadTimeoutId = setTimeout(() => {
    overlays.showError(TIMEOUT_ERROR_MESSAGE);
  }, LOAD_TIMEOUT_MS);
}

elements.iframe.addEventListener('load', () => {
  clearTimeoutTimer();
  overlays.showContent();
});

elements.iframe.addEventListener('error', () => {
  clearTimeoutTimer();
  overlays.showError(NETWORK_ERROR_MESSAGE);
});

elements.retryButton.addEventListener('click', loadPhotopea);

// Kick off initial load
loadPhotopea();

// Log app info if the preload bridge is available
if (window.photopeaAPI) {
  const { versions, platform } = window.photopeaAPI;
  console.info(`Photopea wrapper | Electron ${versions.electron} | ${platform}`);
}
