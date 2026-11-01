## Context

`~/Repos/Creative-Archive` holds only `openspec/` (config copied from Rues-Cooking-Hub) and this change; `main` has no
commits and there is no remote. Everything is created here. The shape — Kit 3 without `svelte.config.js`, `#lib`
imports, node:sqlite with numbered migrations, sharp → WebP BLOBs, tokens.css, the harness, CI and release — is copied
from `~/Repos/Rues-Cooking-Hub` (read it, never modify it). The app runs later on the homelab behind nginx on plain
HTTP, single user, no login (deploy is the split-off `creative-archive-deploy` change). Sources: scope.md (Gate 0, the
S-items), explore-notes.md (research, dialogue answers, API probe, Mobbin references), UI inspiration in
`/home/Rue/Pictures/UI-inspo/` (five images).

## Goals / Non-Goals

**Goals:** everything in scope.md S1–S26 (S25/S26 added at Gate 1), built on one generic entry model so the 11 types share CRUD, list and detail
code, and so the split-off `rediscovery` change can read status events without a migration.

**Non-Goals:** as in proposal.md → Non-Goals.

## Decisions

From scope.md (Gate 0), unchanged:
- One change for everything — Rue: "Alles in einer Change".
- Deezer is the single music provider (albums, artists with photos, tracks), not MusicBrainz — probe showed MusicBrainz has no artist images and needs 1 req/s; Deezer works keyless.
- Media status includes "none" — so auto-created artists don't get a fake status.
- Status changes are stored as dated events — cheap now, feeds the split-off rediscovery change.
- Covers/images stored in SQLite as WebP BLOBs like Cooking-Hub — backups include images, no hotlinking.
- Each domain is a full light or dark world chosen from mockups (S5) — Rue: "Mockups entscheiden lassen".
- Hero photos are Rue's uploads; CC0 photos only for mockups/fixtures.
- UI language English.
- GitHub repo `Rue-Asha/Creative-Archive` is created and pushed only at ship after Gate 2; `ship: merge`, `release: tag`.

Technical decisions (planner):
- **Git root.** `main` is unborn. As in Cooking-Hub, the orchestrator may create one empty local bootstrap commit on
  `main` (`git commit --allow-empty -m "chore: bootstrap"`) before `git switch -c flow/build-creative-archive`, so
  `main` is an ancestor of the feature branch and Gate 2 / the PR can diff `main...flow/build-creative-archive`.
  Pushing that `main` is a ship step (runbook, U2).
- **Version.** U1 sets `0.1.0` in package.json and the lockfile (the repo has no tags; this is the first release) with
  `scripts/version.test.ts` "Scenario: Package and lockfile carry 0.1.0". The final unit (U19) bumps nothing: it
  checks `git tag -l` is empty and the version test is green, and the shipper tags `v0.1.0` after the merge (ship.md
  *Release*).
- **Stack.** Same pins as Cooking-Hub's package.json: `@sveltejs/kit ^3.0.1`, `svelte ^5.57`, `vite ^8.3`,
  `vitest ^5`, `typescript ^6`, `@sveltejs/adapter-node ^6`, `@playwright/test ^1.64`, `svelte-check ^4.7`,
  `@types/node`; `sharp ^0.35` in `dependencies` (U7). No other runtime dependency; no animation, HTML-parser or
  state library.
- **One entry table.** All 11 types live in `entries` (Contracts → Schema). Columns hold what is queried, filtered,
  sorted, constrained or linked (type, title, status, rating, progress, kind, artist link, provider id, image);
  display-only per-type fields live in a `details` JSON column. A per-type config (`TYPES`, Contracts → Type config)
  drives the form, detail panel, list filters, status labels and which controls appear, so CRUD/list/detail code is
  written once.
- **Brand vs Shop/Site.** Both types share fields including `kind` (brand | shop | site). The type follows the kind:
  `kind = brand` → type `brand`, `kind = shop | site` → type `site`; editing the kind moves the entry between the
  Brands and Shops tabs. The kind filter (S19) is offered on the Shops list (shop | site).
- **Status events.** `status_events(entry_id, status, at)`; written by `setStatus` only when the status changes, and
  by `createEntry` when a media entry is created with a status other than `none`. Deleted entries take their events
  with them (cascade).
- **Rating storage.** `rating_x2 INTEGER 1..10` (half stars, no floats); the read model exposes `rating = rating_x2 / 2`.
- **Artist link.** `artist_id` (nullable, `ON DELETE SET NULL`) plus `artist_name` text on albums and songs; deleting
  the artist clears the link and keeps the text. Autofill matches artists by `(type='artist', provider='deezer',
  external_id)`; same name with a different Deezer id is a different artist.
- **Tags.** `tags.name_key = fold(name)` (NFC, trim, collapse whitespace, JS `toLowerCase()`), unique. SQLite `NOCASE`
  folds ASCII only, so it is never used for tags or title sort. Tags with no entries are deleted in the same
  transaction that removed their last use; autocomplete therefore only lists used tags.
- **Title sort.** `title_key = fold(title)` is a stored derived column for equality; sorting by title happens in JS
  with `Intl.Collator('en', { sensitivity: 'base', numeric: true })` so "Ästhetik" sorts with A.
- **Providers (S15).** One `Provider` interface (Contracts) with Deezer, AniList and Open Library implementations
  built on an injected `FetchJson`; `providerFor(type)` returns the fake provider when `CREATIVE_ARCHIVE_TEST=1`. All
  requests send `User-Agent: Creative-Archive/<version> (private archive)`, run through `safeFetch` (timeout 5 s, 1 MB
  cap) and are aborted after `SEARCH_TIMEOUT_MS = 5000`. Deezer's search payloads carry no release date (planner
  knowledge, **unverified** — the builder confirms against the fixture shapes it writes): album and track search
  enrich the first 8 results with `GET /album/{id}` in parallel inside the same 5 s budget; a failed enrichment leaves
  `year: null`. AniList: one GraphQL `Page(perPage: 10) { media(type, search) }` query. Open Library:
  `search.json?q=…&limit=10&fields=key,title,author_name,first_publish_year,cover_i`, covers from
  `https://covers.openlibrary.org/b/id/<cover_i>-L.jpg` (redirects, followed and re-checked by `safeFetch`).
- **Search UI.** The client debounces typing by 300 ms, aborts the in-flight request when the query changes, and calls
  `GET /add/[type]/search?q=`. Result thumbnails load from the provider CDN in the browser (transient, nothing stored
  points at them); the fake provider's cover URLs are `/__test/image/<name>.png`, so e2e loads them from the app.
  Picking a result fills the form client-side; Save posts hidden `provider`, `externalId`, `coverUrl` and, for
  albums/songs, `artistExternalId`, `artistName`, `artistImageUrl`, `addArtist`. The server downloads the cover (and
  the artist photo for a newly created artist) through `getRemote().fetchImage` on Save. A failed download saves the
  entry without the image and shows "Cover could not be downloaded" on the detail page (S15 provider-error edge).
- **URL preview (S16).** `POST /add/[type]/preview` (JSON `{ url }`) runs `readPreview(url)` → page through
  `getRemote().fetchPage`, then parses `og:title` / `og:image` / `og:description`, falling back to `<title>` and to
  `<link rel~="icon">` / `/favicon.ico` for the image. The preview image is downloaded and converted to WebP right
  away and returned as a `data:image/webp;base64,…` URL (≤ 200 KB after sharp), which the form shows and posts back
  on Save as a hidden field; the server re-validates it through `storeImage`. No orphan image rows, no hotlinking.
  "No preview found" shows when no image was found; a found title only fills an empty name field.
- **SSRF guard (R7).** `safeFetch(url, opts)` in `src/lib/server/net.ts`: http/https only; resolves the host itself
  (`dns.lookup` with `all: true`, injectable for tests) and refuses loopback, private, link-local, CGNAT, unspecified,
  multicast and ULA addresses (IPv4 and IPv6, including IPv4-mapped IPv6) and the name `localhost`; connects with
  `node:http`/`node:https` `request` using a `lookup` that returns only the checked address, so DNS rebinding between
  check and connect is impossible; follows at most 3 redirects manually, re-checking each hop; aborts after 5 s;
  stops reading at `maxBytes` (1 MB for pages — the head is parsed from what arrived; 16 MB for images, where
  exceeding is an error). Cooking-Hub's import fetch had no private-address refusal (its R8); this one does, which is
  why e2e uses the fake remote rather than a localhost fixture server.
- **Test-mode seams.** `CREATIVE_ARCHIVE_TEST=1` switches on `/__test/*`, `/__mockups/*`, the fake provider and the
  fake remote (`getRemote()`), in one place each (`testFlag()`). Production code never imports a fake directly.
- **Images.** Copy Cooking-Hub's `images.ts` downscale loop (long side ≤ 1600, WebP quality 80 → 40 until ≤ 200 KB);
  accepted formats `jpeg, png, webp, gif, avif, heif` as far as prebuilt sharp decodes them (AVIF yes; HEVC-coded HEIC
  no — a non-goal since Gate 1, such files get "Unsupported image type");
  `MAX_UPLOAD_BYTES = 16 MiB`, checked in the browser before upload and again on the server. adapter-node's
  `BODY_SIZE_LIMIT` must exceed the image limit plus the other form fields, so the e2e server, README and the deploy
  change use `BODY_SIZE_LIMIT=17M` (Cooking-Hub used 16M with a 15 MB limit). Entry images are not shared: replacing
  or removing an image, or deleting the entry, deletes the old `images` row.
- **Placeholder.** Entries without an image render `ImagePlaceholder` — the domain's accent-soft tint with the title's
  initials (`initials(title)`: first letters of the first two words, Unicode-aware, uppercase; one word → first two
  graphemes).
- **Worlds (S4/S5).** A world is two attributes on the app wrapper: `data-scheme="light|dark"` selects the full
  ground/surface/ink/glass/line/scrim token set, `data-accent="<name>"` selects `--accent`, `--accent-ink`,
  `--accent-soft`, `--accent-wash`. `src/lib/styles/worlds.ts` holds `WORLDS: Record<World, { scheme, accent }>`; the
  pick at the ⏸ checkpoint changes only that object (data), never CSS or components. Home, Collections and Settings
  use the `home` world; a domain page, its lists, its add pages and its entries' detail pages use the domain's world.
