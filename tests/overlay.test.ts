/**
 * Tests for the renderer overlay controller (src/renderer/overlay.ts).
 * The controller is DOM-free: plain objects stand in for HTML elements.
 */
import { describe, it, expect } from 'vitest';
import {
  createOverlayController,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  type OverlayElements,
} from '../src/renderer/overlay';

function makeElements(): OverlayElements & {
  errorDetail: { textContent: string | null };
} {
  return {
    loadingOverlay: { hidden: true },
    errorOverlay: { hidden: true },
    errorDetail: { textContent: null },
  };
}

describe('createOverlayController', () => {
  it('showLoading reveals the loading overlay and hides the error overlay', () => {
    const els = makeElements();
    const controller = createOverlayController(els);

    controller.showLoading();

    expect(els.loadingOverlay.hidden).toBe(false);
    expect(els.errorOverlay.hidden).toBe(true);
  });

  it('showError hides loading, reveals the error overlay, and sets the detail text', () => {
    const els = makeElements();
    const controller = createOverlayController(els);

    controller.showLoading();
    controller.showError('boom');

    expect(els.loadingOverlay.hidden).toBe(true);
    expect(els.errorOverlay.hidden).toBe(false);
    expect(els.errorDetail.textContent).toBe('boom');
  });

  it('showContent hides both overlays', () => {
    const els = makeElements();
    const controller = createOverlayController(els);

    controller.showError('boom');
    controller.showContent();

    expect(els.loadingOverlay.hidden).toBe(true);
    expect(els.errorOverlay.hidden).toBe(true);
  });

  it('exposes the timeout error message for the load timeout path', () => {
    expect(TIMEOUT_ERROR_MESSAGE).toMatch(/timed out/i);
  });

  it('exposes the network error message for the iframe error path', () => {
    expect(NETWORK_ERROR_MESSAGE).toMatch(/photopea\.com/i);
  });
});
