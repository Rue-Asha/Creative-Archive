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

## What changed in 0.2.0

- Ratings are a number from 0 to 10, with up to two decimals. Old star ratings convert by doubling: 4.5 stars is now 9.
- Brands and shops are one list, `/fashion/brands-shops`, filtered by Kind. The old `/fashion/brands` and `/fashion/shops` URLs redirect there.
- Collection entries keep a manual order.
- HEIC uploads are no longer accepted. The other six image formats stay.

### Upgrading to 0.2.0

Copy the database file before the first start of 0.2.0. Migrations `0004` and `0005` change data one way, and there is no
way back. The file is the one `DATABASE_PATH` points to (`/var/lib/creative-archive/creative-archive.db` on the host):

```sh
cp /var/lib/creative-archive/creative-archive.db /var/lib/creative-archive/creative-archive.db.0.1.3
```

To go back, stop the service, put the copy in place and start 0.1.3.

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
