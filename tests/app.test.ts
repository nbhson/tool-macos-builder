import { describe, it, expect } from 'vitest';
import { PHOTOPEA_URL, LOAD_TIMEOUT_MS, IPC_CHANNELS } from '../src/shared/constants';

describe('Shared constants', () => {
  it('PHOTOPEA_URL should be a valid HTTPS URL to photopea.com', () => {
    expect(PHOTOPEA_URL).toMatch(/^https:\/\/(www\.)?photopea\.com\/$/);
  });

  it('LOAD_TIMEOUT_MS should be a positive number', () => {
    expect(LOAD_TIMEOUT_MS).toBeGreaterThan(0);
    expect(Number.isFinite(LOAD_TIMEOUT_MS)).toBe(true);
  });

  it('IPC_CHANNELS should define app version channel', () => {
    expect(IPC_CHANNELS.GET_APP_VERSION).toBe('app:get-version');
  });
});
