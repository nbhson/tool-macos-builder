# Plan — tool-macos-builder

Electron desktop app (photopea-desktop), TypeScript + electron-builder, vitest.

## Baseline audit (00:44, 28-10-2026)
- Tests: ⚠️ chỉ **3 tests** (1 file) — coverage rất mỏng
- Lint: ✅ clean
- Commit gần nhất: enable Electron sandbox (security) ✅

## Roadmap
### P0
- [x] Build `build:ts` chạy sạch, không lỗi typecheck ✅ (verified 31-10-2026)

### P1 (chất lượng)
- [x] Bổ sung unit tests cho các module chính (30 tests: main, preload,
      overlay controller, constants, builder config)
- [x] Audit security Electron: contextIsolation ✅, nodeIntegration ✅,
      sandbox ✅, CSP ✅; bổ sung navigation guard + permission handler
      (commit feat(security))
- [x] `npm audit` — 45 advisories, toàn bộ ở devDependencies, fix đều
      semver-major (electron 45, electron-builder 26, vitest 5, eslint 10);
      ghi nhận, nâng cấp riêng để tránh phá hành vi

### P2 (hardening)
- [x] CI workflow (.github/workflows/ci.yml)
- [x] Docs: README cập nhật security model, scripts, CI, dependencies

## Self-review log
- _0:44_ Audit lần 1: 3/3 pass, lint clean.
- _31-10-2026_ Refactor: overlay controller DOM-free + tests; security guards
  trong main; lint mở rộng cho tests/; script typecheck; CI; docs. Baseline
  22/22 → 30/30 tests, tsc/lint sạch.
