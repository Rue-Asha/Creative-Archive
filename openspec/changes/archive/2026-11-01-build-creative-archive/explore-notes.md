# Explore notes: build-creative-archive

## Original request (Rue, 2026-10-31, paraphrased from German)
New webapp "Creative Archive": persist things from Rue's creative domains.
Domains: 1. Music 2. Fashion 3. Animanga 4. Books.
- Music, Animanga, Books: track want / in progress / done.
- Rate items (albums, manga, books, ...).
- Fashion: save websites and brands to revisit, and to explore when bored.
- Same for influencers saved into the archive.
- UI/UX: orient on ~/Pictures/UI-inspo/, use the Mobbin MCP for design research.
- Animation-rich site.
- Explore further features and functionality.
- It is an archive, but its purpose is (re)discovering things more than finding them.

## UI inspo (~/Pictures/UI-inspo/, 5 images) — common traits
- Full-bleed photography behind a large rounded "app frame"; glassmorphic, frosted panels float over the photo.
- Display type: large light serif headline mixed with sans (e.g. "Spaces That *Inspire*", accent word in warm brown/italic).
- Pill nav centred top, round icon buttons, dark pill CTA with circular arrow.
- Small tracked-out uppercase eyebrow ("ARCHITECTURE — INTERIORS — LANDSCAPES"), vertical side list of keywords.
- Bento bottom row: featured card with image + counter "01 / 06" + prev/next arrows, stats card, dark promo card.
- Coverflow / fanned 3D card carousel with "01/20" counters and tag chips (Mindframe image).
- Muted palettes: warm beige/stone, greys; one image (NOAL) with deep green + red accent blocks and chunky display type.
- One dark variant (AI platform): grey glass on black, black dots as bullets, numbered pager 1/2/3.

## Answers round 1 (2026-10-31)
- Music: albums (incl. EPs), artists, single songs are all trackable/ratable units. (Concerts: no.)
- Animanga: anime and manga as separate types, with progress (episode n/N, chapter/volume).
- Fashion: brands, shops/sites (non-brand: retailers, mags, blogs), single pieces/looks (moodboard, maybe wishlist), own wardrobe.
- Influencers: fashion only.

## Research: sibling apps (explorer over Rues-Cooking-Hub, Life-Manager, Homelab-Managment)
- Stack to copy: SvelteKit 3 (config in vite.config.ts, no svelte.config.js), Svelte 5, Vite 8, TS 6, adapter-node, Node >= 22.18, npm. Imports via package.json `imports` `#lib/...` with explicit `.ts`.
- Plain CSS, tokens in src/lib/styles/tokens.css (+ tokens.ts mirror + tokens.test.ts in Cooking-Hub). Motion via svelte/transition + svelte/easing in src/lib/motion.ts, no anim lib.
- Persistence: node:sqlite DatabaseSync, WAL, foreign_keys; numbered SQL migrations in migrations/ applied at startup into schema_migrations (Cooking-Hub). DATABASE_PATH env.
- Images: uploaded, sharp -> WebP, stored as BLOB in `images` table, served by a route; BODY_SIZE_LIMIT=16M. Backup of DB includes photos.
- Single user, no auth, homelab only (nginx -> 127.0.0.1:3000, Tailscale). PROTOCOL_HEADER=x-forwarded-proto needed behind proxy. /healthz route.
- Tests: vitest units next to code; Playwright e2e in e2e/, projects phone 390x844 + desktop 1280x800, against `node build`, DB at .e2e/$PORT.db, test-only /__test/seed routes behind env flag.
- Scripts: check (svelte-check --fail-on-warnings), proof = check+build+test:unit, proof:full = proof+test:e2e, package -> dist tarball.
- Harness in Cooking-Hub CLAUDE.md: proof / proof-full / run `npm run dev` / package / ship: merge / release: tag.
- CI: ci.yml -> gate.yml (homelab check runner on PR), release.yml on tag v* -> GitHub release + bump-pin PR into Homelab-Managment via Rue-Asha/ci reusable workflow. Deploy = ansible role (copy of life_manager role) pulling the release tarball.
- openspec/config.yaml: copy from Rues-Cooking-Hub.
- Fonts: self-hosted woff2 in static/fonts with OFL texts (Cooking-Hub: Fraunces + DM Sans).

