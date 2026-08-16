---
name: testing-sadhya-undakkam
description: How to run and end-to-end test the Sadhya Undakkam game (Vite + React, Supabase leaderboard)
---

# Testing Sadhya Undakkam

## Run
- Node 22 via mise: `eval "$(~/.local/bin/mise env -s bash)"` in the repo dir; pnpm at `~/.local/share/pnpm/pnpm`.
- Dev server: `pnpm dev` → http://localhost:5173 (respects `$PORT`). Prod: `pnpm build && pnpm preview`.
- Media (mp4/mp3) under `src/assets/` are git-LFS-backed; if videos render black, check LFS files are pulled (`git lfs pull`).

## App structure / UI paths
- SPA with in-memory page state (no router/URLs): home → builder → result → leaderboard. A full page reload always returns to home and loses progress.
- Home: mode toggle pill top-left (Normal ↔ Kannur), sound pill top-right, "Build my Sadhya →" starts builder.
- Builder: select dish in right sidebar, draw closed loops on the leaf canvas with mouse drag (mouse_down + moves + mouse_up; path needs ≥5 points). "Finalize Sadhya →" → result page after ~1.5s + loading animation.
- Result: score/badge, name input + "Save my Sadhya" POSTs to Supabase REST (`utils/supabase/info.tsx` has projectId + anon key); localStorage fallback key `sadhya_lb_local`. "View Leaderboard →" shows entries.

## Known quirks (pre-existing, not regressions)
- Home bg video may stay paused on first load: code unmutes and calls play(), which browsers block before a user gesture. Toggling mode (remounts video) after a click starts playback.
- `/audio/*.mp3` paths in App.tsx/BuilderPage/ResultPage (`normal-bg.mp3`, `reaction-*.mp3`, `inspection.mp3`) have no backing files (no `public/` dir) — playback fails silently by design; don't flag these 404s as regressions.
- Builder state once reset unexpectedly (portions 3→1) during automated pointer interactions; not reproducible. If it happens, just redraw — but note it in the report.

## Verifying asset loads
In the console: `performance.getEntriesByType('resource').filter(r=>r.name.includes('/src/assets/')&&r.responseStatus>=400)` should be empty; Supabase save should show a 201 POST to `.../rest/v1/leaderboard`.
