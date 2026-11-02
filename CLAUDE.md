# Creative Archive

Private archive for one person's music, anime/manga, books and fashion: what she wants to consume, is consuming and has consumed, plus brands, shops, influencers and looks. SvelteKit 3 + Vite + TypeScript, adapter-node, npm, SQLite (`node:sqlite`).
Kit config lives in `vite.config.ts` (`sveltekit({ ... })`); Kit 3 refuses a `svelte.config.js`. `$lib` is gone: import
through `#lib/...` (package.json `imports`) with the explicit `.ts` extension.

## Harness
- proof: `npm run proof`
- proof-full: `npm run proof:full`
- run: `npm run dev` → http://localhost:5173
- package: `npm run package` → `dist/creative-archive-<version>.tgz` + `.sha256` (build, migrations, node_modules, package.json, lockfile)
- ship: merge
- release: tag

`proof` = svelte-check (`--fail-on-warnings`), build, vitest. `proof:full` adds Playwright (projects `phone` 390×844
touch, `desktop` 1280×800, `workers: 1`) against `node build` on `$PORT` (default 4173) with
`DATABASE_PATH=.e2e/$PORT.db`, removed before each run, and `CREATIVE_ARCHIVE_TEST=1` so the `/__test/*` routes answer
and search and page fetches use the fakes. `MOCKUP_PHOTOS_DIR` points at `fixtures/mockups`.
With `E2E_APP_DIR` set (CI: the unpacked tarball) it serves that dir's build instead. Every e2e test that touches data
starts with the reset helper and seeds what it needs, and waits for `html[data-hydrated]` before interacting.
The server runs behind a proxy: without `PROTOCOL_HEADER` (or `ORIGIN`) Kit's CSRF check rejects form posts and
DELETEs over plain http; e2e sends `x-forwarded-proto: http` for that reason, and `BODY_SIZE_LIMIT=17M` lets 16 MB photo
uploads through. Tests that don't exercise motion call `calm(page)` (reduced motion) so transitions can't make them flaky.
Unit tests live next to the code as `src/**/*.test.ts` (plus `scripts/*.test.ts`); `scripts/server.test.ts`
spawns the built server, so `build/` must exist (`proof` builds before it tests). An e2e test that sets its own
viewport or only uses `request` runs in one project (`test.skip(info.project.name !== …)`); everything else runs in both.

## Specs
- Before changing artist-link, read openspec/specs/artist-link/spec.md.
- Before changing autofill, read openspec/specs/autofill/spec.md.
- Before changing collections, read openspec/specs/collections/spec.md.
- Before changing design-system, read openspec/specs/design-system/spec.md.
- Before changing domain-lists, read openspec/specs/domain-lists/spec.md.
- Before changing domain-pages, read openspec/specs/domain-pages/spec.md.
- Before changing entries, read openspec/specs/entries/spec.md.
- Before changing harness, read openspec/specs/harness/spec.md.
- Before changing home, read openspec/specs/home/spec.md.
- Before changing images, read openspec/specs/images/spec.md.
- Before changing layout, read openspec/specs/layout/spec.md.
- Before changing link-preview, read openspec/specs/link-preview/spec.md.
- Before changing motion, read openspec/specs/motion/spec.md.
- Before changing release, read openspec/specs/release/spec.md.
- Before changing settings, read openspec/specs/settings/spec.md.
- Before changing tags, read openspec/specs/tags/spec.md.
- Before changing tracking, read openspec/specs/tracking/spec.md.

## Learnings
- **Svelte outro transitions on menus/forms/sheets** → set `aria-hidden` on `outrostart` (Svelte only sets `inert`) and run a new e2e file with `--repeat-each` before committing. (weil: plan-entries "Edit and delete an entry" failed 6/10 on phone from a strict-mode duplicate Save during a 160 ms outro) [2026-10-20 · build-cooking-hub]
- **Several e2e files declaring a `window` global (e.g. `window.__anims`)** → name the global per file. (weil: identical declarations clash in svelte-check) [2026-11-01 · build-creative-archive]
- **e2e that reloads right after an optimistic write (progress, rating, status, journey)** → await the pending saves with the `countSaves` helper first; when the test asserts how many saves were sent (none / exactly one), use the `recordSaves` exact list, never `countSaves(n)`. (weil: detail controls queue their POSTs and a reload lost the write; a stray same-value save satisfied `toBe(1)`, found in review) [2026-11-01 · build-creative-archive] [2026-11-02 · ui-polish]
- **New component or style** → no raw colours and no clip-path transitions (motion.test.ts bans both), and pair static style guards (raw font-size/colour scans) with a computed-style e2e; use the error token for failures, never a hex or ink fallback. (weil: U13 went red on a hex error colour and U12 on a clip-path transition; FilterBar select at --t-small = 13px passed the guard, the inputs >= 16px e2e caught it) [2026-11-01 · build-creative-archive] [2026-11-02 · ui-polish]
- **Bare `playwright test` in a fresh worktree, or after a throwaway `node build` server** → run `npm run build` once first and check `ss -ltn | rg :<port>`, killing that pid; for screenshots from `node build` build first and switch scheme via the app setting, not emulated prefers-color-scheme. (weil: "Cannot find module build", and a leftover server blocked the unit port; the app ignores emulated prefers-color-scheme and a stale build showed the old UI) [2026-11-01 · build-creative-archive] [2026-11-02 · ui-polish]
- **Navigation type in SvelteKit 3** → import `NavigationType` from `$app/navigation`, not `@sveltejs/kit`. (weil: U3 cost an attempt on the old import path) [2026-11-02 · ui-polish]
