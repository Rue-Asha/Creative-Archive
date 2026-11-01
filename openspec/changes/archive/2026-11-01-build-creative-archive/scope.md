# Scope: build-creative-archive

Triage: feature — new SvelteKit app from scratch: a private archive for Rue's music, animanga, books and fashion, with autofill, tags, collections, domain themes and rich motion. Appetite: large, several sessions (~7–9 waves), everything in one change (Rue's call).

Research and every dialogue answer: `explore-notes.md` (same dir). UI inspo: `~/Pictures/UI-inspo/` (5 images, traits summarised in explore-notes).

## Problem
Rue's creative interests (music, anime/manga, books, fashion) are scattered across apps, tabs and memory. She wants one private, beautiful place to keep what she wants to consume, is consuming and has consumed, plus the brands, shops, influencers and looks she likes, laid out to invite browsing and rediscovery instead of only search.

## Flows
- Add media by search: Domain page → "Add" → pick type → type a query → results with covers (Deezer / AniList / Open Library) → pick one → prefilled form (editable) → Save → detail page, cover stored locally.
- Add media manually: same, "Add manually" → form + image upload → Save.
- Add a site/influencer: Fashion → "Add" → Brand/Shop/Influencer → paste URL → preview (OG title/image) or manual image → tags, note → Save.
- Add a piece or look: Fashion → "Add" → Piece/Look → image upload (or URL preview for pieces) → fields → Save.
- Track: detail page → status pill → choose status; anime/manga progress +/−; rating stars.
- Browse: Home → hero coverflow / shelves → card → detail (cover morphs). Domain page → sub-type tab → filter/sort → card → detail.
- Collect: detail → "Add to collection" → pick/create collection → Collections → collection page.
- Personalise: Settings → upload hero photo for Home / each domain.
- Edit/delete: detail → Edit → save; detail → Delete → confirm → back to list.

## Entities (Rue's model)
- Domains: Music, Animanga, Books, Fashion. Each domain has a theme (light or dark + accent) and an optional hero photo.
- Media entries: Album (incl. EP), Artist, Song (Music) · Anime, Manga (Animanga) · Book (Books). Each has status, rating, tags, note, cover, optional external id.
- Album and Song → link to one Artist entry (optional). Artist page lists its linked albums/songs.
- Fashion entries: Brand, Shop/Site, Influencer, Piece, Look. No ratings, no links to each other.
- Tag: free label, global across all entries.
- Collection: ordered-by-added set of any entries, mixed types.

## In scope

### Foundation
- **S1** Harness: SvelteKit 3 app copied from Rues-Cooking-Hub's setup (node:sqlite, numbered SQL migrations, plain CSS tokens, vitest + Playwright phone 390x844 + desktop 1280x800, `proof`, `proof:full`, `package` tarball, `/healthz`, README), `## Harness` in CLAUDE.md (`ship: merge`, `release: tag`), `openspec/config.yaml` copied from Cooking-Hub.
  - edges: none (setup)
- **S2** CI: `ci.yml` → `gate.yml` and `release.yml` (tag `v*` → GitHub release + bump-pin into Homelab-Managment) mirrored from Cooking-Hub. Runs only once the GitHub repo exists (created at ship).
  - edges: tag ≠ package.json version → release fails (as in Cooking-Hub)
- **S3** Mock photos: ~10 CC0 photos downloaded once (Openverse/Unsplash CC0) into a fixtures/mockups folder, with source + licence listed; used only by mockups and e2e fixtures, not by the product.
  - edges: a needed shape not found → generated synthetic image

### Design and motion
- **S4** Design system: tokens (ground, glass, ink, accent per domain, radii, blur, shadows, durations, easings), self-hosted serif display + sans fonts (OFL), glass panel, pill nav, round arrow button, dark pill CTA, tag chip, shared card (photo full-bleed, chip top-left, title bottom-left, round arrow bottom-right — Swap pattern), status split-pill, star rating. Each domain gets a full light **or** dark world plus accent.
  - edges: text over photos stays legible (scrim/glass), contrast AA for body text
- **S5** Design checkpoint: a `/__mockups` route renders Home and one domain page per domain in both a light and a dark variant with the CC0 photos. **The build pauses after this unit; Rue picks light/dark (and accent) per domain** and the choice is written into the artifacts before any UI unit builds on it.
  - edges: Rue wants a variant changed → the design unit iterates before the pause ends
