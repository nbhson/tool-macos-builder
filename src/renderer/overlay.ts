/**
 * Overlay state controller for the Photopea desktop wrapper.
 *
 * Pure, DOM-free logic that manages the visibility of the loading/error
 * overlays. Extracted from renderer.ts so it can be unit tested with Vitest
 * without a DOM environment: any object exposing the minimal surface below
 * works as an "element".
 */

/** Message shown when the iframe does not finish loading within the timeout. */
export const TIMEOUT_ERROR_MESSAGE =
  'The request timed out. Check your internet connection and try again.';

/** Message shown when the iframe fails to load photopea.com. */
export const NETWORK_ERROR_MESSAGE =
  'Unable to reach photopea.com. Please check your network connection.';

/** Minimal element surface required by the overlay controller. */
export interface ToggleableElement {
  hidden: boolean;
}

export interface DetailElement {
  textContent: string | null;
}

export interface OverlayElements {
  loadingOverlay: ToggleableElement;
  errorOverlay: ToggleableElement;
  errorDetail: DetailElement;
}

export interface OverlayController {
  /** Show the loading overlay and hide the error overlay. */
  showLoading(): void;
  /** Hide the loading overlay, show the error overlay, and set the detail text. */
  showError(detail: string): void;
  /** Hide both overlays, revealing the editor content. */
  showContent(): void;
}

/**
 * Create an overlay controller bound to the given elements.
 */
export function createOverlayController(elements: OverlayElements): OverlayController {
  return {
    showLoading(): void {
      elements.loadingOverlay.hidden = false;
      elements.errorOverlay.hidden = true;
    },

    showError(detail: string): void {
      elements.loadingOverlay.hidden = true;
      elements.errorOverlay.hidden = false;
      elements.errorDetail.textContent = detail;
    },

    showContent(): void {
      elements.loadingOverlay.hidden = true;
      elements.errorOverlay.hidden = true;
    },
  };
}