- **Route layout.** App pages live in `src/routes/(app)/` whose `+layout.svelte` (U10) holds the nav, toast host, the
  world wrapper and `<main>`; the root `+layout.svelte` only imports `global.css` and sets `html[data-hydrated]`.
  `/__mockups/*` and `/__test/*` sit outside the group and answer 404 unless `CREATIVE_ARCHIVE_TEST=1`.
- **Server API style.** Pages use `load` + form actions with `use:enhance`; status, rating, progress and collection
  changes are small form actions submitted programmatically. JSON endpoints only for search and preview. Every write
  goes through a function in `src/lib/server/*.ts`; routes parse FormData and map errors to field messages.
- **Duplicate submits.** Every form disables its submit control while a submission is pending and ignores further
  submits (LEARNINGS: a duplicate Save during a 160 ms outro made a Cooking-Hub test flaky).
- **Outro transitions.** Any menu, popover, sheet, dialog or toast with an outro sets `aria-hidden="true"` on
  `outrostart` and clears it on `introstart` (pattern from Cooking-Hub `src/lib/plan/Entry.svelte`); a unit adding a
  new e2e file runs it with `--repeat-each 5` before committing.
- **Mockup photos (S3).** U4's builder downloads ~10 CC0 photos once from the Openverse catalogue
  (`https://api.openverse.org/v1/images/?q=<term>&license=cc0&page_size=20`, search calls allowed) — at most 15 image
  downloads in total — into `fixtures/mockups/`, and lists each as `file | source URL | author: … | licence: …` in
  `fixtures/mockups/CREDITS.txt` (Cooking-Hub format). Unsplash photos are under the Unsplash License, not CC0, so
  they are not used. A shape that isn't found (e.g. a square record cover or a tall book cover) is generated with
  sharp by `scripts/synthetic-photo.mjs` and credited as `author: generated | licence: generated (scripts/synthetic-photo.mjs)`.
  That download is the only network use in the build besides npm installs (`npm pack @fontsource/*` counts as an
  npm install). Photos never go to `static/`; `/__mockups/photo/[name]` serves them from `MOCKUP_PHOTOS_DIR` (default
  `<package root>/fixtures/mockups`; Playwright sets it to the repo's folder so CI's unpacked tarball works), so the
  tarball never contains them. e2e upload tests use the same files.
- **E2E isolation.** One server per run on `$PORT`, database `.e2e/$PORT.db` removed before start, `workers: 1`, every
  data test starts with `reset()` and seeds what it needs (Contracts → E2E helpers). Tests that don't assert motion
  call `calm(page)` (reduced motion). Bigger alternative: one server + database per project — buys about half the
  suite time, costs a second port per unit that `flow-unit` doesn't hand out.
