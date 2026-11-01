Build mode: parallel units in worktrees (build.md); builders never touch `tasks.md`, the orchestrator checks boxes
after each wave merge. Before Build the orchestrator may create the empty local bootstrap commit on `main`
(design.md → Git root), then `git switch -c flow/build-creative-archive` and commits the plan. Nothing is pushed before
Ship; outward steps live in the runbook `docs/release.md` (U2) and run at Ship on Rue's go.

Every behaviour task writes its scenario tests first, named "Scenario: <title>" exactly as in the specs, from the THEN
clauses, and watches them fail for the right reason (an e2e scenario fails against the missing UI, not only a unit
test) before writing the code; then `proof` (or `PORT=<unit port> npm run proof:full` when the task touched e2e or the
pages it walks), then one commit per task. Shared shapes are in design.md → Contracts; files to copy are in design.md →
Reference files. A unit needing a new e2e helper adds it in its own test file, never in `e2e/helpers.ts`. A new e2e
file runs with `--repeat-each 5` before its commit. Tests not about motion call `calm(page)`. Outro'd menus, popovers,
sheets and toasts use `hideOnOutro`; forms guard against duplicate submits. vitest runs as
`node_modules/.bin/vitest run <file>`; long `proof:full` runs go to the background and only the exit code and tail are
read. Each builder uses its own scratchpad subdir (`scratchpad/U<n>/`). No web requests except task 4.1's photo
download and npm installs.

**⏸ Taste stop:** no unit that builds themed UI (10–18) starts before task 4.7 is checked. Waves 3 (U5–U7) are server
only and may run while the pause lasts.

## 1. Establish the harness

> unit: depends=none · scope=S1 · files=package.json, package-lock.json, vite.config.ts, tsconfig.json, playwright.config.ts, .gitignore, src/app.html, src/app.d.ts, src/hooks.server.ts, src/routes/+layout.svelte, src/routes/(app)/+page.svelte, src/routes/healthz/+server.ts, src/routes/healthz/healthz.test.ts, src/lib/domains.ts, src/lib/server/db.ts, src/lib/server/db.test.ts, src/lib/server/test-flag.ts, migrations/0001_images.sql, scripts/package.mjs, scripts/package.test.ts, scripts/server.test.ts, scripts/version.test.ts, e2e/smoke.test.ts, CLAUDE.md, README.md

