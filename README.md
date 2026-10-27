# Photopea Desktop

A lightweight macOS desktop wrapper for [Photopea](https://www.photopea.com/) — the free online image editor — built with Electron and TypeScript.

## Features

- 🖼️ **Full Photopea experience** in a native window
- ⏳ **Loading overlay** with spinner while the editor loads
- ⚠️ **Error state** with automatic timeout detection and a retry button
- 🌙 **Dark mode** support (follows system preference)
- ♿ **Accessibility**: ARIA live regions, keyboard-focusable controls, reduced-motion support
- 🔒 **Secure by default**: `contextIsolation` + preload bridge (no `nodeIntegration`)
- 🧪 **Unit tested** with Vitest
- 📦 **Packaged** for macOS DMG via electron-builder

## Requirements

- Node.js ≥ 18
- npm ≥ 9

## Getting started

```bash
# Install dependencies
npm install

# Run in development (compiles TS, then launches Electron)
npm start

# Run unit tests
npm test

# Lint source
npm run lint

# Package as a macOS .dmg
npm run build
```

## Project structure

```
tool-macos-builder/
├── src/
│   ├── main/          # Electron main process (window, IPC)
│   ├── preload/       # contextBridge preload script
│   ├── renderer/      # UI: HTML, CSS, renderer TS
│   └── shared/        # Constants shared across processes
├── tests/             # Vitest unit tests
├── dist/              # Compiled JS output (generated)
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── eslint.config.js
```

## Security model

The renderer runs with:

- `contextIsolation: true`
- `nodeIntegration: false`
- A strict Content-Security-Policy allowing frames only from `photopea.com`

All privileged access goes through the typed `window.photopeaAPI` bridge exposed by the preload script (`src/preload/index.ts`).

## Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm start`        | Compile TypeScript and launch the app        |
| `npm run dev`      | Launch Electron without recompiling          |
| `npm run build`    | Compile + package a macOS DMG                |
| `npm test`         | Run unit tests once                          |
| `npm run test:watch` | Run unit tests in watch mode               |
| `npm run lint`     | Lint TypeScript sources with ESLint          |

## License

MIT