## Research: metadata APIs (from agent knowledge, not live-checked; re-verify limits)
- No key/account: MusicBrainz + Cover Art Archive (music, ~1 req/s, needs descriptive User-Agent), iTunes Search (cover fallback, ~20 req/min), Deezer (cover fallback), AniList GraphQL (anime+manga, 90 req/min, has relations/adaptations), Jikan (MAL, unofficial), MangaDex (optional), Open Library (books, covers by ISBN, ~100 covers/5 min).
- Avoid (need account/key): Discogs, Last.fm, Google Books (key needs GCP).
- Websites: server-side OG scrape (og:title/og:image/description, fallback <title>/favicon), timeout ~5 s, size cap, download og:image once and store locally, block private IPs (SSRF), manual image upload as fallback.
- Instagram/TikTok profiles: realistically blocked without login; store handle + URL, manual avatar upload, best-effort OG only.
- Covers: fine to cache for a private archive, don't republish.

## Research: rediscovery feature ideas (S/M/L)
S: Surprise me (random, filter by domain/status) · Not touched in N months shelf · On this day · revisit log + count (re-listen/re-read/rewatch) · tags + moods + tag roulette · notes + favourite quote · brand/influencer "last visited" stamp via Open button · Bored mode home (3 random picks across domains) · rating prompt on done + re-rate on revisit.
M: cross-domain typed links (anime -> OST album, book -> adaptation) · mixed-domain collections/moodboards · dominant colour extraction + browse by colour · year in review/stats · serendipity feed (staleness + rating + tag overlap, weighted random) · imports (AniList, MAL XML, Goodreads CSV) · autofill search via provider interface + local cover cache · more like this (shared tags) · timeline/diary of added/finished · weekly digest via ntfy.
L: external suggestions queue (AniList recs etc.) · bookmarklet/share-target PWA · FTS5 full-text search over notes.

## Research: Mobbin references (app names verified; not on Mobbin: Letterboxd web, Are.na, StoryGraph, AniList, MAL, Goodreads web, Raindrop)
- Rediscovery home: Cosmos web For You masonry + floating pill nav https://mobbin.com/screens/e69def6d-af58-4a2d-8377-e0e81b2b5b45 · Cosmos collection with "See similar" https://mobbin.com/screens/f50a3921-35cc-4d7f-ae07-0f2643c05bae · Apple Music Library/Home shelves https://mobbin.com/screens/97b9afbb-a285-4693-bc73-efd070107178 https://mobbin.com/screens/8c345080-d9bd-4ad5-a6c7-8e5b32445b20 · Pinterest boards https://mobbin.com/screens/f19eb118-a528-4b5e-9c95-77dfd923d293 · Savee board https://mobbin.com/screens/ffb7f6ea-4e36-41fe-b8e8-df374ea0eec8
- Detail + rating/status: Goodreads book (blurred-cover backdrop, Want to Read split button, stars) https://mobbin.com/screens/fba5e209-74c3-4a67-a61b-627d7ca63513 · Letterboxd quick-action bar https://mobbin.com/screens/eba068df-917c-47da-9641-c694181486b7 · Letterboxd "I Watched…" log sheet (date, half stars, note, tags) https://mobbin.com/screens/f58dd9bd-5788-472e-bc4a-2723f03bae89 · Letterboxd detail https://mobbin.com/screens/ed3357be-d60a-40a2-9608-fa4997929f24 · Letterboxd list hero https://mobbin.com/screens/f6fb900c-adec-48b3-bd65-56b4c4ccddd1
- Status shelves: Goodreads My Books https://mobbin.com/screens/edc73cdd-fa6d-4354-b677-a4585af306b1 · Notion board https://mobbin.com/screens/f1724632-5d42-47ff-96cc-7884f9733a00 · Shelf iOS list https://mobbin.com/screens/7d1f3384-fae8-4409-98fc-79cd7d0de027
- Link collections: Swap brand cards (photo, chip TL, name BL, round arrow BR) https://mobbin.com/sites/sections/3ba10283-c38e-4a8f-850d-9f2f2a0bf381 · Variant URL moodboard https://mobbin.com/screens/44229a5a-7e15-4dc8-9698-c24a56534cb9 · Savee profile https://mobbin.com/screens/e7cf7608-8b14-4d14-a3aa-cb5c7bb7b3e3 · Cosmos save popover https://mobbin.com/screens/d2d59edc-b766-4cd3-8690-fce9725424fe
- Stats/year: Letterboxd Year in Review https://mobbin.com/screens/0d70f191-8152-4335-8f4d-822817f38c34 https://mobbin.com/screens/11ec3954-ff90-4553-be58-04e4ecbd8d31 · Letterboxd stats https://mobbin.com/screens/81cf14b8-0ba2-4f7f-97e9-c2c954dfa49e · Spotify Wrapped https://mobbin.com/screens/ea41e56b-60ff-4986-ac45-a3b19c903fee · Brink heatmap https://mobbin.com/screens/25b055b2-386f-463e-943c-099849dd5f03
- Hero/coverflow/glass: Frontify serif hero + glass frame https://mobbin.com/sites/sections/2d1eac14-3056-4a94-b927-adecc9d3526f · Spotify glass stat panels https://mobbin.com/screens/b93bf303-5908-4beb-8636-f8f2d79b7bbf · Spotify Loud&Clear fanned cards 01…10 https://mobbin.com/screens/44b16bcf-33e8-410c-87e3-046be5d38f0a · Zellerfeld coverflow https://mobbin.com/sites/sections/99379b0a-ae8d-48cc-a359-eac6aa7f3f00 · Shader 3D strip https://mobbin.com/sites/sections/e979a89e-2179-4f3d-96dd-4d42ed01afb8 · Mistral peek carousel https://mobbin.com/sites/sections/fc0d02b9-2df2-4539-8819-51c2d1e0bf64
- Takeaways: home = rediscovery feed not dashboard, with always-visible Surprise-me button · shelf rows with serif title, count, round arrows · one shared card shape (Swap) for all domains · coverflow with 01/20 counter as hero · detail = blurred-cover backdrop + glass panel with status split-pill + rating · log sheet (date, half stars, note, tags) feeds on-this-day/forgotten · status-filtered poster shelves instead of kanban · brand/person profile header + tabs · year in review as vertical story of full-panel cards.

