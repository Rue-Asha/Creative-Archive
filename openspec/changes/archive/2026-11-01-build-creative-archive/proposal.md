## Why

Rue's creative interests (music, anime/manga, books, fashion) are scattered across apps, tabs and memory. She wants one
private, beautiful place to keep what she wants to consume, is consuming and has consumed, plus the brands, shops,
influencers and looks she likes, laid out to invite browsing and rediscovery instead of only search.

## What Changes

A new SvelteKit 3 app in `/home/Rue/Repos/Creative-Archive`, built in one change (scope.md S1–S24):

- **Foundation:** harness copied from Rues-Cooking-Hub (node:sqlite, numbered migrations, vitest + Playwright on
  phone 390×844 and desktop 1280×800, `proof`, `proof:full`, `package`, `/healthz`), CI and tag-triggered release
  workflows mirrored from Cooking-Hub, ~10 CC0 mockup photos kept out of the product.
- **Design and motion:** a token-based design system where each domain is one switchable world (light or dark plus an
  accent), self-hosted OFL fonts, glass/pill/arrow/Swap-card components; a `/__mockups` checkpoint where the build
  pauses for Rue's pick per domain; page transitions with a cover morph, scroll reveal and parallax, coverflow and
  drag-scroll shelves, micro-interactions, all with a reduced-motion path.
- **Entries:** one generic entry model with a per-type field config for 11 types (Album, Artist, Song, Anime, Manga,
  Book, Brand, Shop/Site, Influencer, Piece, Look): create, detail, edit, delete; status with dated status events,
  anime/manga progress, half-star ratings, album/song → artist links; an unsaved-changes guard on the add and edit
  forms (S26).
- **Autofill and images:** keyless search autofill (Deezer, AniList, Open Library) behind one provider interface with
  a fake provider for tests; URL preview (Open Graph) with SSRF guards; influencer handle prefill from a pasted
  profile URL (S25); image upload → WebP BLOBs in SQLite.
- **Organising and browsing:** global tags with Unicode-aware dedupe, filterable per-type lists with URL state and a
  shelves view, mixed collections with collages, Home (hero, coverflow, shelves, collections bento), domain landing
  pages, Settings for hero photos, and a layout that uses desktop width as seriously as phone.
- **Release:** version 0.1.0, tagged `v0.1.0` by flow at ship.

## Capabilities

### New Capabilities
- `harness`: proof commands, e2e isolation per port, test-only routes, fake providers in test mode, migrations, health route, package tarball, harness declaration (S1).
- `release`: CI, dependabot, tag-triggered release workflow with the Homelab bump, ship runbook, version 0.1.0 (S2).
- `design-system`: mockup photos with credits, tokens and switchable worlds, fonts, shared components, mockups and the taste checkpoint (S3, S4, S5).
- `motion`: page transitions and cover morph, scroll reveal and parallax, coverflow / drag-scroll / hover tilt, micro-interactions, each with reduced motion (S6–S9).
- `layout`: pill nav placement, worlds per screen, one alignment rule, desktop use of width (S24).
- `entries`: the generic entry model, per-type fields, create / detail / edit / delete for all 11 types, the unsaved-changes guard (S10, S26).
- `tracking`: status with dated events, anime/manga progress, half-star rating (S11, S12, S13).
- `artist-link`: album/song ↔ artist links, artist works, autofill artist matching (S14).
- `autofill`: provider interface, Deezer / AniList / Open Library search, prefill and cover storage (S15).
- `link-preview`: safe page fetch and Open Graph preview for brands, shops, influencers and pieces, influencer handle prefill (S16, S25).
- `images`: upload, conversion to WebP, storage, serving and placeholders (S17).
- `tags`: global tags with case-insensitive, Unicode-aware dedupe and autocomplete (S18).
- `domain-lists`: per-type lists with filters, sort, URL state and shelves view (S19).
- `collections`: mixed collections, the add-to-collection popover and collages (S20).
- `home`: hero, coverflow, shelves and collections bento (S21).
- `domain-pages`: domain landing pages with hero, world, tabs and shelves (S22).
- `settings`: hero photo upload, replace and remove for Home and each domain (S23).

### Modified Capabilities
None (the repo has no specs yet).

## Impact

- New repo content: SvelteKit app, `migrations/`, `e2e/`, `scripts/`, `fixtures/mockups/`, `.github/`, `docs/release.md`,
  `CLAUDE.md`, `README.md`.
- Dependencies: `sharp` (runtime, native); dev: Kit 3, Svelte 5, Vite 8, TypeScript 6, vitest, Playwright.
- External services at runtime (keyless): Deezer API, AniList GraphQL, Open Library, arbitrary sites for URL preview.
  None of them is called by tests or CI.
- GitHub: repo `Rue-Asha/Creative-Archive`, created and pushed only at ship after Gate 2; the release workflow's bump
  job targets Homelab-Managment host_vars that the split-off `creative-archive-deploy` change creates.

## Non-Goals

- Surprise me / bored mode, on this day, "not touched in N months", revisit log, last-visited stamps — split off as
  `rediscovery` (status events from S11 already store the data it needs).
- Tag roulette, tag pages, moods, global search, full-text search — Rue chose per-domain filters only.
- Stats / year in review — later.
- Cross-domain links (anime → OST), influencer ↔ brand, piece ↔ brand, look ↔ piece links — Rue declined.
- Ratings for fashion entries and influencers; page progress for books; concerts.
- Imports (MAL, AniList, Goodreads, Spotify) and exports.
- Auth / multi-user — single user on the homelab like Life-Manager.
- Scraping Instagram/TikTok profiles beyond a best-effort OG fetch.
- Reordering entries inside a collection (added order only).
- Offline/PWA, share target, bookmarklet.
- Deploying to the homelab (ansible role, nginx, LXC) — separate change in Homelab-Managment.
- Light/dark toggle per user — each domain has one fixed world.
- HEIC (HEVC-coded iPhone photos) uploads — prebuilt sharp can't decode them; Rue declined the addition at Gate 1, HEIC
  shows "Unsupported image type".

## Done criteria

- [ ] Rue can add an album by searching "Blonde", gets the cover and Frank Ocean linked as an artist, sets it to Listened and rates it 4.5.
- [ ] Rue can add Frieren (anime), step episodes to 28/28 and is offered "Mark as watched"; an ongoing manga shows "n / ?".
- [ ] Rue can paste a brand URL and gets a preview image, or uploads one when the site blocks it.
- [ ] Pieces with status owned appear under Wardrobe.
- [ ] An entry can be tagged and put into a mixed collection; the collection shows a collage.
- [ ] Home shows her hero photo, the coverflow and shelves; domain pages show their chosen light/dark world.
- [ ] Card → detail morphs the cover; scrolling reveals content; everything is still at reduced motion.
- [ ] `proof:full` green on phone and desktop; `npm run package` produces the tarball.

## Appetite

Large: several sessions, ~7–9 waves, everything in one change (Rue's call). Planned as 19 units in 8 waves, with one
build pause after the design unit for Rue's world pick.
