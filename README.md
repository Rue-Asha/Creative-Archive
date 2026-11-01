# Creative Archive

A private archive for music, anime/manga, books and fashion: what to consume, what is in progress, what is done, and the brands, shops, influencers and looks worth remembering. Single user, self-hosted.

## Setup

Requires Node.js ≥ 22.18 (`node:sqlite` without a flag).

```sh
npm install
npx playwright install chromium   # once, for e2e
npm run dev                       # http://localhost:5173
```

The `/__mockups` design checkpoint reads its photos from `fixtures/mockups` and, like the `/__test/*` routes, only answers
with the test flag: start it with `CREATIVE_ARCHIVE_TEST=1 npm run dev`.

## Checks

```sh
npm run proof        # typecheck, build, unit tests
npm run proof:full   # proof + Playwright e2e on phone and desktop viewports
npm run package      # build, then dist/creative-archive-<version>.tgz + .sha256
```

`proof:full` serves the production build on `$PORT` (default 4173) with a throwaway database at
`.e2e/$PORT.db`, so several runs on different ports don't interfere.

## Release

Releases are cut by tag; the ship runbook for `v0.1.0` and the release procedure are in [docs/release.md](docs/release.md).

## Configuration

The production server (`node build`) reads these environment variables:

| Variable | Default | Meaning |
|---|---|---|
| `PORT` | `3000` | port to listen on |
| `HOST` | `0.0.0.0` | address to bind |
| `DATABASE_PATH` | `./data/creative-archive.db` | SQLite file; its directory is created, migrations apply on start |
| `PROTOCOL_HEADER` | unset | proxy header carrying the scheme, e.g. `x-forwarded-proto`; needed behind plain-http nginx for form posts |
| `BODY_SIZE_LIMIT` | `512K` | largest request body; set `17M` so 16 MB image uploads fit |
| `CREATIVE_ARCHIVE_TEST` | unset | `1` enables the `/__test/*` and `/__mockups` routes and swaps search and page fetches for fakes; never set in production |
| `MOCKUP_PHOTOS_DIR` | unset | folder of CC0 photos for the mockups and e2e fixtures; the e2e config points it at `fixtures/mockups` |

`GET /healthz` answers `ok` (200) while the database responds, 503 otherwise.
