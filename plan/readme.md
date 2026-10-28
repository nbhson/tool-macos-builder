# Plan — tool-macos-builder

Electron desktop app (photopea-desktop), TypeScript + electron-builder, vitest.

## Baseline audit (00:44, 28-10-2026)
- Tests: ⚠️ chỉ **3 tests** (1 file) — coverage rất mỏng
- Lint: ✅ clean
- Commit gần nhất: enable Electron sandbox (security) ✅

## Roadmap
### P0
- [ ] Build `build:ts` chạy sạch, không lỗi typecheck

### P1 (chất lượng)
- [ ] Bổ sung unit tests cho các module chính trong `src/` (IPC handlers, config, update logic...)
- [ ] Audit security Electron: contextIsolation, nodeIntegration, CSP, navigation guard
- [ ] `npm audit`

### P2 (hardening)
- [ ] CI workflow
- [ ] Docs: build/packaging instructions

## Self-review log
- _0:44_ Audit lần 1: 3/3 pass, lint clean.
