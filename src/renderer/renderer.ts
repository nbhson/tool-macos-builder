/**
 * Renderer logic for the Photopea desktop wrapper.
 * Handles iframe lifecycle: loading state, error state with retry, and ready transitions.
 */

import { PHOTOPEA_URL, LOAD_TIMEOUT_MS } from '../shared/constants';

const elements = {
  iframe: document.getElementById('photopea-frame') as HTMLIFrameElement,
  loadingOverlay: document.getElementById('loading-overlay') as HTMLDivElement,
  errorOverlay: document.getElementById('error-overlay') as HTMLDivElement,
  errorDetail: document.getElementById('error-detail') as HTMLParagraphElement,
  retryButton: document.getElementById('retry-button') as HTMLButtonElement,
};

let loadTimeoutId: ReturnType<typeof setTimeout> | null = null;

function showLoading(): void {
  elements.loadingOverlay.hidden = false;
  elements.errorOverlay.hidden = true;
}

function showError(detail: string): void {
  elements.loadingOverlay.hidden = true;
  elements.errorOverlay.hidden = false;
  elements.errorDetail.textContent = detail;
}

function showContent(): void {
  elements.loadingOverlay.hidden = true;
  elements.errorOverlay.hidden = true;
}

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
  showLoading();

  elements.iframe.src = PHOTOPEA_URL;

  // If iframe hasn't fired onLoad within the timeout, assume failure
  loadTimeoutId = setTimeout(() => {
    showError('The request timed out. Check your internet connection and try again.');
  }, LOAD_TIMEOUT_MS);
}

elements.iframe.addEventListener('load', () => {
  clearTimeoutTimer();
  showContent();
});

elements.iframe.addEventListener('error', () => {
  clearTimeoutTimer();
  showError('Unable to reach photopea.com. Please check your network connection.');
});

elements.retryButton.addEventListener('click', loadPhotopea);

// Kick off initial load
loadPhotopea();

// Log app info if the preload bridge is available
if (window.photopeaAPI) {
  const { versions, platform } = window.photopeaAPI;
  console.info(`Photopea wrapper | Electron ${versions.electron} | ${platform}`);
}

export { loadPhotopea };