- **S6** Page transitions: navigating card → detail morphs the cover into the detail cover (View Transitions API); back reverses it; other navigations crossfade.
  - edges: browser without View Transitions → plain navigation, no error; reduced motion → no morph
- **S7** Scroll motion: sections and cards reveal on scroll; hero photo parallax; shelf headers sticky on desktop where it fits.
  - edges: reduced motion → content visible immediately, no parallax
- **S8** Card interaction: hero coverflow (centre card flat, neighbours tilted in 3D, "01 / N" counter, round prev/next arrows, swipe/drag on phone, arrow keys on desktop); shelf rows drag-scroll with inertia; cards lift/tilt on hover (desktop only).
  - edges: 1 item → no arrows, counter "01 / 01"; 0 items → coverflow hidden; reduced motion → no tilt, instant slide
- **S9** Micro-interactions: star fill animates on rate, status pill animates on change, toast on save/delete, numbers on Home count up on first view.
  - edges: reduced motion → instant states; a failed optimistic save (status, rating, progress on detail, progress on a card, add-to-collection) shows an error toast "Couldn't save — try again" and the control reverts to the server value, and later changes still save (Rue, 2026-11-01)

### Entries
- **S10** CRUD for all 11 types (Album, Artist, Song, Anime, Manga, Book, Brand, Shop/Site, Influencer, Piece, Look): create, detail, edit, delete with confirm. Title/name required. Fields per type:
  - Album: title, artist (link + name), year, type (album/EP), track count, cover
  - Artist: name, photo
  - Song: title, artist (link + name), album title (text), year, cover
  - Anime: title (+ alt title), year, episodes total, cover · Manga: title (+ alt), year, chapters total, volumes total, cover
  - Book: title, author(s), year, cover
  - Brand / Shop/Site: name, kind (brand | shop | site), URL, image, description · Influencer: name, handles (Instagram, TikTok, YouTube, website), avatar
  - Piece: name, brand (text), URL, price (text), image, status (wishlist | owned | gone) · Look: title, source URL, image
  - All: tags, note, created/updated timestamps
  - edges: empty title → inline error, not saved; delete → entry leaves every collection; delete an artist → linked albums/songs keep their artist name text, link cleared; very long titles truncate on cards, full on detail
- **S11** Status for media types (Album, Artist, Song, Anime, Manga, Book): none | want | in progress | done | dropped, labelled per domain (Music: Want to listen / Listening / Listened; Anime: Plan to watch / Watching / Watched; Manga & Books: Want to read / Reading / Read; all: Dropped). Changing status stores a dated status event (feeds the split-off rediscovery change).
  - edges: setting the same status again → no new event; "none" allowed (e.g. auto-created artist)
- **S12** Progress for Anime (episode n / total) and Manga (chapter n / total, volume n / total): +/− buttons and direct input on detail and card.
  - edges: total unknown (airing/ongoing, AniList null) → "n / ?", no upper bound; n can't go below 0 or above a known total; reaching a known total offers "Mark as watched/read"; progress > 0 while status want → status becomes in progress
- **S13** Rating 0.5–5 in half steps on media types; clearable; shown on cards and detail.
  - edges: unrated → no stars shown on cards; keyboard operable (arrow keys)
- **S14** Artist link: Album/Song detail links to its artist; Artist detail lists linked albums and songs from the archive. Autofill of an album/song links the existing artist with the same Deezer id, else creates the artist (status none, Deezer photo) unless Rue unticks "Add artist".
  - edges: two artists with same name, different Deezer ids → separate entries; manual entry → artist picked from existing or typed as text only

### Autofill and images
- **S15** Search autofill: Music via Deezer (album / artist / track search), Anime & Manga via AniList GraphQL, Books via Open Library. Results show cover, title, creator, year; picking one prefills the form; the cover is downloaded server-side and stored as WebP in SQLite. All providers keyless, behind one provider interface; e2e uses a fake provider (no network in tests).
  - edges: provider error/timeout (~5 s) → message + "Add manually" with the query as title; no results → same; entry with the same provider id exists → "Already in your archive" linking to it; AniList totals null → stored empty; Open Library author in original script → shown as-is, editable; debounce typing (no request per keystroke)
- **S16** URL preview for Brand, Shop/Site, Influencer, Piece: paste URL → server fetches the page (timeout ~5 s, ~1 MB cap, http/https only, private/loopback addresses refused) and reads og:title/og:image/og:description → <title> → favicon; image stored locally.
  - edges: blocked, JS-only shell, Instagram/TikTok login wall, no image → form stays usable with manual upload, short note "No preview found"; invalid URL → inline error; on brand/site/piece forms the pasted preview URL fills the entry's own URL field when it is empty, a typed URL is not overwritten (Rue, 2026-11-01)