## Answers rounds 2–7 (2026-10-31)
- Entry: search + autofill (keyless APIs), URL paste -> OG preview for sites, manual as fallback.
- Rating: 5 stars with halves (0.5–5). Ratable: music (album, artist, song), animanga, books only.
- Discovery v1: tags + collections only. Surprise me, on this day, not-touched shelf, revisit log -> split off.
- Hosting: homelab like Life-Manager (release tarball by tag, ansible role = separate change in Homelab-Managment). GitHub repo Rue-Asha/Creative-Archive + CI like Cooking-Hub; repo creation/push only at ship.
- Home: editorial hero + shelves. Motion: page transitions (shared-element cover morph), scroll-driven (reveal, parallax), card interaction (coverflow/3D tilt, drag carousels), micro-interactions. All four.
- Theme: per-domain mood, each domain fully light or dark; decided from mockups (design unit shows both variants per domain, Rue picks before UI units build on it).
- Hero photos: Rue uploads her own (per domain + home). Mockups/fixtures: ~10 CC0 photos downloaded once, not shipped.
- Music: album (incl. EP), artist, song all get the same statuses; album/song link to artist entries.
- Animanga: anime and manga separate, with progress (episodes; chapters/volumes).
- Status: want / in progress / done + dropped. Books: status only, no pages.
- Fashion: brands, shops/sites, pieces (wishlist/owned/gone; wardrobe = owned), looks (inspo images). Piece and look not linked to each other or to brands.
- Brands/shops/influencers: name, URL, image, tags, note. No last-visited, no influencer<->brand links.
- Influencers: fashion only.
- Tags: free, no moods, no roulette. Finding: filters per domain list (status, tag, rating, sort). No global search, no tag pages.
- Collections: any entry type mixed.
- UI language: English.
- Appetite: everything in one change.

## API probe (live, 2026-10-31, no keys)
- Deezer search/album, search/artist, search/track: works keyless; album cover_xl 1000px, artist picture_xl 1000px, nb_tracks. -> single music provider (MusicBrainz has no artist images).
- AniList GraphQL: anime episodes/seasonYear/coverImage.extraLarge/genres OK; manga Vagabond chapters=null, volumes=null, status RELEASING -> totals can be unknown.
- Open Library search.json: works; author_name may be original script (村上春樹); cover via covers.openlibrary.org/b/id/<cover_i>-L.jpg.