- [x] 1.1 Scaffold Kit 3 by copying Cooking-Hub's `package.json` (scripts `dev`, `build`, `preview`, `prepare`, `check` with `--fail-on-warnings`, `test:unit`, `test:e2e`, `proof`, `proof:full`, `package`; `imports` `#lib`/`#lib/*`; `engines.node >=22.18`; its devDependency ranges, no markdown-it), `vite.config.ts`, `tsconfig.json`, `.gitignore`, `src/app.d.ts`, `src/app.html` (`lang="en"`, title "Creative Archive"), root `+layout.svelte` (sets `html[data-hydrated]` on mount), placeholder `src/routes/(app)/+page.svelte` (an empty `<div>`); name `creative-archive`; `npm install` (`npm ls @sveltejs/kit` says 3.x), `npx playwright install chromium`. Write `scripts/version.test.ts` first, see it fail on the scaffold version, then set `0.1.0` in package.json and the lockfile (tabs kept) (Scenario: Package and lockfile carry 0.1.0)
- [x] 1.2 `db.ts` from Cooking-Hub (default `./data/creative-archive.db`, no `resetDb` yet) and `migrations/0001_images.sql` (design.md → Schema) with `db.test.ts` (Scenario: Fresh database gets the schema · Only new migrations run on an existing database)
- [x] 1.3 `hooks.server.ts` `init` opens the DB; `GET /healthz`; `src/lib/server/test-flag.ts` on `CREATIVE_ARCHIVE_TEST`; `src/lib/domains.ts` (design.md → Domains) (Scenario: Healthy server answers 200 · Unreadable database answers 503)
- [x] 1.4 `playwright.config.ts` from Cooking-Hub (phone 390×844 touch, desktop 1280×800, `workers: 1`, `.e2e/$PORT.db` removed before start, `E2E_APP_DIR`, `x-forwarded-proto`) with env `CREATIVE_ARCHIVE_TEST=1`, `BODY_SIZE_LIMIT=17M`, `MOCKUP_PHOTOS_DIR=<repo>/fixtures/mockups`; `e2e/smoke.test.ts` opens `/` and waits for `html[data-hydrated]` (freely named); `scripts/server.test.ts` spawns the built server (Scenario: Failing migration stops the server · Server starts from any working directory)
- [x] 1.5 `scripts/package.mjs` + `scripts/package.test.ts` from Cooking-Hub with name `creative-archive`; the test asserts the top-level directory holds exactly `build`, `migrations`, `node_modules`, `package.json`, `package-lock.json` (Scenario: Package produces a verifiable tarball)
- [x] 1.6 `CLAUDE.md`: one-line description, the Kit 3 note, `## Harness` (proof `npm run proof`, proof-full `npm run proof:full`, run `npm run dev` → http://localhost:5173, package → `dist/creative-archive-<version>.tgz` + `.sha256`, `ship: merge`, `release: tag`), Cooking-Hub's e2e paragraph adapted (test flag, 17M, `MOCKUP_PHOTOS_DIR`, reset first, `calm`), `## Learnings` with Cooking-Hub's outro `aria-hidden` line; README (setup, dev with `CREATIVE_ARCHIVE_TEST=1` for mockups, checks, env vars). Run `proof:full` green, then once with a deliberately failing unit test and e2e test to see both exit non-zero, then revert (Scenario: Proof prints test names and passes · Proof fails on a failing check · Proof-full runs e2e on an isolated database · Each e2e test runs on phone and desktop · Harness declared with merge and tag policy · README documents setup and env vars)

## 2. Establish CI, the release workflow and the ship runbook

> unit: depends=1 · scope=S2 · files=.github/workflows/ci.yml, .github/workflows/gate.yml, .github/workflows/release.yml, .github/dependabot.yml, scripts/workflows.test.ts, docs/release.md, README.md

CI can't run until the GitHub repo exists, which happens at Ship (runbook); this unit's GitHub scenarios are proven
there. No `gh`, no push, no repo settings in this unit.

- [x] 2.1 `scripts/workflows.test.ts` first (regex over `uses:` lines, no YAML dependency), then `ci.yml` and `gate.yml` copied from Cooking-Hub with SHA pins unchanged, tarball dir glob `creative-archive-*`; `actionlint` if installed (Scenario: Workflow actions are pinned to commit SHAs; proven on GitHub at ship: CI is green on the change's PR · Push to main runs on a GitHub-hosted runner · Superseded PR run is cancelled · E2E runs against the unpacked tarball)
- [x] 2.2 `.github/dependabot.yml` copied from Cooking-Hub (Scenario: Dependabot config covers actions and npm)
- [x] 2.3 `release.yml` copied from Cooking-Hub with `app: creative-archive`, `host_vars_path: ansible/inventory/host_vars/creative-archive01/vars.yml`, `variable: creative_archive_version`, plus a comment that the target arrives with `creative-archive-deploy` (Scenario: Tag does not match the version · Release publishes the tested tarball · Bump fails until the deploy change exists — proven on GitHub)
- [x] 2.4 `docs/release.md` adapted from Cooking-Hub: cutting a release, then the ship runbook in order, each step ⚠ with its exact command (spec release → Release runbook); README "Release" section links it (Scenario: Runbook lists the outward steps)

## 3. Data contract, test routes, fakes and e2e helpers

> unit: depends=1 · scope=none · files=src/lib/types.ts, src/lib/copy.ts, src/lib/errors.ts, src/lib/text.ts, src/lib/text.test.ts, src/lib/entries/config.ts, src/lib/entries/config.test.ts, src/lib/entries/derive.ts, src/lib/entries/derive.test.ts, src/lib/entries/progress.ts, src/lib/entries/progress.test.ts, migrations/0002_core.sql, src/lib/server/schema.test.ts, src/lib/server/db.ts, src/lib/server/rows.ts, src/lib/server/rows.test.ts, src/lib/server/testing.ts, src/lib/server/entries.ts, src/lib/server/tags.ts, src/lib/server/tracking.ts, src/lib/server/images.ts, src/lib/server/net.ts, src/lib/server/remote.ts, src/lib/server/remote.test.ts, src/lib/server/fake/remote.ts, src/lib/server/fake/pages.ts, src/lib/server/preview.ts, src/lib/server/collections.ts, src/lib/server/heroes.ts, src/lib/server/home.ts, src/lib/server/providers/types.ts, src/lib/server/providers/index.ts, src/lib/server/providers/fake.ts, src/lib/server/providers/fake.test.ts, src/lib/server/providers/deezer.ts, src/lib/server/providers/anilist.ts, src/lib/server/providers/openlibrary.ts, src/routes/__test/reset/+server.ts, src/routes/__test/seed/+server.ts, src/routes/__test/counts/+server.ts, src/routes/__test/image/[name]/+server.ts, src/routes/__test/test-routes.test.ts, src/routes/(app)/[domain]/+page.svelte, src/routes/(app)/[domain]/+page.server.ts, src/routes/(app)/[domain]/[list]/+page.svelte, src/routes/(app)/entries/[id]/+page.svelte, src/routes/(app)/collections/+page.svelte, src/routes/(app)/settings/+page.svelte, e2e/helpers.ts, e2e/test-routes.test.ts

Runs in parallel with U2 and U4. Everything in design.md → Contracts that is marked real is real here; server
functions are stubs with final signatures that throw `not implemented`.

- [x] 3.1 `types.ts`, `copy.ts`, `errors.ts`, `text.ts` (`fold` copied, freely named tests incl. "Ästhetik"/"ästhetik"), `entries/config.ts` (`TYPES`, `TYPES_BY_DOMAIN`, `LISTS`, `typeBySlug`), `entries/derive.ts` and `entries/progress.ts` with freely named tests (Scenario: Every type has a complete config · Each list slug resolves to its type)
- [x] 3.2 `migrations/0002_core.sql` per design.md → Schema with a freely named `schema.test.ts` (tables exist; CHECKs refuse a brand with a status, a piece with `want`, `rating_x2 = 11`, a blank title; the external-id index refuses a duplicate); `rows.ts` (`rowToEntry`, `entryColumns`, `loadTags`) and `testing.ts` (`useTestDb`, `insertEntryRow`, `testImage`) with freely named tests
- [x] 3.3 Stubs with final signatures for `entries.ts`, `tags.ts`, `tracking.ts`, `images.ts`, `net.ts`, `preview.ts`, `collections.ts`, `heroes.ts`, `home.ts`, `providers/{deezer,anilist,openlibrary}.ts` (`createX` returns `{ id, search: stub }`); `providers/types.ts`; test-first `providers/fake.ts` and `fake/{remote,pages}.ts` per design.md → Fake provider / Fake remote (fail-first: `fake.test.ts` and `remote.test.ts` red against empty modules); `providers/index.ts` (`providerFor`, `search` with timeout) and `remote.ts` (`getRemote` switch, real remote stubbed) (Scenario: Test mode uses the fake provider and remote · Production mode never uses the fakes)
- [x] 3.4 Placeholders: `(app)/[domain]/+page.svelte` + `+page.server.ts` (returns `{ world: params.domain }` only, no validation), `(app)/[domain]/[list]/+page.svelte`, `(app)/entries/[id]/+page.svelte`, `(app)/collections/+page.svelte`, `(app)/settings/+page.svelte` — each an empty element, no heading; `proof` green
- [x] 3.5 `resetDb()` in `db.ts` (delete every row of every table), test routes `reset`, `seed` (design.md → E2E helpers, through `insertEntryRow`), `counts`, `image/[name]`, each behind `requireTestFlag()`; `e2e/helpers.ts` (`reset`, `seed`, `counts`, `open`, `calm`, `photo`) (Scenario: Test routes answer 404 without the test flag · Reset empties the archive · Seed returns the ids of what it inserted · App is hydrated before tests interact)

## 4. Design system, mockup photos and mockups (⏸ world pick)

> unit: depends=1 · scope=S3,S4,S5 · files=package.json, src/lib/styles/tokens.css, src/lib/styles/tokens.ts, src/lib/styles/tokens.test.ts, src/lib/styles/global.css, src/lib/styles/worlds.ts, src/app.html, src/routes/+layout.svelte, static/fonts/*, fixtures/mockups/*, scripts/synthetic-photo.mjs, scripts/synthetic-photo.test.ts, src/lib/ui/*.svelte, src/lib/ui/initials.ts, src/lib/ui/initials.test.ts, src/lib/motion.ts, src/lib/motion.test.ts, src/lib/mockups/fixtures.ts, src/lib/mockups/credits.test.ts, src/routes/__mockups/+layout.server.ts, src/routes/__mockups/+layout.svelte, src/routes/__mockups/mockups-guard.test.ts, src/routes/__mockups/[world]/[scheme]/+page.svelte, src/routes/__mockups/[world]/[scheme]/+page.ts, src/routes/__mockups/components/+page.svelte, src/routes/__mockups/photo/[name]/+server.ts, e2e/design.test.ts, e2e/mockups.test.ts

Inputs: design.md → Visual brief (worlds, type, components, motion, alignment rule, desktop per screen, Mobbin
references), all five images in `/home/Rue/Pictures/UI-inspo/`. Further UI research only via the Mobbin MCP in a
subagent, citing screens by URL. Runs in parallel with U3, so its e2e files use their own `goto` + `html[data-hydrated]`
wait and loose mockup fixtures (`src/lib/mockups/fixtures.ts`), not `e2e/helpers.ts` or `types.ts`.

- [x] 4.1 Mockup photos (the only web download in the build): search the Openverse API (`https://api.openverse.org/v1/images/?q=<term>&license=cc0&page_size=20`; search calls allowed) for a music, an anime/city, a books, a fashion and a home hero plus square/portrait cover shapes; download at most 15 images in total, keep ~10 in `fixtures/mockups/` (long side ≤ 2000 px), list each in `fixtures/mockups/CREDITS.txt` (Cooking-Hub format); a shape not found is generated by `scripts/synthetic-photo.mjs` (sharp gradient + noise) and credited as generated; no image in `static/` (Scenario: Every mockup photo is credited · Missing photo shape is generated · Mockup photos stay out of the product)
- [x] 4.2 `tokens.css` + `tokens.ts` with the light and dark scheme sets and two accent candidates per world (design.md → Worlds), `global.css` (base type, focus ring, `[data-scheme]`/`[data-accent]` selectors), `worlds.ts` with `CANDIDATES`, a provisional `WORLDS` (all light, first candidate) and `worldAttrs` (Scenario: Every scheme and accent defines the full token set · Text contrast meets AA in every world · Text over photos stays legible)
- [x] 4.3 Components in `src/lib/ui/` with the props in design.md → UI components (Cooking-Hub's as starting points; Card becomes the Swap card), `initials.ts`, `motion.ts` (design.md → Motion; freely named tests: reduced motion → zero-duration configs and immediate `data-revealed`, `hideOnOutro` toggles `aria-hidden`); `/__mockups` layout guard, `/__mockups/photo/[name]` from `MOCKUP_PHOTOS_DIR`, `/__mockups/components` specimen in both schemes (Scenario: Card follows the Swap layout · Star rating shows half stars · Status split-pill opens its choices · Placeholder shows a tint and initials · Mockup routes are hidden without the test flag)
- [x] 4.4 Fonts: try the shortlist on the components page, pick one serif display and one sans text face, `npm pack @fontsource/<name>` (no dependency kept) or Cooking-Hub's `static/fonts/` if the pick is Fraunces + DM Sans; latin woff2 weights used + OFL texts into `static/fonts/`, `@font-face` in `global.css`, preload in `app.html` (Scenario: Display and text fonts load from the app)
- [x] 4.5 Mockups `/__mockups/[world]/[scheme]` (`?accent=` switches the candidate): Home (framed hero, coverflow, shelves, collections bento) and each domain landing page (hero, sub-type tabs, shelves, one list grid and one detail panel excerpt) at phone and desktop per the brief, with the photos (Scenario: Mockups render every world in light and dark · Switching a world is a data change · Pages load no external resources · Controls are at least 44px on phone · Mockups share one alignment rule)
- [x] 4.6 Script `shots:mockups` (`npm run build && playwright test e2e/mockups.test.ts --reporter=list`) writing `test-results/shots/mockups/<project>-<world>-<scheme>.png` after fonts and animations settle; look at all 20 shots yourself and fix what the brief would reject before reporting; report the paths (Scenario: Mockup screenshots are produced for both viewports; manual: Components match the visual brief)
- [x] 4.7 ⏸ checkpoint: Rue picks light/dark + accent per domain (and Home); the orchestrator writes the choice into design.md → World pick before dependent units start. Checked by the orchestrator after Rue's pick; revision rounds run on this unit's branch until then (Scenario: Rue picks a world per domain · Requested changes revise the mockups)

## 5. Entry store, tags and artist link (server)

> unit: depends=3 · scope=S10,S11,S14,S17,S18,S19 · files=src/lib/server/entries.ts, src/lib/server/entries.test.ts, src/lib/server/entries-list.test.ts, src/lib/server/tags.ts, src/lib/server/tags.test.ts

Runs in parallel with U6 and U7: insert rows for tests through `testing.ts`; collection rows by plain SQL.

- [x] 5.1 `createEntry`, `getEntry`, `updateEntry` validated against `TYPES` (blank title, fields of other types dropped, kind → brand/site type, default statuses, first status event, `DuplicateError` on a taken provider id, `updated_at` bump) (Scenario: Create an entry of each type · Server rejects a blank title · Fields of another type are ignored · Kind decides the brand or site type · Update bumps the updated timestamp · New entry with a status stores its first event · Server refuses a duplicate provider id on save)
- [x] 5.2 `deleteEntry` and image replacement in `updateEntry` (old image row deleted on replace/remove, image deleted with the entry, cascades) (Scenario: Deleted entry leaves every collection · Replacing an image removes the old row · Deleting an artist keeps the name text)
- [x] 5.3 `tags.ts`: `setEntryTags` by `fold`, first spelling wins, blanks ignored, unused tags pruned in the same transaction; `listTags` with counts; wire into create/update (Scenario: Tags are global across types · Tag names dedupe ignoring case including umlauts · Empty and whitespace tags are ignored · Unused tags are removed)
- [x] 5.4 `ensureArtist`, `artistWorks`, `listArtists`, `findByExternal` (Scenario: Ensure artist reuses the same Deezer id · Same name with different Deezer ids stays separate)
- [x] 5.5 `listEntries` with status, kind, tag, minimum rating and the three sorts (title via `Intl.Collator`) (Scenario: List query filters by status, kind, tag and minimum rating · List query sorts by added, rating and title)

## 6. Tracking store (server)

> unit: depends=3 · scope=S11,S12,S13 · files=src/lib/server/tracking.ts, src/lib/server/tracking.test.ts

`getEntry` is still a stub (U5 runs in parallel): read rows through `rows.ts`, never through `entries.ts`.

- [x] 6.1 `setStatus` + `statusEvents` (event only on change; status validated per type) (Scenario: Changing status stores a dated event · Setting the same status again stores no event · Status none is allowed · Invalid status for a type is rejected)
- [x] 6.2 `setProgress` / `stepProgress` with `clampProgress`, want → progress with its event, `updated_at` bump (Scenario: Progress cannot go below zero · Progress cannot exceed a known total · Unknown total has no upper bound · Progress moves want to in progress · Progress leaves other statuses alone · Manga tracks chapters and volumes separately)
- [x] 6.3 `setRating` in half steps, clearable (Scenario: Rating is stored in half steps)

## 7. Images and safe fetch (server)

> unit: depends=3 · scope=S16,S17 · files=package.json, package-lock.json, src/lib/server/images.ts, src/lib/server/images.test.ts, src/lib/server/net.ts, src/lib/server/net.test.ts, src/lib/server/remote.ts, src/routes/images/[id]/+server.ts, src/routes/images/images-route.test.ts

- [x] 7.1 `npm i sharp` (in `dependencies`); `storeImage` copied from Cooking-Hub with `MAX_UPLOAD_BYTES = 16 MiB` and the format list of design.md (test images generated with sharp in the test) (Scenario: Uploaded image is stored as WebP · Each listed format is accepted · Unsupported file is rejected by the server · Image over 16 MB is rejected by the server)
- [x] 7.2 `net.ts`: `safeFetch` and `isBlockedAddress` per design.md → SSRF guard; tests use a `node:http` server bound to `127.0.0.2` exempted via `allowAddresses`, an injected `lookup`, and fake timers or a short `timeoutMs` where noted (Scenario: Only http and https URLs are fetched · Loopback and private addresses are refused · Hostname resolving to a private address is refused · Redirect to a private address is refused · Too many redirects fail · Slow page times out after 5 seconds · Oversized page is cut at 1 MB · Oversized image fails)
- [x] 7.3 Real remote in `remote.ts` (`fetchPage`: 1 MB truncate, `text/html` only; `fetchImage`: 16 MB, `image/*` only; User-Agent `Creative-Archive/<version> (private archive)`), `storeImageFromUrl`, `toWebpDataUrl`, `getImage`, `deleteImage` (Scenario: Image from a URL is stored)
- [x] 7.4 `GET /images/[id]` from Cooking-Hub; then `npm run package` and check the tarball holds `node_modules/@img/sharp-linux-x64` (Scenario: Image is served with caching headers · Package produces a verifiable tarball)

## 8. Providers and preview parsing (server)

> unit: depends=3,7 · scope=S15,S16 · files=src/lib/server/providers/deezer.ts, src/lib/server/providers/anilist.ts, src/lib/server/providers/openlibrary.ts, src/lib/server/providers/http.ts, src/lib/server/providers/index.ts, src/lib/server/providers/deezer.test.ts, src/lib/server/providers/anilist.test.ts, src/lib/server/providers/openlibrary.test.ts, src/lib/server/providers/search.test.ts, src/lib/server/providers/fixtures/*.json, src/lib/server/preview.ts, src/lib/server/preview.test.ts

No network: the fixtures are written by hand in the shapes listed in design.md → Recorded fixture shapes (from the
2026-10-31 probe); the live check is the manual Gate 2 scenario.

- [x] 8.1 Fixture files per design.md (`deezer-search-album`, `deezer-album`, `deezer-search-artist`, `deezer-search-track`, `anilist-anime-frieren`, `anilist-manga-vagabond`, `anilist-error`, `openlibrary-search`)
- [x] 8.2 `createDeezer` (album/artist/track search, album enrichment of the first 8 within the budget) (Scenario: Deezer album results map to drafts · EP record type maps to EP · Failed album enrichment leaves the year empty · Deezer artist results carry the photo · Deezer track results carry album and artist)
- [x] 8.3 `createAniList` and `createOpenLibrary` (Scenario: AniList anime maps episodes and year · AniList null totals stay empty · AniList errors become a provider error · Open Library keeps the author in original script · Open Library result without cover has no cover)
- [x] 8.4 `http.ts` (`FetchJson` over `safeFetch`, 1 MB, User-Agent, JSON parse) wired into `providers/index.ts`; `search` maps abort/timeout to `ProviderError('timeout')` and anything else to `'failed'` (Scenario: Provider times out after 5 seconds; manual at Gate 2: Real providers answer a live search)
- [x] 8.5 `preview.ts`: `parsePreview` (regex over meta/title/link, entities decoded, relative URLs resolved) and `readPreview` (remote page → parse → image via remote → `toWebpDataUrl`) (Scenario: Open Graph tags fill the preview · Page without Open Graph falls back to title and icon · Relative og:image resolves against the page URL · Page with nothing usable has no preview)

## 9. Collections, heroes and shelf queries (server)

> unit: depends=3 · scope=S20,S21,S22,S23 · files=src/lib/server/collections.ts, src/lib/server/collections.test.ts, src/lib/server/heroes.ts, src/lib/server/heroes.test.ts, src/lib/server/home.ts, src/lib/server/home.test.ts

Uses `rows.ts` and plain SQL; independent of U5–U8.

- [x] 9.1 `collections.ts` (Scenario: Collection requires a name · Same entry added twice is kept once · Collage uses the first three images in added order · Deleting a collection keeps its entries · Rename a collection)
- [x] 9.2 `heroes.ts` (Scenario: Setting a hero replaces the old image · Removing a hero deletes its image)
- [x] 9.3 `home.ts`: `coverflowEntries`, `inProgress`, `recentlyAdded`, `homeShelves`, `domainShelves` (Scenario: Coverflow takes the 20 newest entries with images · In progress orders by last update · Home shelves omit empty ones · Domain shelves group recent entries by type)

## 10. App shell: worlds, nav, page transitions, toast and photo hero

> unit: depends=3,4 · scope=S6,S7,S24 · files=src/lib/styles/worlds.ts, src/routes/(app)/+layout.svelte, src/lib/shell/AppNav.svelte, src/lib/shell/nav.ts, src/lib/shell/nav.test.ts, src/lib/shell/morph.ts, src/lib/shell/morph.test.ts, src/lib/shell/Toast.svelte, src/lib/shell/toast.ts, src/lib/shell/toast.test.ts, src/lib/shell/PhotoHero.svelte, src/lib/shell/parallax.ts, src/lib/shell/parallax.test.ts, e2e/nav.test.ts, e2e/transitions.test.ts, e2e/worlds.test.ts

Themed UI: needs 4.7 checked. Long-page checks append a tall block to `<main>` in the test (screens are placeholders).

- [x] 10.1 Set `WORLDS` to design.md → World pick; `(app)/+layout.svelte` owns the world wrapper (`worldAttrs(page.data.world ?? 'home')`, `color-scheme`, body background) and `<main>` (Scenario: Domain pages use their world · Home, collections and settings use the home world)
- [x] 10.2 `AppNav` from `PillNav`: Home, Music, Animanga, Books, Fashion, Collections + Settings button; top centred from 1024 px, bottom below; `activeSection` (Scenario: Desktop shows the top pill nav · Phone shows the bottom pill nav · Nav marks the current section · Active section follows the path · Content clears the bottom nav on phone)
- [x] 10.3 `morph.ts` (`morphTarget`, `pageTransition` with dynamic `cover-<id>` naming per design.md → Page transitions) wired into `onNavigate` (Scenario: Morph targets follow the URLs · Other navigations crossfade · Reduced motion skips the crossfade · Browser without View Transitions navigates plainly)
- [x] 10.4 Toast host (`toast.ts` queue surviving a form-action redirect, `Toast.svelte` with `fadeSlide` + `hideOnOutro`, auto-hide 3 s; freely named `toast.test.ts`) and `PhotoHero` with `parallax.ts` (photo or world gradient) (Scenario: Parallax offset follows scroll)

## 11. Entry form, manual add and edit

> unit: depends=5,7,10 · scope=S9,S10,S14,S17,S18,S26 · files=src/lib/entries/EntryForm.svelte, src/lib/entries/FieldInput.svelte, src/lib/entries/TagInput.svelte, src/lib/entries/ImageField.svelte, src/lib/entries/ArtistField.svelte, src/lib/entries/unsaved.ts, src/lib/entries/DiscardDialog.svelte, src/lib/entries/save.ts, src/lib/entries/save.test.ts, src/routes/(app)/add/[type]/+page.svelte, src/routes/(app)/add/[type]/+page.server.ts, src/routes/(app)/entries/[id]/edit/+page.svelte, src/routes/(app)/entries/[id]/edit/+page.server.ts, e2e/entry-form.test.ts, e2e/entry-edit.test.ts, e2e/entry-image.test.ts, e2e/tags.test.ts, e2e/artist-manual.test.ts, e2e/unsaved.test.ts

Themed UI: needs 4.7 checked. The detail page is still U3's placeholder (U12 runs in parallel): after Save assert the
URL `/entries/<id>` and verify through the edit form or `counts()`. `/add/[type]` here renders the manual form for
`?manual=1` and for look; search and preview modes come in U15.

- [x] 11.1 `EntryForm` + `FieldInput` driven by `TYPES` (props per design.md), `save.ts` (`saveFromForm`, freely named unit tests for FormData → EntryInput), `/add/[type]` manual mode with the duplicate-submit guard (Scenario: Create an album manually from the form · Form shows the fields of its type · Empty title is not saved · Double submit creates one entry)
- [x] 11.2 `/entries/[id]/edit` prefilled, Save updates and redirects with a "Saved" toast (Scenario: Edit changes are saved · Toast confirms save · Reduced motion toast appears without sliding)
- [x] 11.3 `ImageField` from Cooking-Hub (file only, browser-side type and 16 MiB check, current image preview) (Scenario: Upload an image in the form · Uploading replaces the current image · Unsupported file shows an inline error · Oversize file shows an inline error)
- [x] 11.4 `TagInput` from Cooking-Hub with suggestions from `listTags` matched by `fold` (Scenario: Add a tag with autocomplete · Typing an existing tag in other case reuses it · Remove a tag)
- [x] 11.5 `ArtistField` for album/song: suggestions from `listArtists`, a chosen artist is a linked chip (`data-linked`), free text stays text (Scenario: Manual entry picks an existing artist · Manual entry types an artist as text only)
- [x] 11.6 `unsaved.ts` + `DiscardDialog.svelte` from Cooking-Hub (`guardUnsaved`, `hideOnOutro` on the dialog) used by `/add/[type]` and `/entries/[id]/edit`; the Save submit and the post-save redirect skip it (Scenario: Leaving a changed form asks first · Discarding leaves the form · Leaving an untouched form does not ask · Changed edit form asks before leaving · Saving does not ask · Reload of a changed form triggers the native prompt · Reload of an untouched form does not prompt)

## 12. Entry detail: status, progress, rating, artist and delete

> unit: depends=5,6,7,10 · scope=S6,S9,S10,S11,S12,S13,S14 · files=src/routes/(app)/entries/[id]/+page.svelte, src/routes/(app)/entries/[id]/+page.server.ts, src/lib/entries/DetailPanel.svelte, src/lib/entries/DeleteEntry.svelte, src/lib/entries/ArtistWorks.svelte, src/lib/ui/StarRating.svelte, src/lib/ui/StatusPill.svelte, src/lib/ui/ProgressControl.svelte, e2e/detail.test.ts, e2e/status.test.ts, e2e/progress.test.ts, e2e/rating.test.ts, e2e/delete.test.ts, e2e/artist-link.test.ts

Themed UI: needs 4.7 checked. The list pages are still U3's placeholder: after delete assert the URL, the toast and
the 404 of the entry. Mobbin: Goodreads book, Letterboxd detail and quick-action bar (design.md).

- [x] 12.1 Detail page: blurred-cover backdrop, cover with `data-cover-id` (or placeholder), glass `DetailPanel` with every filled field per `TYPES`, tags, note, Edit link, 404, `world` from the type's domain (Scenario: Detail shows every filled field · Long title shows in full on detail · Unknown entry answers 404 · Detail pages use their type's domain world · Entry pages mark their domain · Fashion entries without status or rating show no controls)
- [x] 12.2 Status pill action with labels from `copy.ts`, label animation in `StatusPill` (Scenario: Set status from the detail page · Set a piece status from the detail page · Status labels follow the domain · Status pill animates on change · Reduced motion changes status instantly)
- [x] 12.3 Progress controls (− / + / direct input per key, "n / ?", Mark as watched/read) (Scenario: Step episodes with plus and minus · Type progress directly · Ongoing manga shows n / ? · Reaching the total offers Mark as watched · Reaching the chapter total offers Mark as read)
- [x] 12.4 Rating input (pointer halves, arrows, Delete clears, "Clear rating"), fill animation in `StarRating` (Scenario: Rate in half stars · Clear the rating · Keyboard rates with arrow keys · Star fill animates on rate · Reduced motion fills stars instantly)
- [x] 12.5 Artist link and `ArtistWorks` (Cards from `src/lib/ui/Card.svelte`) (Scenario: Album links to its artist · Unlinked artist name shows as text · Artist lists linked albums and songs)
- [x] 12.6 `DeleteEntry` confirm dialog (`hideOnOutro`), redirect to the type's list with a "Deleted" toast (Scenario: Delete asks first and returns to the list · Cancelled delete keeps the entry · Toast confirms delete)

## 13. Settings: hero photos

> unit: depends=7,9,10 · scope=S23 · files=src/routes/(app)/settings/+page.svelte, src/routes/(app)/settings/+page.server.ts, src/lib/settings/HeroSlot.svelte, e2e/settings.test.ts

Themed UI: needs 4.7 checked. Home and domain pages are placeholders here; verify through the slots.

- [x] 13.1 Five `HeroSlot`s (Home, Music, Animanga, Books, Fashion) with upload, replace and remove actions through `storeImage` / `setHero` / `removeHero` (Scenario: Upload a hero photo for Home · Replace a domain hero photo · Remove a hero photo)
- [x] 13.2 Browser-side type and size checks with the entry-image messages (Scenario: Unsupported hero file shows an inline error · Oversize hero file shows an inline error)

## 14. Lists, cards and shelves

> unit: depends=5,6,10,12 · scope=S6,S7,S8,S10,S12,S13,S17,S19 · files=src/routes/(app)/[domain]/[list]/+page.svelte, src/routes/(app)/[domain]/[list]/+page.server.ts, src/lib/entries/EntryCard.svelte, src/lib/entries/Shelf.svelte, src/lib/entries/FilterBar.svelte, src/lib/entries/query.ts, src/lib/entries/query.test.ts, src/lib/entries/dragScroll.ts, src/lib/entries/dragScroll.test.ts, src/lib/entries/tilt.ts, e2e/lists.test.ts, e2e/list-filters.test.ts, e2e/cards.test.ts, e2e/shelves.test.ts, e2e/morph.test.ts, e2e/reveal.test.ts

Themed UI: needs 4.7 checked. Mobbin: Swap cards, Goodreads My Books, Shelf iOS (design.md).

- [x] 14.1 List route (slugs from `LISTS`, 404 otherwise, `world` from the domain) and `EntryCard` (Swap card, `data-cover-id`, two-line clamp, placeholder, stars only when rated) (Scenario: List shows entries of one type · Wardrobe lists owned pieces · Empty list offers Add · Unknown list answers 404 · Long title truncates on cards · Entry without image shows a tinted placeholder with initials · Rated entries show stars on cards · Unrated entries show no stars on cards)
- [x] 14.2 `FilterBar` and `query.ts` (URL ⇄ `ListQuery`; chip changes push history) (Scenario: Filter media by status · Filter by tag · Filter by minimum rating · Filter shops by kind · Filter pieces by status · Sort by title and rating in the list · Filter state survives reload and back · Filters matching nothing offer reset · List query round-trips through the URL)
- [x] 14.3 Shelves view, `Shelf` (sticky header ≥1024 px, count with optional `countAction`, round arrows) and `dragScroll.ts` (mouse only, inertia, none under reduced motion) (Scenario: Shelves view groups media by status · Shelf headers stick on desktop · Shelf headers do not stick on phone · Shelf rows drag-scroll with inertia on desktop · Reduced motion drag-scroll stops on release · Inertia decays to a stop)
- [x] 14.4 Card progress control for in-progress anime/manga, `reveal` on cards with `stagger`, hover lift/tilt (`tilt.ts`, fine pointer only) (Scenario: Progress on the card · Cards reveal on scroll · Reduced motion shows content immediately · Cards lift on hover on desktop · Cards do not tilt on phone · Reduced motion cards do not tilt)
- [x] 14.5 Morph end to end with U10's `pageTransition` and U12's detail cover; observe `view-transition-name`s by patching `document.startViewTransition` in the test (Scenario: Card to detail morphs the cover · Back from detail reverses the morph · Reduced motion skips the morph; manual at Gate 2: Page transitions look smooth)

## 15. Autofill and URL preview UI

> unit: depends=8,11,12 · scope=S14,S15,S16,S25 · files=src/routes/(app)/add/[type]/+page.svelte, src/routes/(app)/add/[type]/+page.server.ts, src/routes/(app)/add/[type]/search/+server.ts, src/routes/(app)/add/[type]/preview/+server.ts, src/lib/entries/SearchPanel.svelte, src/lib/entries/PreviewPanel.svelte, src/lib/entries/handles.ts, src/lib/entries/handles.test.ts, src/lib/entries/save.ts, src/lib/entries/save.test.ts, e2e/autofill.test.ts, e2e/autofill-errors.test.ts, e2e/preview.test.ts, e2e/artist-autofill.test.ts, e2e/handles.test.ts

Themed UI: needs 4.7 checked. All searches and previews hit the fake provider and fake remote (test flag). U11's
`e2e/unsaved.test.ts` must stay green: a search pick or preview prefill counts as unsaved input.

- [x] 15.1 `GET /add/[type]/search` (`search()` + `existingId` via `findByExternal`) and `SearchPanel` (300 ms debounce, abort on change, result rows, "Already in your archive", error/empty with "Add manually" → `?manual=1&title=<query>`) (Scenario: Search shows results with cover, title, creator and year · Typing is debounced · Existing entry shows Already in your archive · Provider error offers Add manually with the query · Provider timeout offers Add manually with the query · No results offers Add manually with the query)
- [x] 15.2 Pick → prefilled `EntryForm` with hidden provider fields; `save.ts` downloads the cover through `storeImageFromUrl`, saving without image and flagging `coverFailed` on failure (Scenario: Picking a result prefills the form · Saved cover is stored locally · Anime search prefills episodes · Ongoing manga autofill leaves totals empty · Original-script author stays editable · Cover download failure saves without cover)
- [x] 15.3 "Add artist" on album/song: `ensureArtist` with the downloaded photo for a new artist, text only when unticked (Scenario: Autofill creates the artist with status none and photo · Autofill links an existing artist · Unticking Add artist stores the name only)
- [x] 15.4 `POST /add/[type]/preview` and `PreviewPanel` for brand, site, influencer and piece (URL validation in the browser, preview image as data URL posted back on Save, name/description only into empty fields, "No preview found") (Scenario: Paste a brand URL and get its preview image · Piece URL preview fills name and image · Icon is used when there is no og:image · Blocked site keeps the form usable · JS-only shell shows No preview found · Login wall shows No preview found · Existing name is not overwritten by the preview · Invalid URL shows an inline error · Private address URL is refused in the form; manual at Gate 2: Previewing a real site)
- [x] 15.5 `handles.ts` (`handlesFromUrl`, design.md → Handle prefill) wired into `PreviewPanel` for influencers, filling only empty handle fields (Scenario: Profile URLs map to handles · Unknown platform fills only the website · Post and video URLs give no prefill · Pasting an Instagram profile fills the handle · Pasting another site fills the website field · A typed handle is not overwritten · Pasting a post URL fills no handle)

## 16. Collections UI

> unit: depends=9,12,14 · scope=S20 · files=src/routes/(app)/collections/+page.svelte, src/routes/(app)/collections/+page.server.ts, src/routes/(app)/collections/[id]/+page.svelte, src/routes/(app)/collections/[id]/+page.server.ts, src/lib/collections/AddToCollection.svelte, src/lib/collections/CollectionCard.svelte, src/routes/(app)/entries/[id]/+page.svelte, src/routes/(app)/entries/[id]/+page.server.ts, e2e/collections.test.ts, e2e/collection-popover.test.ts

Themed UI: needs 4.7 checked. Unit 12's detail tests must stay green. Mobbin: Pinterest boards, Cosmos collection and
save popover (design.md).

- [x] 16.1 `/collections` index with `CollectionCard` (`Collage` + count) and "New collection" (Scenario: Create a collection from the index · Index shows collage and count)
- [x] 16.2 `/collections/[id]`: mixed `EntryCard`s in added order, rename, remove, delete with confirm (Scenario: Collection page shows mixed cards · Remove an entry from a collection · Rename a collection on its page · Deleting a collection asks first)
- [x] 16.3 `AddToCollection` popover on the detail page (`collect`/`uncollect`/`newCollection` actions, `hideOnOutro`) (Scenario: Add an entry from its detail page · Create a collection from the popover · Adding an entry twice from the popover keeps one)

## 17. Domain landing pages

> unit: depends=9,10,14 · scope=S7,S22 · files=src/routes/(app)/[domain]/+page.svelte, src/routes/(app)/[domain]/+page.server.ts, src/lib/domains/SubTabs.svelte, src/lib/domains/AddMenu.svelte, e2e/domain-pages.test.ts, e2e/parallax.test.ts

Themed UI: needs 4.7 checked.

- [x] 17.1 Domain page: `PhotoHero` with the domain hero or gradient, title, `SubTabs` from `LISTS`, 404 for unknown domains (Scenario: Domain page shows its hero photo · Domain without hero photo shows the theme gradient · Sub-type tabs per domain · Unknown domain answers 404)
- [x] 17.2 `AddMenu` listing the domain's types → `/add/[type]` (`hideOnOutro`) (Scenario: Add offers the domain's types)
- [x] 17.3 Shelves from `domainShelves` with `Shelf` + `EntryCard` and section `reveal` (Scenario: Domain shelves show its entries)
- [x] 17.4 Parallax end to end (Scenario: Hero photo moves with scroll · Reduced motion keeps the hero still; manual at Gate 2: Scroll motion looks calm)

## 18. Home

> unit: depends=9,10,14 · scope=S8,S9,S21 · files=src/routes/(app)/+page.svelte, src/routes/(app)/+page.server.ts, src/lib/home/Coverflow.svelte, src/lib/home/coverflow.ts, src/lib/home/coverflow.test.ts, src/lib/home/countUp.ts, src/lib/home/CollectionsBento.svelte, src/lib/home/Welcome.svelte, e2e/home.test.ts, e2e/coverflow.test.ts, e2e/count-up.test.ts

Themed UI: needs 4.7 checked. Follows the approved Home mockup. Mobbin: Frontify hero, Spotify Loud&Clear, Zellerfeld,
Shader strip, Apple Music shelves (design.md).

- [x] 18.1 Home hero (`PhotoHero` with the home hero or gradient, eyebrow, serif headline with the accent word) (Scenario: Home shows the hero photo and headline · Home without hero photo shows the world gradient)
- [x] 18.2 `Coverflow` + `coverflow.ts` (Cooking-Hub's FeaturedStack as start: 3D tilt, counter, RoundNav, keys, pointer swipe, hidden at 0, no arrows at 1) (Scenario: Coverflow shows the most recent entries with images · Coverflow tilts the neighbours · Coverflow arrows step through entries · Arrow keys step the coverflow on desktop · Swipe steps the coverflow on phone · Single entry coverflow has no arrows · Coverflow is hidden without entries with images · Reduced motion coverflow steps without tilt · Coverflow index clamps at the ends; manual at Gate 2: Coverflow and shelves feel like the inspiration)
- [x] 18.3 Shelves from `homeShelves`, `CollectionsBento`, `Welcome` for the empty archive (Scenario: In progress shelf lists media in progress · Recently added shelves per domain · Collections bento shows collages · Empty archive shows a welcome per domain)
- [x] 18.4 `countUp.ts` passed to `Shelf` as `countAction` and used on bento counts (Scenario: Home counts count up on first view · Reduced motion shows final counts immediately; manual at Gate 2: Home looks like the approved mockup · Micro-interactions feel alive)

## 19. Layout check, Done journey and release 0.1.0

> unit: depends=2,11,12,13,14,15,16,17,18 · scope=S2,S24 · files=e2e/layout.test.ts, e2e/journey.test.ts

Any fix to a shared component that the layout check forces belongs to this unit: commit it separately and list every
screen it reaches under `deviations`.

- [x] 19.1 `e2e/layout.test.ts` over every main screen with seeded data (Scenario: Real screens share one alignment rule · Desktop uses the width · No horizontal page scroll on phone; manual at Gate 2: Desktop layouts look composed)
- [x] 19.2 `e2e/journey.test.ts` walks proposal.md → Done criteria through the real UI with the fakes, one freely named test per criterion ("Done: …"): Blonde → Frank Ocean linked → Listened → 4.5; Frieren 28/28 → Mark as watched; Vagabond "0 / ?"; brand preview and blocked-site upload; owned piece in Wardrobe; tag + mixed collection with collage; Home hero, coverflow and shelves; domain worlds; morph and reveal; the same journey under reduced motion
- [x] 19.3 ⚠ irreversible (a published release after merge) Release check, no bump: `git tag -l` lists nothing, `scripts/version.test.ts` is green on 0.1.0, `npm run package` writes `dist/creative-archive-0.1.0.tgz` + `.sha256`; report all three. The tag `v0.1.0` is pushed by flow's shipper after the merge, never by the builder (Scenario: No tag exists before the first release, plus a rerun of U1's Package and lockfile carry 0.1.0; manual at Ship: Release v0.1.0 published)