- **S17** Image upload on every type (replaces the current image): jpeg/png/webp/gif/avif/heif → WebP via sharp, stored in SQLite, size limit 16 MB.
  - edges: unsupported file → inline error; over limit → inline error; entry without image → domain-tinted placeholder with initials

### Organising and browsing
- **S18** Tags: free, global across types; add with autocomplete from existing tags; remove; case-insensitive dedupe including non-ASCII ("Ästhetik" = "ästhetik").
  - edges: empty/whitespace tag ignored; unused tags vanish from autocomplete
- **S19** Domain lists: each type has a list view with filters status (media) / kind (sites) / status (pieces), tag, minimum rating (media), and sort by added, rating, title; filter state in the URL. Media types also offer a shelves view grouped by status.
  - edges: no entries → empty state with "Add"; filters match nothing → "Nothing matches" + reset
- **S20** Collections: create (name, optional description), rename, delete (entries stay); "Add to collection" from any detail page (popover listing collections + create new); remove entry; collection page shows mixed cards; Collections index shows each with a collage of its first 3 images and a count.
  - edges: same entry added twice → no duplicate; empty collection → placeholder collage; deleting a collection asks for confirm
- **S21** Home: hero (home hero photo, serif headline, coverflow of the 20 most recently added entries with images), shelf rows "In progress" (all media, most recently updated first), "Recently added" per domain, a collections bento.
  - edges: first run / empty archive → welcoming empty state with "Add your first …" per domain, no empty shelves shown; shelves hide when empty
- **S22** Domain landing pages (Music, Animanga, Books, Fashion): domain hero (its photo, its theme), sub-type tabs (Music: Albums / Artists / Songs; Animanga: Anime / Manga; Books; Fashion: Brands / Shops / Influencers / Pieces / Wardrobe / Looks), shelves for the domain. Wardrobe = pieces with status owned.
  - edges: no hero photo → theme gradient
- **S23** Settings: upload, replace, remove the hero photo for Home and for each domain.
  - edges: as S17
- **S24** Layout: every screen works on phone (390) and desktop (≥1280) — desktop uses the width (bento, multi-column), not a stretched phone column; floating pill nav top on desktop, bottom on phone.
  - edges: none (covered per screen)

### Added at Gate 1 (planner additions accepted by Rue)
- **S25** Influencer handle prefill: pasting an Instagram, TikTok or YouTube profile URL into the influencer form fills the matching handle field (website URLs fill the website field).
  - edges: URL of an unknown platform → only the website field; a handle already typed is not overwritten; post/video URLs (not profiles) → no prefill
- **S26** Unsaved-changes guard on add and edit forms: navigating away from a form with unsaved input asks for confirmation (like Cooking-Hub); saving or an untouched form navigates without asking.
  - edges: browser reload/close → native beforeunload prompt; after a successful save → no prompt

## Non-goals
- Surprise me / bored mode, on this day, "not touched in N months", revisit log, last-visited stamps — split off as `rediscovery` (status events from S11 already store the data it needs).
- Tag roulette, tag pages, moods, global search, full-text search — Rue chose per-domain filters only.
- Stats / year in review — later.
- Cross-domain links (anime → OST), influencer ↔ brand, piece ↔ brand, look ↔ piece links — Rue declined.
- Ratings for fashion entries and influencers; page progress for books; concerts.
- Imports (MAL, AniList, Goodreads, Spotify) and exports.
- Auth / multi-user — single user on the homelab like Life-Manager.
- Scraping Instagram/TikTok profiles beyond a best-effort OG fetch.
- Reordering entries inside a collection (added order only).
- Offline/PWA, share target, bookmarklet.
- HEIC (HEVC-coded iPhone photos) uploads — prebuilt sharp can't decode them; Rue declined the addition at Gate 1, HEIC shows "Unsupported image type".
- Deploying to the homelab (ansible role, nginx, LXC) — separate change in Homelab-Managment.
- Light/dark toggle per user — each domain has one fixed world.
- Home's "Archive in numbers" stats panel and "Start exploring" CTA from the mockup (Rue, 2026-11-01; a later tweak if missed).
- Writes surviving a reload or tab close within milliseconds of a click (no keepalive/sendBeacon; Rue, 2026-11-01).