- **Page transitions (S6).** `onNavigate` in `(app)/+layout.svelte` calls `pageTransition(navigation)`
  (`src/lib/shell/morph.ts`, U10): it returns early under reduced motion or without `document.startViewTransition`
  (plain navigation, no error); otherwise it starts a view transition. Cover morph naming is dynamic so a page never
  holds two equal `view-transition-name`s (duplicates abort the transition): forward to `/entries/<id>`, the clicked
  element `[data-cover-id="<id>"]` (the last clicked card's cover, else the first visible match) gets
  `view-transition-name: cover-<id>` in the old DOM and the detail cover in the new DOM; back from `/entries/<id>`,
  the detail cover in the old DOM and the first `[data-cover-id="<id>"]` in the new DOM. All other navigations
  crossfade (root transition only). Cards and the detail cover only render `data-cover-id`; they never set names.
- **View Transitions support (R5), unverified.** Same-document View Transitions (`document.startViewTransition`)
  shipped in Chromium 111 and Safari 18; Firefox shipped them in Firefox 144 (October 2025), so a current Firefox /
  LibreWolf should morph — planner knowledge, **not verified** in this session. `view-transition-class` and
  view-transition types may still be missing in Firefox; the morph uses only `view-transition-name` and
  `::view-transition-*` pseudo-elements. The fallback (feature detection, plain navigation) is tested with
  `startViewTransition` deleted in the page. Rue checks the morph in LibreWolf at Gate 2 (manual).
- **Handle prefill (S25, Gate 1).** On the influencer form, the URL pasted into the preview field also runs
  `handlesFromUrl(url)` (`src/lib/entries/handles.ts`, pure): `instagram.com/<name>` → instagram, `tiktok.com/@<name>`
  → tiktok, `youtube.com/@<name>` (also `/c/<name>`, `/user/<name>`) → youtube, with or without `www.`/`m.` and trailing
  slash; any other http(s) URL → `{ website: <url> }`; Instagram posts/reels (`/p/`, `/reel/`, `/stories/`), TikTok
  videos (`/@<name>/video/…`) and YouTube videos (`/watch`, `/shorts/`, `youtu.be/…`) → `null` (no prefill). Only
  empty handle fields are filled; a handle Rue already typed stays.
- **Unsaved-changes guard (S26, Gate 1).** Copied from Cooking-Hub `src/lib/recipes/unsaved.ts` +
  `DiscardDialog.svelte`: the add and edit forms compare their current values with the values they opened with; when
  they differ, `beforeNavigate` cancels in-app navigation and shows a "Discard changes?" dialog (Keep editing /
  Discard), and `beforeunload` triggers the browser's native prompt on reload/close. Untouched forms, the submit that
  saves, and the redirect after a successful save never ask. A prefill from a search pick or URL preview counts as
  unsaved input.
- **Inertia.** Mouse drag-scroll on shelves is custom (`pointerType === 'mouse'`, velocity decay after release);
  touch keeps native scrolling, which already has momentum. Hover lift/tilt only under `(hover: hover) and
  (pointer: fine)`.
- **Count-up.** Home shelf-header counts and collection counts animate from 0 on first view (IntersectionObserver),
  once per page load.

## Reference files to copy from Rues-Cooking-Hub

Builders copy these and adapt names; they don't reinvent them. Paths are relative to `~/Repos/Rues-Cooking-Hub`.

| Source | Target | Unit | Adapt |
|---|---|---|---|
| `openspec/config.yaml` | same | planner (done) | — |
| `package.json` (scripts, `imports`, `engines`, devDependencies) | same | U1 | name `creative-archive`, version `0.1.0`, no markdown-it; `shots:mockups` added by U4, `sharp` by U7 |
| `vite.config.ts`, `tsconfig.json`, `.gitignore`, `src/app.d.ts`, `src/app.html` | same | U1 | title "Creative Archive" |
| `playwright.config.ts` | same | U1 | env `CREATIVE_ARCHIVE_TEST=1`, `BODY_SIZE_LIMIT=17M`, `MOCKUP_PHOTOS_DIR` |
| `src/routes/+layout.svelte`, `src/hooks.server.ts` | same | U1 | — |
| `src/lib/server/db.ts` + `db.test.ts` | same | U1 (U3 adds `resetDb`) | default `./data/creative-archive.db` |
| `src/lib/server/test-flag.ts` | same | U1 | `CREATIVE_ARCHIVE_TEST` |
| `src/routes/healthz/+server.ts` + `healthz.test.ts` | same | U1 | — |
| `scripts/package.mjs`, `scripts/package.test.ts`, `scripts/server.test.ts`, `scripts/version.test.ts` | same | U1 | name `creative-archive`; package test lists the exact top-level entries |
| `CLAUDE.md` (`## Harness`, e2e paragraph, Learnings line on outro `aria-hidden`) | same | U1 | names, test flag, 17M |
| `.github/workflows/ci.yml`, `gate.yml`, `release.yml`, `.github/dependabot.yml` | same | U2 | SHA pins unchanged; bump inputs below |
| `docs/release.md` | same | U2 | repo, names, steps below |
| `src/lib/text.ts` (`fold`) | same | U3 | — |
| `src/routes/__test/{reset,seed}/+server.ts`, `src/routes/__test/test-routes.test.ts`, `e2e/helpers.ts` | same | U3 | new shapes (Contracts) |
| `src/lib/styles/{tokens.css,tokens.ts,tokens.test.ts,global.css}` | same | U4 | scheme + accent sets |
| `src/lib/motion.ts` + `motion.test.ts` | same | U4 | `coverName` instead of `heroName` |
| `static/fonts/*` (Fraunces, DM Sans + OFL) | `static/fonts/` | U4 | only if U4 picks that pair |
| `src/lib/ui/*.svelte` (GlassPanel, PillNav, ArrowButton, RoundNav, Button, Chip, Counter, Kicker, ImagePlaceholder) | `src/lib/ui/` | U4 | starting points; Card becomes the Swap card |
| `src/routes/__mockups/**`, `src/lib/mockups/{fixtures.ts,credits.test.ts}`, `e2e/{design,mockups}.test.ts` | same | U4 | photos from `fixtures/mockups/` |
| `src/lib/server/images.ts` + `src/routes/images/[id]/+server.ts` | same | U7 | 16 MiB; URL download through `getRemote()` |
| `src/lib/server/import.ts` (`readCapped`, timeout) | `src/lib/server/net.ts` | U7 | plus address checks and manual redirects |
| `src/lib/server/tags.ts` | same | U5 | entries instead of recipes |
| `src/lib/recipes/TagInput.svelte`, `ImageField.svelte` | `src/lib/entries/` | U11 | 16 MiB |
| `src/lib/recipes/unsaved.ts`, `DiscardDialog.svelte` | `src/lib/entries/unsaved.ts`, `DiscardDialog.svelte` | U11 | add and edit forms |
| `src/lib/plan/Entry.svelte` (outro `aria-hidden` pattern), `src/lib/plan/Sheet.svelte` | pattern | U11, U12, U16, U17 | — |
| `src/lib/recipes/coverflow.ts` + `FeaturedStack.svelte` | `src/lib/home/coverflow.ts`, `Coverflow.svelte` | U18 | 3D tilt, 20 items |

**release.yml bump target.** `bump` calls `Rue-Asha/ci/.github/workflows/bump-pin.yml@7b49f3dcf37c61aea3722e68917bc06db507f386 # v1.1.0`
with `app: creative-archive`, `host_vars_path: ansible/inventory/host_vars/creative-archive01/vars.yml`,
`variable: creative_archive_version`. That file does not exist in Homelab-Managment yet — the split-off
`creative-archive-deploy` change creates it — so the bump job fails on `v0.1.0` while `publish` succeeds (accepted,
as Cooking-Hub's R4). The workflow stays mirrored so nothing changes once the deploy change lands.
**CI can't run before ship:** the GitHub repo is created at ship (runbook), and PR checks run on the homelab
`homelab-check` runner, which needs the repo registered in Homelab-Managment's `check_runner_repos` first (runbook step).

## Visual brief

Builders and the design unit work from this section, not from the conversation.

**Inspiration** (`/home/Rue/Pictures/UI-inspo/`, all five; U4 opens every image): full-bleed photography behind a
large rounded app frame; frosted glass panels floating over the photo; a large light serif headline mixed with sans,
one accent word in italic/accent colour; centred pill nav, round icon buttons, a dark pill CTA ending in an arrow
inside a circle; tracked-out uppercase eyebrow ("MUSIC — ANIMANGA — BOOKS — FASHION"); bento bottom row with a
featured card (photo, "01 / 06" counter, prev/next round arrows), a stats card and one dark card; a fanned 3D
coverflow with "01/20" counters and tag chips (Mindframe); muted palettes (warm beige/stone, greys) plus one image
with deep green + red blocks and chunky display type (NOAL); one dark variant (grey glass on black, black dots,
numbered pager).

**Mobbin references per screen** (from explore-notes.md; cite by URL, further research only in a subagent via
`mcp__mobbin__*`):

| Screen / element | References |
|---|---|
| Home (rediscovery feed, floating pill nav, shelves) | Cosmos For You https://mobbin.com/screens/e69def6d-af58-4a2d-8377-e0e81b2b5b45 · Apple Music shelves https://mobbin.com/screens/97b9afbb-a285-4693-bc73-efd070107178 https://mobbin.com/screens/8c345080-d9bd-4ad5-a6c7-8e5b32445b20 |
| Home hero / coverflow / glass | Frontify serif hero + glass frame https://mobbin.com/sites/sections/2d1eac14-3056-4a94-b927-adecc9d3526f · Spotify Loud&Clear fanned cards https://mobbin.com/screens/44b16bcf-33e8-410c-87e3-046be5d38f0a · Zellerfeld coverflow https://mobbin.com/sites/sections/99379b0a-ae8d-48cc-a359-eac6aa7f3f00 · Shader 3D strip https://mobbin.com/sites/sections/e979a89e-2179-4f3d-96dd-4d42ed01afb8 · Mistral peek carousel https://mobbin.com/sites/sections/fc0d02b9-2df2-4539-8819-51c2d1e0bf64 · Spotify glass stat panels https://mobbin.com/screens/b93bf303-5908-4beb-8636-f8f2d79b7bbf |
| Entry detail (blurred-cover backdrop, glass panel, status split-pill, stars) | Goodreads book https://mobbin.com/screens/fba5e209-74c3-4a67-a61b-627d7ca63513 · Letterboxd detail https://mobbin.com/screens/ed3357be-d60a-40a2-9608-fa4997929f24 · Letterboxd quick-action bar https://mobbin.com/screens/eba068df-917c-47da-9641-c694181486b7 · Letterboxd log sheet (half stars, note, tags) https://mobbin.com/screens/f58dd9bd-5788-472e-bc4a-2723f03bae89 |
| Lists, shelves view grouped by status | Goodreads My Books https://mobbin.com/screens/edc73cdd-fa6d-4354-b677-a4585af306b1 · Shelf iOS list https://mobbin.com/screens/7d1f3384-fae8-4409-98fc-79cd7d0de027 · Notion board https://mobbin.com/screens/f1724632-5d42-47ff-96cc-7884f9733a00 (take the status grouping, not the kanban) |
| Shared card (all domains) | Swap brand cards (photo, chip TL, name BL, round arrow BR) https://mobbin.com/sites/sections/3ba10283-c38e-4a8f-850d-9f2f2a0bf381 |
| Fashion: brands/shops/influencers, looks | Variant URL moodboard https://mobbin.com/screens/44229a5a-7e15-4dc8-9698-c24a56534cb9 · Savee profile https://mobbin.com/screens/e7cf7608-8b14-4d14-a3aa-cb5c7bb7b3e3 · Savee board https://mobbin.com/screens/ffb7f6ea-4e36-41fe-b8e8-df374ea0eec8 |
| Collections index / page, add-to-collection popover | Pinterest boards https://mobbin.com/screens/f19eb118-a528-4b5e-9c95-77dfd923d293 · Cosmos collection https://mobbin.com/screens/f50a3921-35cc-4d7f-ae07-0f2643c05bae · Cosmos save popover https://mobbin.com/screens/d2d59edc-b766-4cd3-8690-fce9725424fe · Letterboxd list hero https://mobbin.com/screens/f6fb900c-adec-48b3-bd65-56b4c4ccddd1 |

Not used (split off or later): the year-in-review and stats references (Letterboxd, Spotify Wrapped, Brink).

**Worlds** (as built by U4, revised after Rue's ⏸ round 1: "light looks off, dark looks good, more like iOS liquid
glass, no pink"). Dark is the base; one light variant per world stays reachable for comparison only. A world is three
attributes on the app wrapper — `data-scheme`, `data-accent`, `data-font` — each selecting a token block in
`src/lib/styles/tokens.css` (mirrored in `tokens.ts`, checked by `tokens.test.ts`). Scheme tokens: `--ground`,
`--surface`, `--surface-2`, `--line`, `--ink`, `--ink-2`, `--muted` (decoration only), `--solid` / `--on-solid` (the
pill CTA, cream on dark), `--on-photo`, `--glass` / `--glass-strong` (text-carrying glass fills, opaque enough for
4.5:1 over a white and a black photo), `--glass-thin` (decoration), `--glass-border`, `--glass-filter`, `--glass-rim`
(inner rim light), `--glass-sheen` (edge sheen), `--ambient` (accent glows behind the page), `--scrim`,
`--scrim-end`, `--shadow-card`, `--shadow-float`, `--focus-ring`; per accent and scheme `--accent`, `--accent-ink`,
`--accent-soft`, `--accent-wash`, `--accent-glow`; `--grain` (matte noise, base token). Dark: ground `#0D0D10`, ink
`#F3F1EC`; light: neutral `#ECEAE6` / `#1C1B19` (no warm beige). Material: `.liquid` in `global.css` — frosted tinted
fill + grain, `backdrop-filter: var(--glass-filter)`, rim light, a masked gradient ring as edge sheen; used by
GlassPanel, PillNav, glass chips/buttons, the StatusPill menu, collection cards and the filter bar. Colour carries
down the page through ambient glows: the world wrapper's `--ambient`, and on mockup shelves/lists/collections a
blurred layer of the section's own covers behind it (`.glow`). Accent candidates (light / dark value): home — stone
`#7A6A5B` / `#C9B8A4`, inkblue `#3E4C6B` / `#9EB0DA`; music — ember `#C2502E` / `#F27D58`, violet `#6D4BC3` /
`#AD93F4`; animanga — electric `#2A5FEA` / `#729EFF`, neon `#0E7C86` / `#4FD8D3` (sakura dropped: no pink); books —
moss `#4F6B3A` / `#A6C487`, oxblood `#7A2E2E` / `#DE8A80`; fashion — noir `#1C1C1C` / `#EDE6DA`, clay `#A35A3D` /
`#E3A07F`. `WORLDS` is provisional (every world dark, first candidate) until the pick.

**Type.** Three OFL pairings, one token block each (`data-font="a|b|c"`: `--font-display`, `--font-text`,
`--display-weight`, `--display-tracking`, `--display-leading`, `--display-scale`, `--accent-style`,
`--accent-weight`), compared on `/__mockups/components` and switchable on every mockup with `?font=`: **a** Bricolage
Grotesque (opsz/wght) + Figtree — characterful grotesk, accent word in a lighter weight; **b** Syne + Manrope —
expanded editorial/fashion grotesk; **c** Bodoni Moda (opsz, with italic) + Hanken Grotesk — fashion didone with an
italic accent word. Cormorant Garamond (round 1) is dropped, and the "default AI serif" family (Fraunces, Instrument
Serif, Tiempos/Copernicus-style transitional serifs, Cooking-Hub's Fraunces + DM Sans) is avoided. `FONT` in
`worlds.ts` holds the pairing (provisional `'a'`); `app.html` preloads that pairing's two files, so a different pick
also swaps the two preload lines. All faces are latin woff2 from `@fontsource-variable/*` in `static/fonts/` with
their OFL texts. Scale: display 64/44/32 desktop, 40/32/26 phone (times `--display-scale`); body 16; small 13;
eyebrow 11–12 uppercase 0.2em tracking; counters in tabular numerals.

**Components** (`src/lib/ui/`, U4; props in Contracts): GlassPanel (liquid glass, radius 28), PillNav (liquid glass,
the active item a gliding `--solid` pill), ArrowButton (44 px circle, → ↗ ←; solid / inverse / accent / glass /
outline), RoundNav (prev outlined + next filled), Button (solid pill CTA with a trailing inverse arrow circle; accent;
secondary outlined; glass), IconButton, Icon, Chip (tag chip outlined, active filled with the accent; glass and soft
tones), Card (Swap pattern: photo full-bleed, glass chip top-left, title bottom-left over the scrim, glass round
arrow bottom-right — top-right when a control row sits under the title; radius 24; shape square / portrait / tall),
StatusPill (accent split pill: left = current label, right = chevron opening a liquid-glass menu), StarRating (5 stars,
half fills, display and input modes), ProgressControl (− value / total +, "n / ?", 44 px targets), Counter
("01 / 20"), Eyebrow, ImagePlaceholder (accent glow + soft tint + grain, initials in the display face), Collage (up to
3 images, placeholder when empty).

**Motion set** (Rue confirmed all four kinds in explore; transform/opacity only; every item has a reduced-motion
path; the test-visible proxy is what e2e asserts):

| Item | Behaviour | Test-visible proxy | Reduced motion |
|---|---|---|---|
| S6 cover morph | card cover morphs into the detail cover, back reverses | `startViewTransition` called; old and new `[data-cover-id]` carry `cover-<id>` during the transition | not called, no names set |
| S6 crossfade | other in-app navigations crossfade | `startViewTransition` called | not called |
| S6 fallback | no View Transitions support → plain navigation | no page error, URL and content change | — |
| S7 reveal | sections/cards fade-rise in when they enter the viewport, staggered 40 ms | `data-revealed` set on intersect; before it the element has opacity < 1 | visible at once, `data-revealed` on mount |
| S7 parallax | hero photo translates slower than scroll | hero image transform changes with scrollY | transform unchanged |
| S7 sticky shelf headers | on desktop (≥1024) shelf headers stick while their row scrolls past | computed `position: sticky` | same (not motion) |
| S8 coverflow | centre card flat and largest, neighbours rotated in 3D; "01 / N"; arrows, keys, swipe | `data-active` card, neighbours' transform has rotateY ≠ 0, counter text | no rotation, instant step |
| S8 drag-scroll | mouse drag scrolls a shelf, continues with decaying velocity after release | `scrollLeft` keeps increasing after `mouseup` | stops on release |
| S8 hover lift/tilt | desktop hover lifts and tilts a card toward the pointer | card transform not `none` while hovered | no transform |
| S9 star fill | stars fill with a short scale pop | running animation on the changed star | none, final state |
| S9 status pill | label slides/fades to the new status | running animation on the pill label | none |
| S9 toast | "Saved" / "Deleted" toast slides in, auto-hides after 3 s | `role="status"` with the text | appears without sliding |
| S9 count-up | Home counts tick from 0 to N on first view | number text below N right after reveal, N at the end | N at once |

**Alignment rule (one for all main screens, S24).** Content sits in one centred column, `max-width: 1200px`, side
gutter 16 px on phone, 32 px from 768 px, 40 px from 1280 px; page headers (eyebrow + serif title) and every section
or shelf heading start at the column's left edge; only full-bleed heroes, the detail backdrop and the nav leave the
column; the top nav is centred on the column. Shelves bleed to the right viewport edge on phone only.

**Desktop (≥1280) is judged as seriously as phone** — use the width, no stretched phone column:
- Home: framed hero (rounded frame, photo, serif headline + eyebrow left, coverflow right half); shelves across the
  column showing ~6 cards; collections bento of 4 columns (one 2×2 feature collage, the rest 1×1).
- Domain page: hero band ~56 vh full-bleed with title and the sub-type tabs as a glass pill row; shelves below.
- List: one header row (title + count + Add) and one filter row (status chips, tag select, min rating, sort, grid /
  shelves toggle); grid of 5 cards (≈224 px) at 1200 px; 2 per row on phone.
- Detail: blurred-cover backdrop full-bleed; cover 400 px left (sticky), glass panel right with title, creator,
  status split-pill, rating, progress, tags, note, actions; artist works shelf below for artists.
- Add: search/URL panel left, form right (after a pick or in manual mode both visible); phone stacks them.
- Collections index: collage cards in 4 columns; collection page: the list grid.
- Settings: five hero slots in one row of five (desktop), stacked (phone).
Phone: one column, nav at the bottom, content padded clear of it. Legibility: card titles clamp to 2 lines
(13–15 px); every control ≥ 44 px.

## World pick (⏸ written by the orchestrator at the checkpoint, task 4.7)

Picked 2026-10-31 after round 2: Rue approved the mockups as shown, so the round-2 defaults are final. U10 task
10.1 copies this into `WORLDS` and drops the "provisional" comments on `WORLDS` and `FONT` in `worlds.ts`.

- home: dark · stone (#C9B8A4)
- music: dark · ember (#F27D58)
- animanga: dark · electric (#729EFF)
- books: dark · moss (#A6C487)
- fashion: dark · noir (#EDE6DA)
- type: pairing a — Bricolage Grotesque + Figtree (`FONT = 'a'`; the `app.html` preloads stay as they are)

Revision notes: round 1 rejected the light palette and asked for iOS-like liquid glass and no pink; round 2 made
every world dark-first, added `.liquid` / `.liquid-strong`, replaced sakura with electric / neon and dropped Cormorant.
Light stays reachable but is not used by any world.

## Contracts

Created by U3 (types, config, schema, row mapping, test routes, fakes and e2e helpers are real; server functions are
stubs that typecheck and throw `new Error('not implemented')`). Later units fill the stubs and must not change shapes
without re-planning. U1 creates `src/lib/domains.ts`; U4 creates `worlds.ts`, `motion.ts` and the UI components.

### Domains — `src/lib/domains.ts` (U1)

```ts
export const DOMAINS = ['music', 'animanga', 'books', 'fashion'] as const;
export type Domain = (typeof DOMAINS)[number];
export const WORLD_NAMES = ['home', ...DOMAINS] as const;
export type World = (typeof WORLD_NAMES)[number];
export const DOMAIN_LABEL: Record<Domain, string>; // Music, Animanga, Books, Fashion
```

### Types — `src/lib/types.ts` (U3)

```ts
export type Id = number;
export type IsoDateTime = string;                        // new Date().toISOString()
export type EntryType = 'album' | 'artist' | 'song' | 'anime' | 'manga' | 'book'
  | 'brand' | 'site' | 'influencer' | 'piece' | 'look';
export type MediaType = 'album' | 'artist' | 'song' | 'anime' | 'manga' | 'book';
export type MediaStatus = 'none' | 'want' | 'progress' | 'done' | 'dropped';
export type PieceStatus = 'wishlist' | 'owned' | 'gone';
export type Status = MediaStatus | PieceStatus;
export type SiteKind = 'brand' | 'shop' | 'site';
export type ProviderId = 'deezer' | 'anilist' | 'openlibrary';
export type ProgressKey = 'episodes' | 'chapters' | 'volumes';
export interface Progress { current: number; total: number | null }   // total null = unknown ("n / ?")
export interface Handles { instagram?: string; tiktok?: string; youtube?: string; website?: string }

// display-only per-type fields, stored in entries.details (JSON)
export interface EntryDetails {
  altTitle?: string; year?: number;                      // anime, manga, album, song, book
  recordType?: 'album' | 'ep'; trackCount?: number;      // album
  albumTitle?: string;                                   // song
  authors?: string[];                                    // book
  url?: string; description?: string;                    // brand, site, piece (url); brand, site (description)
  handles?: Handles;                                     // influencer
  brand?: string; price?: string;                        // piece
  sourceUrl?: string;                                    // look
}

export interface Tag { id: Id; name: string; count: number }

// read model (stored fields + derived ones marked)
export interface Entry {
  id: Id; type: EntryType; title: string;
  status: Status | null;                  // stored; media: MediaStatus (default 'none'); piece: PieceStatus; else null
  rating: number | null;                  // derived from stored rating_x2 (0.5 … 5)
  progress: Partial<Record<ProgressKey, Progress>>;     // stored columns; anime: episodes; manga: chapters + volumes
  kind: SiteKind | null;                  // stored; brand/site only
  artistId: Id | null; artistName: string | null;      // stored; album/song only
  provider: ProviderId | null; externalId: string | null;
  imageId: Id | null;
  details: EntryDetails;
  tags: Tag[];                            // count = uses across all entries
  note: string;
  createdAt: IsoDateTime; updatedAt: IsoDateTime;
}

// write model; the server validates against TYPES[type]
export interface EntryInput {
  type: EntryType; title: string;
  status?: Status; rating?: number | null;
  progress?: Partial<Record<ProgressKey, Progress>>;
  kind?: SiteKind;
  artist?: { id: Id | null; name: string } | null;
  provider?: ProviderId | null; externalId?: string | null;
  imageId?: Id | null;                     // undefined = keep, null = remove
  details?: EntryDetails;
  tags?: string[];
  note?: string;
}

export interface StatusEvent { id: Id; entryId: Id; status: Status; at: IsoDateTime }

export type SortKey = 'added' | 'rating' | 'title';
export interface ListQuery {
  types: EntryType[];                      // one type, or ['piece'] with status 'owned' for Wardrobe
  status?: Status; kind?: SiteKind; tag?: Id; minRating?: number; sort?: SortKey;
}

export interface Collection { id: Id; name: string; description: string; count: number; collage: Id[]; createdAt: IsoDateTime; updatedAt: IsoDateTime }

export interface ShelfData { key: string; title: string; count: number; entries: Entry[]; href: string | null }
```

**Stored vs derived** (U3 `src/lib/entries/derive.ts`, real, with freely named unit tests): stored — every column in
the schema; `title_key` is stored but derived from `title` and written only by `createEntry`/`updateEntry`/seed.
Derived, never stored and never posted back by forms: `domainOf(type)`, `statusLabel(type, status)`,
`progressLabel(p)` ("12 / 28", "12 / ?"), `atTotal(p)` (`total !== null && current >= total`), `initials(title)`
(lives in `src/lib/ui/initials.ts`, U4), `isWardrobe(entry)` (piece + owned), `listHref(type)`, `rating` from
`rating_x2`. Forms post only stored fields; the server recomputes derived ones.

### Type config — `src/lib/entries/config.ts` (U3, real)

```ts
export type FieldInput = 'text' | 'textarea' | 'int' | 'url' | 'select' | 'list' | 'handles';
export interface FieldDef {
  key: keyof EntryDetails | 'kind';        // title, artist, status, rating, progress, tags, note, image are generic
  label: string; input: FieldInput;
  options?: readonly { value: string; label: string }[];
  store: 'details' | 'column';             // 'column' only for kind
}
export interface TypeConfig {
  type: EntryType; domain: Domain;
  label: string; plural: string;           // 'Album', 'Albums'; 'Shop/Site', 'Shops'
  slug: string;                            // list URL segment: albums, artists, songs, anime, manga, books,
                                           // brands, shops, influencers, pieces, looks
  titleLabel: 'Title' | 'Name';
  fields: readonly FieldDef[];             // order = form and detail order
  artist: boolean;                         // album, song
  status: 'media' | 'piece' | null;
  ratable: boolean;                        // media types
  progress: readonly ProgressKey[];        // anime: ['episodes']; manga: ['chapters', 'volumes']
  provider: ProviderId | null;             // music → deezer, anime/manga → anilist, book → openlibrary
  preview: boolean;                        // brand, site, influencer, piece
}
export const TYPES: Record<EntryType, TypeConfig>;
export const TYPES_BY_DOMAIN: Record<Domain, EntryType[]>;   // tab order per scope S22
export const LISTS: Record<Domain, { slug: string; label: string; query: Omit<ListQuery, 'sort'> }[]>;
// fashion: brands, shops, influencers, pieces, wardrobe ({ types: ['piece'], status: 'owned' }), looks
export function typeBySlug(domain: Domain, slug: string): TypeConfig | null;
```

Fields per type (scope S10): album — artist (generic), year, recordType (album | EP), trackCount; artist — none
besides name + photo; song — artist (generic), albumTitle, year; anime — altTitle, year, progress episodes (total
editable); manga — altTitle, year, progress chapters + volumes (totals editable); book — authors (list), year;
brand / site — kind (select brand | shop | site), url, description; influencer — handles (instagram, tiktok, youtube,
website); piece — brand, url, price, status (wishlist | owned | gone); look — sourceUrl. All: title/name, tags, note,
image, timestamps.

### Copy — `src/lib/copy.ts` (U3, real)

```ts
export const STATUS_LABELS: Record<'music' | 'anime' | 'read' | 'piece', Record<string, string>>;
// music: none 'No status', want 'Want to listen', progress 'Listening', done 'Listened', dropped 'Dropped'
// anime: 'No status', 'Plan to watch', 'Watching', 'Watched', 'Dropped'
// read (manga, book): 'No status', 'Want to read', 'Reading', 'Read', 'Dropped'
// piece: wishlist 'Wishlist', owned 'Owned', gone 'Gone'
export const MARK_DONE: Record<'anime' | 'manga', string>;   // 'Mark as watched', 'Mark as read'
export const COPY: {
  titleRequired: 'Title is required'; nameRequired: 'Name is required';
  imageType: 'Unsupported image type'; imageSize: 'Image is larger than 16 MB';
  invalidUrl: 'Enter a valid http or https URL'; noPreview: 'No preview found';
  searchFailed: 'Search is unavailable right now'; noResults: 'No results';
  addManually: 'Add manually'; already: 'Already in your archive';
  coverFailed: 'Cover could not be downloaded'; nothingMatches: 'Nothing matches'; resetFilters: 'Reset filters';
  saved: 'Saved'; deleted: 'Deleted'; collectionNameRequired: 'Name is required';
};
```

### Errors — `src/lib/errors.ts` (U3, real)

```ts
export class ValidationError extends Error { constructor(public fields: Record<string, string>) }
export class ImageError extends Error { constructor(public code: 'not-image' | 'too-large' | 'download') }
export class FetchError extends Error {
  constructor(public code: 'invalid-url' | 'scheme' | 'private-address' | 'timeout' | 'too-large' | 'status' | 'network' | 'redirects')
}
export class ProviderError extends Error { constructor(public code: 'timeout' | 'failed') }
export class DuplicateError extends Error { constructor(public existingId: Id) }
```

### Schema — `migrations/` (0001 by U1, 0002 by U3)

```sql
-- 0001_images.sql (U1)
CREATE TABLE images (id INTEGER PRIMARY KEY, mime TEXT NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
  bytes BLOB NOT NULL, created_at TEXT NOT NULL);

-- 0002_core.sql (U3)
CREATE TABLE entries (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('album','artist','song','anime','manga','book','brand','site','influencer','piece','look')),
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  title_key TEXT NOT NULL,
  status TEXT CHECK (
    (type IN ('album','artist','song','anime','manga','book') AND status IN ('none','want','progress','done','dropped')) OR
    (type = 'piece' AND status IN ('wishlist','owned','gone')) OR
    (type IN ('brand','site','influencer','look') AND status IS NULL)),
  rating_x2 INTEGER CHECK (rating_x2 BETWEEN 1 AND 10),
  episodes INTEGER CHECK (episodes >= 0), episodes_total INTEGER CHECK (episodes_total >= 0),
  chapters INTEGER CHECK (chapters >= 0), chapters_total INTEGER CHECK (chapters_total >= 0),
  volumes INTEGER CHECK (volumes >= 0), volumes_total INTEGER CHECK (volumes_total >= 0),
  kind TEXT CHECK (kind IN ('brand','shop','site')),
  artist_id INTEGER REFERENCES entries(id) ON DELETE SET NULL,
  artist_name TEXT,
  provider TEXT CHECK (provider IN ('deezer','anilist','openlibrary')),
  external_id TEXT,
  image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  details TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(details)),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX entries_external ON entries(type, provider, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX entries_type_created ON entries(type, created_at);
CREATE INDEX entries_updated ON entries(updated_at);
CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
CREATE TABLE entry_tags (
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id));
CREATE TABLE status_events (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  status TEXT NOT NULL, at TEXT NOT NULL);
CREATE INDEX status_events_entry ON status_events(entry_id, at);
CREATE TABLE collections (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (trim(name) <> ''), description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE collection_entries (
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL,
  PRIMARY KEY (collection_id, entry_id));
CREATE TABLE heroes (
  world TEXT PRIMARY KEY CHECK (world IN ('home','music','animanga','books','fashion')),
  image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE);
```

Collections show entries in added order (oldest first); the collage is the first three of those with an image.
`updated_at` changes on every write to the entry, including status, rating and progress.

### Shared server helpers (U3, real)

```ts
// src/lib/text.ts
export function fold(s: string): string;                     // NFC, trim, collapse whitespace, toLowerCase()
// src/lib/server/rows.ts
export function rowToEntry(row: Record<string, unknown>, tags: Tag[]): Entry;
export function entryColumns(input: EntryInput): Record<string, unknown>;   // EntryInput → column values (+ title_key, details JSON)
export function loadTags(entryIds: Id[]): Map<Id, Tag[]>;
// src/lib/server/testing.ts — used by unit tests and the seed route
export function useTestDb(): void;                           // closeDb(), DATABASE_PATH=':memory:', getDb() migrates
export function insertEntryRow(input: SeedEntry, now?: IsoDateTime): Id;   // plain SQL, no validation
export function testImage(index?: number): Uint8Array;       // small generated PNG, colour varies by index
// src/lib/entries/derive.ts — derived values (above); src/lib/entries/progress.ts
export function clampProgress(current: number, total: number | null): number;   // ≥ 0, ≤ total when known
// src/lib/server/test-flag.ts (U1)
export function testFlag(): boolean; export function requireTestFlag(): void;
```

### Server functions (stubs in U3, owner in brackets)

```ts
// src/lib/server/entries.ts [U5]
export function createEntry(input: EntryInput): Id;                // ValidationError, DuplicateError
export function updateEntry(id: Id, input: EntryInput): void;      // image replaced → old row deleted
export function getEntry(id: Id): Entry | null;
export function deleteEntry(id: Id): void;                         // image row deleted; collections/events cascade
export function listEntries(q: ListQuery): Entry[];
export function findByExternal(type: EntryType, provider: ProviderId, externalId: string): Id | null;
export function ensureArtist(a: { provider: 'deezer'; externalId: string; name: string; imageId?: Id | null }): { id: Id; created: boolean };
export function artistWorks(artistId: Id): Entry[];                // linked albums then songs, newest first
export function listArtists(): { id: Id; title: string }[];        // picker, title order
// src/lib/server/tags.ts [U5]
export function setEntryTags(entryId: Id, names: string[]): void;  // dedupe by fold, ignore blank, prune unused
export function listTags(): Tag[];                                 // used tags only, name order
// src/lib/server/tracking.ts [U6]
export function setStatus(id: Id, status: Status): boolean;        // true = changed (event stored)
export function setProgress(id: Id, key: ProgressKey, current: number): Entry;   // clamps; want → progress
export function stepProgress(id: Id, key: ProgressKey, delta: 1 | -1): Entry;
export function setRating(id: Id, rating: number | null): void;   // half steps 0.5–5, else ValidationError
export function statusEvents(id: Id): StatusEvent[];
// src/lib/server/images.ts [U7]
export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
export async function storeImage(bytes: Uint8Array): Promise<Id>;  // ImageError
export async function storeImageFromUrl(url: string): Promise<Id>; // via getRemote().fetchImage
export async function toWebpDataUrl(bytes: Uint8Array): Promise<string>;   // preview images
export function getImage(id: Id): { mime: string; bytes: Uint8Array } | null;
export function deleteImage(id: Id): void;
// src/lib/server/net.ts [U7]
export interface SafeFetchOptions { maxBytes: number; timeoutMs?: number; truncate?: boolean;   // truncate: stop at maxBytes instead of throwing
  method?: 'GET' | 'POST'; headers?: Record<string, string>; body?: string;
  lookup?: (host: string) => Promise<{ address: string; family: 4 | 6 }[]>;
  allowAddresses?: string[] }   // tests only: exempt exact addresses, e.g. a node:http server bound to 127.0.0.2
export interface SafeResponse { url: string; status: number; contentType: string | null; body: Uint8Array }
export async function safeFetch(url: string, opts: SafeFetchOptions): Promise<SafeResponse>;   // FetchError
export function isBlockedAddress(address: string): boolean;
// src/lib/server/remote.ts [U3 interface + switch, U7 real implementation]
export interface Remote { fetchPage(url: string): Promise<{ url: string; html: string }>; fetchImage(url: string): Promise<Uint8Array> }
export function getRemote(): Remote;                               // fake when testFlag()
// src/lib/server/preview.ts [U8]
export interface Preview { title: string | null; description: string | null; imageUrl: string | null }
export function parsePreview(html: string, pageUrl: string): Preview;
export async function readPreview(url: string): Promise<Preview & { image: string | null }>;   // image = WebP data URL; FetchError for invalid/blocked
// src/lib/server/collections.ts [U9]
export function createCollection(name: string, description?: string): Id;      // ValidationError
export function renameCollection(id: Id, name: string, description?: string): void;
export function deleteCollection(id: Id): void;
export function listCollections(): Collection[];                   // newest first
export function getCollection(id: Id): (Collection & { entries: Entry[] }) | null;   // added order
export function addToCollection(collectionId: Id, entryId: Id): void;          // idempotent
export function removeFromCollection(collectionId: Id, entryId: Id): void;
export function collectionsOf(entryId: Id): Id[];
// src/lib/server/heroes.ts [U9]
export function getHeroes(): Partial<Record<World, Id>>;
export function setHero(world: World, imageId: Id): void;          // old image row deleted
export function removeHero(world: World): void;
// src/lib/server/home.ts [U9]
export function coverflowEntries(): Entry[];                       // 20 newest with an image, any type
export function inProgress(): Entry[];                             // media, status 'progress', updated_at desc
export function recentlyAdded(domain: Domain, limit?: number): Entry[];        // default 12
export function domainShelves(domain: Domain): ShelfData[];        // per TYPES_BY_DOMAIN type, plus 'In progress' for media domains; empty shelves omitted
export function homeShelves(): ShelfData[];                        // 'In progress', then 'Recently added' per domain; empty omitted
```

### Providers — `src/lib/server/providers/` (U3 interface, index, fake; U8 real)

```ts
// types.ts
export const SEARCH_TIMEOUT_MS = 5000;
export type FetchJson = (url: string, init: { method?: 'GET' | 'POST'; body?: string; signal: AbortSignal }) => Promise<unknown>;
export interface SearchResult {
  provider: ProviderId; externalId: string; type: MediaType;
  title: string; creator: string | null; year: number | null; coverUrl: string | null;
  details: EntryDetails;
  progressTotals?: Partial<Record<ProgressKey, number | null>>;   // AniList: null stays null
  artist?: { externalId: string; name: string; imageUrl: string | null };   // Deezer album/track
  existingId?: Id;                                                 // set by the search route, not by providers
}
export interface Provider { id: ProviderId; search(type: MediaType, query: string, signal: AbortSignal): Promise<SearchResult[]> }
// index.ts
export function providerFor(type: MediaType): Provider;            // fake when testFlag()
export async function search(type: MediaType, query: string): Promise<SearchResult[]>;   // timeout → ProviderError('timeout'), other → ProviderError('failed')
// deezer.ts / anilist.ts / openlibrary.ts [U8]
export function createDeezer(fetchJson: FetchJson): Provider;      // same for createAniList, createOpenLibrary
```

**Fake provider** (`fake.ts`, U3, real, test-first): album "Blonde" → Blonde / Frank Ocean (artist externalId
`fake-ar-1`, imageUrl `/__test/image/frank-ocean.png`) / 2016 / album / 17 tracks / cover `/__test/image/blonde.png`
(external id `fake-al-1`); artist "Frank" →
Frank Ocean; track "Nikes" → Nikes / Frank Ocean / album "Blonde" / 2016; anime "Frieren" → Frieren: Beyond Journey's
End / alt "Sousou no Frieren" / 2023 / episodes 28; manga "Vagabond" → Vagabond / 1998 / chapters null, volumes null;
book "Norwegian" → Norwegian Wood / 村上春樹 / 1987 with cover, plus a second result without cover; book "Broken" →
one result whose cover URL is `/__test/missing/broken.png` (the fake remote can't serve it); query "timeout" →
`ProviderError('timeout')`; query "error" → `ProviderError('failed')`; anything else → `[]`.

**Fake remote** (`src/lib/server/fake/remote.ts`, U3): `fetchImage(url)` → generated image for any URL whose path
starts with `/__test/image/` (relative or absolute), else `ImageError('download')`; `fetchPage(url)` → canned HTML:
`https://brand.example/` (og:title "Maison Example", og:description, og:image `/__test/image/brand.png`),
`https://piece.example/coat` (og:title "Wool Coat", og:image), `https://favicon.example/` (only `<title>` and
`<link rel="icon" href="/__test/image/favicon.png">`), `https://shell.example/` (JS-only shell, `<title>App</title>`,
no og), `https://www.instagram.com/someone/` and `https://www.instagram.com/p/Cx1/` (login wall: title "Login • Instagram", no og:image),
`https://blocked.example/` → `FetchError('status')`, `http://127.0.0.1/` and `http://localhost/` →
`FetchError('private-address')`; unknown URLs → `FetchError('network')`.

**Recorded fixture shapes** (U8 writes them by hand in the shape the 2026-10-31 probe saw — no network; saved in
`src/lib/server/providers/fixtures/`):
- `deezer-search-album.json` — `{ data: [{ id, title: "Blonde", record_type: "album", nb_tracks: 17, cover_xl, artist: { id, name: "Frank Ocean", picture_xl } }, { …, record_type: "ep" }], total }`
- `deezer-album.json` — `{ id, title, release_date: "2016-08-20", nb_tracks, record_type, cover_xl, artist: { id, name, picture_xl } }`
- `deezer-search-artist.json` — `{ data: [{ id, name: "Frank Ocean", picture_xl, nb_album }, { id: <other>, name: "Nova", … }, { id: <third>, name: "Nova", … }] }`
- `deezer-search-track.json` — `{ data: [{ id, title: "Nikes", artist: { id, name, picture_xl }, album: { id, title: "Blonde", cover_xl } }] }`
- `anilist-anime-frieren.json` — `{ data: { Page: { media: [{ id, title: { romaji: "Sousou no Frieren", english: "Frieren: Beyond Journey's End", native }, seasonYear: 2023, startDate: { year: 2023 }, episodes: 28, status: "FINISHED", coverImage: { extraLarge } }] } } }`
- `anilist-manga-vagabond.json` — same shape, `type MANGA`, `chapters: null, volumes: null, status: "RELEASING"`, `seasonYear: null`, `startDate: { year: 1998 }`
- `anilist-error.json` — `{ data: null, errors: [{ message: "Too Many Requests.", status: 429 }] }`
- `openlibrary-search.json` — `{ numFound, docs: [{ key: "/works/OL…W", title: "Norwegian Wood", author_name: ["村上春樹"], first_publish_year: 1987, cover_i: 12345 }, { key, title, author_name, first_publish_year }] }` (second doc without `cover_i`)

### Worlds — `src/lib/styles/worlds.ts` (U4; U10 writes the pick)

```ts
export type Scheme = 'light' | 'dark';
export type AccentName = keyof typeof accents;                     // stone, inkblue, ember, violet, electric, neon, moss, oxblood, noir, clay
export type FontName = keyof typeof fontPairs;                     // 'a' | 'b' | 'c'
export interface WorldChoice { scheme: Scheme; accent: AccentName }
export const CANDIDATES: Record<World, AccentName[]>;              // two per world (mockups)
export const WORLDS: Record<World, WorldChoice>;                   // U4: provisional (all dark); U10: Rue's pick
export const FONT: FontName;                                       // one pairing app-wide; U4: provisional 'a'; U10: Rue's pick
export function worldAttrs(world: World, override?: Partial<WorldChoice & { font: FontName }>):
  { 'data-scheme': Scheme; 'data-accent': AccentName; 'data-font': FontName };
```
Every page load under `(app)` returns `world: World` (layout default `'home'`); the `(app)` layout spreads
`worldAttrs(page.data.world)` onto its wrapper and sets the matching `color-scheme`. `[data-world]` on the wrapper
adds the ambient accent light (`global.css`).

### Motion — `src/lib/motion.ts` (U4)

```ts
export function reducedMotion(): boolean;
export function rise(node: Element, opts?: { delay?: number; y?: number }): TransitionConfig;
export function stagger(index: number): number;                    // 40 ms × index, capped at 12
export function pop(node: Element): TransitionConfig;
export function fadeSlide(node: Element, opts?: { y?: number }): TransitionConfig;   // sheets, popovers, toasts
export function reveal(node: Element, opts?: { delay?: number }): { destroy(): void };   // action: data-revealed on intersect; immediate under reduced motion
export function hideOnOutro(node: Element): { destroy(): void };   // action: aria-hidden on outrostart, cleared on introstart
export const coverName: (id: number) => string;                    // 'cover-' + id
```
Feature motion lives next to its feature: `src/lib/shell/morph.ts` (U10: `pageTransition(navigation)`,
`morphTarget(from: string, to: string): { id: number; direction: 'forward' | 'back' } | null`), `src/lib/shell/parallax.ts`
(U10: `parallaxOffset(scrollY: number, reduced: boolean): number`, used by `PhotoHero`), `src/lib/entries/dragScroll.ts` + `tilt.ts` (U14), `src/lib/home/coverflow.ts` + `countUp.ts` (U18).

### UI components — `src/lib/ui/` (U4; U12 adds animation to StatusPill and StarRating)

```ts
Card:            { href: string; title: string; image: string | null; chip?: string; meta?: string; tint: AccentName | null;
                   coverId?: Id; rating?: number | null; shape?: 'square' | 'portrait' | 'tall'; children?: Snippet }
                   // coverId → data-cover-id on the media; shape defaults to portrait; children = a control row under the title
StatusPill:      { label: string; options: { value: string; label: string }[]; value: string; onchange(value: string): void; disabled?: boolean }
                   // label names the control ("Status"); the chevron button's name is "<label>: <current option>"
StarRating:      { value: number | null; mode: 'display' | 'input'; onchange?(value: number | null): void; label?: string }   // input: role="slider", arrows ±0.5, Delete clears
ProgressControl: { label: string; current: number; total: number | null; onstep(delta: 1 | -1): void; onset(value: number): void }
ImagePlaceholder:{ title: string; tint: AccentName | null }       // null → the surrounding world's accent
Collage:         { images: Id[]; label: string; src?: (id: Id) => string }   // 0 → placeholder collage; src defaults to /images/<id>
GlassPanel { as?; strong? }, PillNav { items: { href; label; icon; active }[]; variant?: 'top' | 'bar' }, ArrowButton,
RoundNav, Button, IconButton, Icon, Chip, Counter, Eyebrow
// the liquid-glass material is the global .liquid / .liquid-strong class (global.css), not a component
```
Domain components: `src/lib/entries/EntryCard.svelte` (U14) maps an `Entry` to `Card` (+ ProgressControl for
in-progress anime/manga); `src/lib/entries/Shelf.svelte` (U14) `{ shelf: ShelfData; countAction?: Action<HTMLElement, number> }`
(Home passes its count-up action, U18);
`src/lib/shell/PhotoHero.svelte` (U10) `{ image: Id | null; world: World; children: Snippet }` (gradient when null);
`src/lib/shell/toast.ts` (U10) `toast(message: string): void` (survives the redirect after a form action: the layout shows
it on the next page); `src/lib/shell/nav.ts` (U10) `activeSection(pathname: string, world: World): World | 'collections' | 'settings'`; `src/lib/entries/EntryForm.svelte` (U11)
`{ type: EntryType; values: Partial<EntryInput>; errors?: Record<string, string>; artists: { id; title }[]; tags: Tag[]; action: string; hidden?: Record<string, string> }`
(reused by U15 for prefill); `src/lib/entries/save.ts` (U11)
`saveFromForm(form: FormData, existingId?: Id): Promise<{ id: Id; coverFailed: boolean } | { errors: Record<string, string>; existingId?: Id }>`
(U15 adds provider cover, artist and preview-image handling inside it); `src/lib/entries/unsaved.ts` (U11)
`guardUnsaved(isDirty: () => boolean): void` (called in a form page's component init; registers `beforeNavigate` and
`beforeunload`, skips the save submit); `src/lib/entries/handles.ts` (U15) `handlesFromUrl(url: string): Partial<Handles> | null`.

### Routes (owner)

| Route | Files | Owner |
|---|---|---|
| `/` Home | `src/routes/(app)/+page.svelte`, `+page.server.ts` | U1 placeholder, U18 |
| (app layout) | `src/routes/(app)/+layout.svelte`, `src/lib/shell/*` | U10 |
| `/[domain]` landing (music, animanga, books, fashion; else 404) | `src/routes/(app)/[domain]/+page.svelte`, `+page.server.ts` | U3 placeholder, U17 |
| `/[domain]/[list]` (slugs from `LISTS`) | `src/routes/(app)/[domain]/[list]/+page.svelte`, `+page.server.ts` | U3 placeholder, U14 |
| `/add/[type]` (manual form; search / URL preview modes; action `?/save`) | `src/routes/(app)/add/[type]/+page.svelte`, `+page.server.ts` | U11, U15 |
| `GET /add/[type]/search?q=` → `{ results: SearchResult[] } \| { error: 'timeout' \| 'failed' }` | `src/routes/(app)/add/[type]/search/+server.ts` | U15 |
| `POST /add/[type]/preview` `{ url }` → `{ title, description, image } \| { error: 'invalid-url' \| 'blocked' }` | `src/routes/(app)/add/[type]/preview/+server.ts` | U15 |
| `/entries/[id]` (actions `status`, `rating`, `progress`, `delete`; U16 adds `collect`, `uncollect`, `newCollection`) | `src/routes/(app)/entries/[id]/+page.svelte`, `+page.server.ts` | U3 placeholder, U12, U16 |
| `/entries/[id]/edit` | `src/routes/(app)/entries/[id]/edit/+page.svelte`, `+page.server.ts` | U11 |
| `/collections`, `/collections/[id]` | `src/routes/(app)/collections/**` | U3 placeholder, U16 |
| `/settings` | `src/routes/(app)/settings/+page.svelte`, `+page.server.ts` | U3 placeholder, U13 |
| `/images/[id]` | `src/routes/images/[id]/+server.ts` | U7 |
| `/healthz` | `src/routes/healthz/+server.ts` | U1 |
| `/__test/reset`, `/__test/seed`, `/__test/counts`, `/__test/image/[name]` | `src/routes/__test/**` | U3 |
| `/__mockups/[world]/[scheme]`, `/__mockups/components`, `/__mockups/photo/[name]` | `src/routes/__mockups/**` | U4 |

Placeholders (U1/U3) are an empty element plus `world` from load — no heading, no behaviour a later scenario asserts.
U3 also creates empty placeholders for `/[domain]/[list]` (U14) and `/entries/[id]` (U12) so redirects from the add,
edit and delete flows land inside the `(app)` layout (toast host) before those units merge.

### E2E helpers — `e2e/helpers.ts` (U3; later units add helpers in their own test files, never here)

```ts
export async function reset(request: APIRequestContext): Promise<void>;
export async function seed(request: APIRequestContext, input: SeedInput): Promise<SeedResult>;
export async function counts(request: APIRequestContext): Promise<Record<string, number>>;   // GET /__test/counts
export async function open(page: Page, path: string): Promise<void>;   // goto + wait for html[data-hydrated]
export const calm: (page: Page) => Promise<void>;                      // emulateMedia({ reducedMotion: 'reduce' })
export const photo: (name: string) => string;                          // absolute path of fixtures/mockups/<name>

export interface SeedEntry {
  type: EntryType; title: string; status?: Status; rating?: number;
  progress?: Partial<Record<ProgressKey, Progress>>; kind?: SiteKind;
  artist?: number | string;              // index of an earlier entry in this request, or a plain name
  provider?: ProviderId; externalId?: string; details?: EntryDetails;
  tags?: string[]; note?: string; image?: boolean; createdAt?: IsoDateTime; updatedAt?: IsoDateTime;
}
export interface SeedInput {
  entries?: SeedEntry[];
  collections?: { name: string; description?: string; entries: number[] }[];   // indexes into entries, in added order
  heroes?: World[];                      // a generated image per listed world
}
export interface SeedResult { entries: Id[]; collections: Id[] }
```
Reset deletes every row of every table (entries, tags, entry_tags, status_events, collections, collection_entries,
heroes, images). Seed inserts with plain SQL through `insertEntryRow` (explicit timestamps, `fold` for keys and tags,
`testImage(i)` for images), so it needs no later unit.

### E2E conventions
- Each unit owns its e2e files (named in its `files=`); no unit edits another unit's e2e file.
- Every data test starts with `reset()`; tests not about motion call `calm(page)` first.
- Device-specific tests skip the other project (`test.skip(info.project.name !== 'desktop', 'hover is desktop-only')`).
- A new e2e file runs with `--repeat-each 5` before its commit.
- Screenshots go to `test-results/shots/<project>-<slug>.png` and are not committed.
- Exact-text locators for short labels; lookups on pages with several card regions scope to the region
  (`getByRole('region', { name: 'Albums' })`).

## Risks / Trade-offs

- R1 Deezer terms are non-commercial → accepted (private single-user archive).
- R2 AniList totals null → stored empty, shown "n / ?" (S12).
- R3 Open Library names in original script, missing covers → fields editable, upload fallback.
- R4 Sites block bots / login walls → "No preview found", manual upload (S16).
- R5 View Transitions in Firefox/LibreWolf → feature-detected fallback; support level unverified (Decisions).
- R6 Network in tests/CI → fake provider and fake remote in test mode; parsers tested on hand-written fixtures in the
  probe's shape → the fixtures can drift from the live APIs unnoticed → manual Gate 2 check "Real providers answer a
  live search" with `npm run dev`.
- R7 SSRF → `safeFetch` (Decisions).
- R8 Scope size → generic entry model + type config; 19 units in 8 waves.
- R9 Taste for worlds → ⏸ checkpoint after U4; worlds are data so the pick is a one-object change.
- R10 Motion-heavy UI makes e2e flaky → `calm(page)` where motion isn't under test, `hideOnOutro`, duplicate-submit
  guard, `--repeat-each 5` on new e2e files.
- `BODY_SIZE_LIMIT=17M` differs from Cooking-Hub's 16M → the deploy change must set 17M and nginx
  `client_max_body_size 17m`; noted in README and the runbook.
- `workers: 1` × two projects makes `proof:full` long (estimate 12–18 min at the end) → builders run it in the
  background, once per unit (LEARNINGS).
- Mockup routes stay in the build (404 without the flag) as the reference for later changes; their photos do not.

## Migration Plan

New app, no data. After merge: tag `v0.1.0` (release workflow; bump job expected red until `creative-archive-deploy`
lands), then that Homelab change deploys the pinned tarball. Rollback = pin a previous tag; migrations are additive.

## Open Questions

None blocking. The world pick is the planned ⏸ checkpoint (task 4.7), not an open question.

## Build notes (handoffs between units, written by the orchestrator)

## Contract notes from U3 (as built, later units rely on these)
- `providers/index.ts`: `search(type, query, provider = providerFor(type))`; the optional provider is for unit tests (timeout/failure mapping).
- Extras: `ratingFromX2`/`ratingToX2` in `derive.ts`; `dataTables()` in `db.ts` (resetDb and counts cover tables added by later migrations); `testImageNamed(name)`, `insertTestImage(index, now)` in `testing.ts`; `fakeProviders: Record<ProviderId, Provider>`; `fakeRemote` (`fake/remote.ts`); `FAKE_PAGES` (`fake/pages.ts`); `safeRemote` in `remote.ts` is a stub that U7 fills.
- `SeedEntry`/`SeedInput`/`SeedResult` live in `src/lib/server/testing.ts`; `e2e/helpers.ts` re-exports them as types. In `insertEntryRow` a numeric `artist` is an entry id (the seed route maps request indexes to ids), a string is a plain name.
- `statusLabel(type, status: Status | null): string | null`.
- `entryColumns` emits only fields present in the input (undefined = keep/default, null = clear) and trims the title.
- `rowToEntry` fills progress only for the type's keys (current defaults to 0, total to null).
- Seeded images are 64×48 `image/png` rows, not WebP. Seed creates no status_events.
- Fake provider ids: fake-al-1, fake-ar-1, fake-tr-1, fake-an-1, fake-ma-1, fake-bk-1/2/3. The fake matches when the folded query contains the keyword; "timeout"/"error" must match exactly.
- Field labels: album trackCount "Tracks", recordType "Type", song albumTitle "Album", altTitle "Alternative title", kind "Kind".
- API-only route e2e tests run on the desktop project only (skipped on phone).

## Contract notes from wave 3 (U5, U6, U7, as built)
- tags.ts exports `atomic(fn)` (nestable SAVEPOINT transaction, used by entries.ts) and `pruneTags()`. Tag names stored NFC, trimmed, whitespace-collapsed; `listTags`/`listArtists` sort with `Intl.Collator('en', {sensitivity:'base', numeric:true})`.
- entries.ts validation: invalid status/rating/kind → `ValidationError({status|rating|kind})`; rating must be a half step 0.5..5, null clears, 0 rejected; brand/site default kind brand→`brand`, site→`shop`; `updateEntry` ignores `input.type` except brand↔site (follows kind) and writes a status_event when a media status changes; unknown id → plain Error. provider/externalId stored only as a complete pair for types with a provider.
- **Follow-up (open):** entries.ts deletes image rows with plain SQL (`dropImage`) because images.ts was a stub during wave 3. Swap to `deleteImage` from images.ts (one line) in the next unit that owns entries.ts, or in the Verify fixer.
- tracking.ts: unknown id → plain Error; setProgress/setRating bump updated_at on every write; non-tracked key or non-integer count → ValidationError; setRating on a type without ratings → ValidationError, strict half-step check; status events for media types only (pieces: row only); reaching a known total from want sets in progress (not done), stepping down never reverts status.
- images.ts exports `MAX_LONG_SIDE`, `TARGET_BYTES`; tiff not accepted. net.ts exports `DEFAULT_TIMEOUT_MS` (5000). remote.ts exports `USER_AGENT`, `MAX_PAGE_BYTES`, `createRemote(extra?: {allowAddresses, lookup, timeoutMs})`; `safeRemote = createRemote()`.
- safeFetch returns non-2xx with `status` (no throw). `remote.fetchPage`/`fetchImage` throw `FetchError('status')` for non-2xx and for non-HTML pages; real `fetchImage` throws `ImageError('not-image')` for non-image content types; the fake throws `ImageError('download')` for unknown URLs. `storeImageFromUrl` normalises: ImageError passes through, `FetchError('too-large')` → `ImageError('too-large')`, everything else → `ImageError('download')`. **U8's readPreview must catch both FetchError and ImageError** from `getRemote().fetchPage`/`fetchImage`.
- Real-remote tests live in net.test.ts (`describe('safeRemote')`).

## Contract notes from U8, U9 (as built)
- readPreview rethrows only `FetchError('invalid-url' | 'scheme')`; every other fetch/image failure (blocked, status, private-address, timeout, network) returns an all-null preview `{title, description, imageUrl, image: null}`; an image download failure keeps the text with `image: null`. **U15 route**: a throw → "Enter a valid http or https URL"; `image: null` → "No preview found".
- readPreview falls back to `/favicon.ico` (resolved against the final URL) when no image is found; parsePreview alone returns a null image then.
- Provider externalIds are strings: Deezer numeric id, AniList media id, Open Library work key without `/works/` (e.g. `OL2625457W`). Deezer search has no release_date → album/track results are enriched via `/album/{id}`; record_type `ep` → ep, everything else (album, single) → album. Open Library creator = authors joined ", ", `details.authors` holds the array. AniList year = `startDate.year ?? seasonYear`; altTitle only when romaji differs from title. `search` maps FetchError('timeout')/AbortError to ProviderError('timeout').
- safeFetch has no AbortSignal; http.ts races the signal, so the underlying request may run until its own 5 s timeout.
- Shelves: `progress` / "In progress" (href null, uncapped, count = entries); home domain shelves key `recent-<domain>`, title "Recently added", href `/<domain>` (identical titles → UI distinguishes by key/href); domain-page shelves key = entry type, title = `TYPES[type].plural`, href = `listHref(type)`. `ShelfData.count` = total behind the shelf, `entries` = 12 newest for recent shelves.
- `Collection.collage` = up to 3 image ids (not entry ids) from the first entries in added order that have an image. `renameCollection` keeps the description when omitted; `updated_at` changes on add/remove/rename.
- `setHero` with the same image id keeps it; `setHero`/`removeHero` delete the old image via `deleteImage` inside `atomic()`.

## Contract notes from U10 (as built)
- World: `(app)/+layout.svelte` reads `world` from page data and falls back to the path's first segment when data has none; an unknown value falls back to home. **U11/U12**: entry detail, edit and add loads must still return `world` (type's domain); the scenarios "Entry pages mark their domain" and "Detail pages use their type's domain world" belong to those units.
- `pageTransition` skips navigations that stay on the same pathname (query-only filter changes don't crossfade). `morphTarget` returns null when `from` or `to` is `/entries/<id>/edit`; a missing `[data-cover-id]` on the old page crossfades without naming.
- Cards need no wiring for the morph: the layout's `trackCoverClicks` finds the clicked `[data-card]` and its `[data-cover-id]`. Card-to-detail morph has no e2e yet (**U14/U12** own those pages).
- The `(app)` wrapper sets `--nav-top` (96px desktop, 76px phone); screens without a full-bleed hero pad their top by it. `<main>` has grid, gap and bottom clearance, no top padding. Phone Settings is an absolutely positioned glass IconButton top right that scrolls away.
- Toast: `toast(message)` from `#lib/shell/toast.ts` queues in sessionStorage (`STORAGE_KEY`), shows at once if the host is mounted, otherwise on mount/after navigation, hides after `TOAST_MS` (3 s); items are `role="status"` with `fadeSlide` + `hideOnOutro`. **U11/U12**: call `toast(COPY.saved)` / delete copy before the redirect. Its e2e seeds sessionStorage directly.
- `PhotoHero` is not rendered by any route yet (no e2e); `[data-hero-image]` carries the parallax `translate3d`, the drift animation sits on a wrapper.

## Contract notes from U13 (as built)
- `/settings` load returns `{ world: 'home', heroes: getHeroes() }`; actions `?/upload` (`world`, `image`) and `?/remove` (`world`) validate against `WORLD_NAMES`, an unknown world → 400. Heroes touch only `heroes` + `images` via setHero/removeHero; nothing is cached but immutable `/images/<id>`, so **U17/U18** pick up a new hero through their normal `getHeroes()` load.
- HeroSlot: `section[aria-labelledby]` (region named Home/Music/Animanga/Books/Fashion), `data-slot=<world>`, hidden `input[type=file]`, buttons "Upload"/"Replace" and "Remove", empty text "No photo yet" (**U19** can reuse these selectors). Browser checks: `image/*` and ≤ 16 MiB (constant mirrored from images.ts); everything else is rejected by `storeImage` and shown as the same inline message.
- There is no error colour token and `motion.test.ts` bans raw colours in components: inline errors use `var(--ink)` weight 600 + `role="alert"`. A red needs a new token in tokens.css.
- Kit 3 exports `SubmitFunction` from `$app/forms`. `Button`'s rest props don't take `formaction`, so a second action is a sibling form.

## Contract notes from U11 (as built)
- Field names are a contract between `FieldInput` and `save.ts`: `title`, `details.<key>`, `details.handles.<name>`, `kind`, `progress.<key>.total`, `status` (pieces only), `artistId`/`artistName`, repeated `tag`, `note`, file `image`, `removeImage`; `type` is hidden and the add action overrides it from `params.type`. `details` is replaced wholesale on update, so a unit editing `details` carries the other fields along; media status and rating are not form fields and update leaves them untouched.
- **U15** on `add/[type]/+page.server.ts`: `load` already returns `manual` (true for `?manual=1` or a type without provider and preview), but the page ignores it and always renders the form; U15 gates the search and preview panels on it. The action is `?/save`; a `DuplicateError` returns `fail(400, { errors: {}, existingId })`.
- **U15** on `save.ts`: extend `resolveImage` for cover URL and preview data URL; `coverFailed` is hardcoded false; an image stored in `saveFromForm` is deleted again if `createEntry`/`updateEntry` throws (keep that in the catch). `EntryForm`'s `hidden` prop renders hidden provider fields; prop `prefilled` starts the form dirty (re-key with `{#key}` when values change); extra optional prop `cancelHref`.
- `guardUnsaved(isDirty)` keeps its signature; dialog state is module-level in `unsaved.ts` (`leaving` store, `keepEditing()`, `discard()`), `DiscardDialog` renders outside the `<form>` (its backdrop-filter would trap a fixed dialog). Kit 3 reports an enhanced submit as `beforeNavigate` type `form`, which the guard skips; the post-save redirect bypasses it via a `saved` flag.
- Error colour: `EntryForm` uses `--field-error: color-mix(in srgb, var(--ink) 45%, tomato)`, U13 uses plain `var(--ink)` 600 — inconsistent until an error token exists.
- The scenario "Entry pages mark their domain": U11 added differently named add/edit domain tests and left the scenario itself to U12.

## Contract notes from U12 (as built)
- Detail load returns `{ world, entry, works }`; actions `status`, `progress` (`key` + `delta` or `value`), `rating` (`''` clears), `delete`, all through the `run(event, write)` helper in `+page.server.ts` (a `ValidationError` → `fail(400, { errors })`). **U16** adds its actions with the same helper and its "Add to collection" button inside `DetailPanel`'s `actions` snippet (`controls` is the other snippet).
- The client sends status, rating and progress through `send(action, fields)` in `+page.svelte`: `fetch`es `?/<action>`, queues writes serially, shows optimistic values from `local` until the queue drains; leaving mid-queue drops unsent writes (tests count POST responses before reloading).
- The delete confirm is a custom dialog (not native `<dialog>`): `hideOnOutro`, trigger inert while open, focus restored after `await tick()`, `toast(COPY.deleted)` in the enhance callback on redirect. **U16** reuses this pattern for popovers.
- The detail cover carries `data-cover-id=<entry.id>` and is sticky on desktop.
- Open for later units: **U14** owns "Progress on the card" and the card-to-detail morph e2e; **U15** (with U11's save) defines how the redirect signals "Cover could not be downloaded" (S15 provider-error edge) and renders it — the detail page has no notice yet.
- e2e animation proxy: `Element.prototype.animate` patched via `addInitScript`; each e2e file names its own `window.__…` global (declarations merge across files and clash in svelte-check).
