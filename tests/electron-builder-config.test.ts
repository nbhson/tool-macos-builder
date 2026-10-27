/**
 * Tests for the electron-builder packaging configuration in package.json.
 * Ensures the packaged app keeps a valid entry point, secure mac settings,
 * and only ships built assets (no TypeScript sources).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as {
  main: string;
  build: {
    appId: string;
    productName: string;
    mac: { target: string[]; category: string };
    files: string[];
    extraMetadata: { main: string };
  };
};

describe('electron-builder configuration', () => {
  const config = pkg.build;

  it('defines appId and productName', () => {
    expect(config.appId).toBe('com.photopea.desktop');
    expect(config.productName).toBe('Photopea');
  });

  it('targets dmg on macOS with a graphics-design category', () => {
    expect(config.mac.target).toContain('dmg');
    expect(config.mac.category).toBe('public.app-category.graphics-design');
  });

  it('ships built output and renderer assets while excluding TS sources', () => {
    expect(config.files).toContain('dist/**/*');
    expect(config.files).toContain('src/renderer/**/*');
    expect(config.files).toContain('!src/**/*.ts');
  });

  it('entry point consistency: top-level main matches extraMetadata.main', () => {
    expect(pkg.main).toBe('dist/main/index.js');
    expect(config.extraMetadata.main).toBe('dist/main/index.js');
  });
});