## Codebase touchpoints
- New repo `/home/Rue/Repos/Creative-Archive` (git init, `openspec init` done; no code yet).
- Copy patterns from `Rues-Cooking-Hub` (explorer): `vite.config.ts` (Kit 3, no svelte.config.js), package.json `imports` `#lib/...`, `src/lib/server/db.ts` + `migrations/NNNN_*.sql` (node:sqlite, WAL, schema_migrations), `src/lib/server/images.ts` (sharp → WebP BLOB) + images route, `src/lib/styles/{tokens.css,global.css,tokens.ts}` + `tokens.test.ts`, `src/lib/motion.ts`, `static/fonts/` self-hosted, `/__test/seed` routes behind an env flag, `/__mockups` route, `playwright.config.ts` (phone/desktop, `node build`, `.e2e/$PORT.db`), `scripts/package.mjs`, `.github/workflows/{ci,gate,release}.yml`, `openspec/config.yaml`, CLAUDE.md Harness paragraph on e2e (PROTOCOL_HEADER, BODY_SIZE_LIMIT=16M, data-hydrated wait).
- No existing app has an external HTTP integration → provider interface and OG fetcher are new.

## Risks
- R1 Deezer API terms are non-commercial → accepted: private single-user archive.
- R2 AniList totals null for ongoing works → resolved in S12 ("n / ?").
- R3 Open Library author names in original script, gaps in covers → accepted: fields editable, upload fallback (S17).
- R4 Sites block bots / Instagram login walls → resolved in S16 (manual fallback).
- R5 View Transitions support (Rue uses LibreWolf/Firefox) → resolved in S6 (graceful fallback); the planner checks the current Firefox support and names it in design.md.
- R6 Network in tests/CI → resolved: provider interface + fake provider for e2e, units test parsers on recorded fixtures.
- R7 SSRF via URL preview → resolved in S16 (scheme check, private address refusal, size/time caps).
- R8 Scope size (24 S-items, 11 types) → accepted by Rue; mitigated by one generic entry model + per-type field config so types share CRUD/list/detail code.
- R9 Taste for domain worlds unknown → resolved by the S5 checkpoint (build pauses for Rue's pick).
- R10 Motion-heavy UI makes e2e flaky (outro transitions, duplicate submits) → planner applies the LEARNINGS rules (aria-hidden on outrostart, --repeat-each on new e2e files, reduced-motion in e2e where motion isn't under test).

## Decisions
- One change for everything — Rue: "Alles in einer Change".
- Deezer is the single music provider (albums, artists with photos, tracks), not MusicBrainz — probe showed MusicBrainz has no artist images and needs 1 req/s; Deezer works keyless.
- Media status includes "none" — so auto-created artists don't get a fake status.
- Status changes are stored as dated events — cheap now, feeds the split-off rediscovery change.
- Covers/images stored in SQLite as WebP BLOBs like Cooking-Hub — backups include images, no hotlinking.
- Each domain is a full light or dark world chosen from mockups (S5) — Rue: "Mockups entscheiden lassen".
- Hero photos are Rue's uploads; CC0 photos only for mockups/fixtures.
- UI language English.
- GitHub repo `Rue-Asha/Creative-Archive` is created and pushed only at ship after Gate 2; `ship: merge`, `release: tag`.

## Done when
- Rue can add an album by searching "Blonde", gets the cover and Frank Ocean linked as an artist, sets it to Listened and rates it 4.5.
- Rue can add Frieren (anime), step episodes to 28/28 and is offered "Mark as watched"; an ongoing manga shows "n / ?".
- Rue can paste a brand URL and gets a preview image, or uploads one when the site blocks it.
- Pieces with status owned appear under Wardrobe.
- An entry can be tagged and put into a mixed collection; the collection shows a collage.
- Home shows her hero photo, the coverflow and shelves; domain pages show their chosen light/dark world.
- Card → detail morphs the cover; scrolling reveals content; everything is still at reduced motion.
- `proof:full` green on phone and desktop; `npm run package` produces the tarball.

## Split off
- `rediscovery` (Creative-Archive): surprise me / bored mode home, on this day, not touched in N months, revisit log with re-rate, last-visited for sites.
- `creative-archive-deploy` (Homelab-Managment): ansible role from life_manager, nginx vhost, LXC, bump-pin target.
- Later ideas without a change yet: stats / year in review, imports (AniList, MAL, Goodreads), cross-domain links, colour browse.
