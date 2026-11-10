# harness Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Proof commands
The repo SHALL provide `npm run proof` (svelte-check with `--fail-on-warnings`, build, vitest) and `npm run proof:full`
(proof plus Playwright e2e). Both SHALL print the name of every passed test (vitest `--reporter=verbose`, Playwright
`--reporter=list`) and exit non-zero on any failure.

#### Scenario: Proof prints test names and passes
- **WHEN** `npm run proof` runs on a clean checkout with all tests passing
- **THEN** the output lists each passed unit test by name and the command exits 0
- **proof:** manual (infrastructure; its output is the evidence every other unit relies on, read in U1's report)

#### Scenario: Proof fails on a failing check
- **WHEN** a typecheck error, build error or failing test is present
- **THEN** `npm run proof` and `npm run proof:full` exit non-zero
- **proof:** manual (infrastructure; proven once in U1 with a deliberately failing test, then reverted)

### Requirement: E2E projects and isolation
Playwright SHALL run two projects, `phone` (390×844, touch, mobile) and `desktop` (1280×800), with `workers: 1`,
against the built adapter-node server (`node build`, or the build in `$E2E_APP_DIR` when set) on `$PORT` (default
4173), with `DATABASE_PATH=.e2e/$PORT.db` removed before the server starts, `CREATIVE_ARCHIVE_TEST=1`,
`PROTOCOL_HEADER=x-forwarded-proto`, `extraHTTPHeaders: { 'x-forwarded-proto': 'http' }`, `BODY_SIZE_LIMIT=17M` and
`MOCKUP_PHOTOS_DIR` pointing at the repo's `fixtures/mockups`. Every e2e test SHALL wait for `html[data-hydrated]`
before interacting.

#### Scenario: Proof-full runs e2e on an isolated database
- **WHEN** `PORT=4701 npm run proof:full` runs
- **THEN** Playwright lists every passed e2e test by name and the server used `.e2e/4701.db`, never the dev database
- **proof:** manual (infrastructure; proven by running it in U1 and by every unit running on its own port)

#### Scenario: Each e2e test runs on phone and desktop
- **WHEN** `npm run proof:full` runs
- **THEN** the list output shows each device-independent test once under `[phone]` and once under `[desktop]`
- **proof:** manual (suite structure; read from the proof:full list output at Gate 2)

#### Scenario: App is hydrated before tests interact
- **WHEN** a page is opened with the `open` helper
- **THEN** the helper resolves only after `html[data-hydrated]` is present
- **proof:** e2e

### Requirement: Database and migrations
The server SHALL open the SQLite database at `DATABASE_PATH` (default `./data/creative-archive.db`) with WAL and
foreign keys on, create its directory if missing, and apply every not yet applied `migrations/NNNN_*.sql` file in
name order, each in its own transaction recorded in `schema_migrations`, at startup. Each migration SHALL run with
foreign keys off, so rebuilding a table cascades nothing; before its commit `PRAGMA foreign_key_check` SHALL report no
row, otherwise the migration SHALL be rolled back, stay unrecorded and fail naming itself. Foreign keys SHALL be on
again after `migrate` returns or throws.

#### Scenario: Fresh database gets the schema
- **WHEN** the server opens a database file that does not exist
- **THEN** every migration is applied and recorded in `schema_migrations`
- **proof:** unit

#### Scenario: Only new migrations run on an existing database
- **WHEN** a database already has `0001_images.sql` recorded and a new migration file exists
- **THEN** only the new migration runs
- **proof:** unit

#### Scenario: Failing migration stops the server
- **WHEN** a migration contains invalid SQL and the built server starts
- **THEN** the server exits non-zero naming the failing migration, and the database keeps no part of that migration
- **proof:** unit

#### Scenario: Server starts from any working directory
- **WHEN** the built server is started from a directory other than the package root
- **THEN** it finds `migrations/` next to `package.json` and answers `/healthz` with 200
- **proof:** unit

#### Scenario: Migration that breaks a foreign key is rolled back
- **WHEN** `migrate` runs a migration that inserts an `entry_tags` row pointing at a missing entry
- **THEN** it throws an error naming that migration, the row is not stored and the migration is not recorded
- **proof:** unit

#### Scenario: Foreign keys are on after migrating
- **WHEN** `migrate` has applied the migrations, and when it has thrown on a failing one
- **THEN** `PRAGMA foreign_keys` reads 1 in both cases
- **proof:** unit

### Requirement: Health route
`GET /healthz` SHALL answer 200 `ok` when the database answers a query and 503 otherwise.

#### Scenario: Healthy server answers 200
- **WHEN** `/healthz` is requested on a running server
- **THEN** the response is 200 with body `ok`
- **proof:** unit

#### Scenario: Unreadable database answers 503
- **WHEN** the database cannot answer a query
- **THEN** `/healthz` answers 503
- **proof:** unit

### Requirement: Test-only routes
`POST /__test/reset`, `POST /__test/seed`, `GET /__test/counts` and `GET /__test/image/[name]` SHALL exist only for
e2e and answer 404 unless `CREATIVE_ARCHIVE_TEST=1`. Reset SHALL delete every row of every table. Seed SHALL insert the entries (with
tags, status, rating, progress, artist link, generated image, explicit timestamps), collections and hero images it is
given and return the ids of the entries and collections. Counts SHALL return the row count of every table. The image
route SHALL return a small generated PNG.

#### Scenario: Test routes answer 404 without the test flag
- **WHEN** a test route handler runs while `CREATIVE_ARCHIVE_TEST` is not `1`
- **THEN** it responds 404 and changes nothing
- **proof:** unit

#### Scenario: Reset empties the archive
- **WHEN** entries, collections and a hero were seeded and `POST /__test/reset` is called
- **THEN** `GET /__test/counts` reports 0 for entries, tags, entry_tags, status_events, collections, collection_entries, heroes and images
- **proof:** e2e

#### Scenario: Seed returns the ids of what it inserted
- **WHEN** `POST /__test/seed` is called with an artist, an album linked to it by index and one collection holding the album
- **THEN** the response lists two entry ids and one collection id, and `GET /__test/counts` reports 2 entries, 1 collection and 1 collection entry
- **proof:** e2e

### Requirement: Test-mode fakes
With `CREATIVE_ARCHIVE_TEST=1` the server SHALL use the fake provider for every search and the fake remote for every
page and image fetch, so tests never reach the network; without the flag it SHALL use the real providers and the real
remote.

#### Scenario: Test mode uses the fake provider and remote
- **WHEN** `providerFor('album')` and `getRemote()` are called with `CREATIVE_ARCHIVE_TEST=1`
- **THEN** they return the fake provider and the fake remote, and searching albums for "Blonde" returns Blonde by Frank Ocean without a network call
- **proof:** unit

#### Scenario: Production mode never uses the fakes
- **WHEN** `providerFor` and `getRemote()` are called without the test flag
- **THEN** they return the Deezer, AniList and Open Library providers and the safe-fetch remote
- **proof:** unit

### Requirement: Package script
`npm run package` SHALL build the app and write `dist/creative-archive-<version>.tgz` plus its `.sha256`. The tarball
SHALL hold exactly one top-level directory `creative-archive-<version>/` containing only `build/`, `migrations/`,
`node_modules/` (production, including sharp's linux-x64 binaries once U7 adds sharp), `package.json` and
`package-lock.json`.

#### Scenario: Package produces a verifiable tarball
- **WHEN** `npm run package` runs
- **THEN** `dist/` holds the tgz and a `.sha256` file that `sha256sum -c` accepts, and the tgz's top-level directory lists exactly the five entries above
- **proof:** unit

### Requirement: Harness declaration
`AGENTS.md` SHALL describe the app and the Kit 3 conventions and contain `## Harness` declaring proof
`npm run proof`, proof-full `npm run proof:full`, run `npm run dev` → http://localhost:5173, package, `ship: merge`
and `release: tag`, followed by the e2e paragraph (projects, workers, `.e2e/$PORT.db`, test flag, proxy header,
`BODY_SIZE_LIMIT`, `data-hydrated` wait, reset-first). The README SHALL cover setup, checks and the env vars `PORT`,
`HOST`, `DATABASE_PATH`, `PROTOCOL_HEADER`, `BODY_SIZE_LIMIT`, `CREATIVE_ARCHIVE_TEST`, `MOCKUP_PHOTOS_DIR`.

#### Scenario: Harness declared with merge and tag policy
- **WHEN** `AGENTS.md` is read
- **THEN** its `## Harness` section lists `proof`, `proof-full`, `run`, `package`, `ship: merge` and `release: tag` and the e2e paragraph follows
- **proof:** manual (documentation; checked by reading the file at Gate 2)

#### Scenario: README documents setup and env vars
- **WHEN** `README.md` is read
- **THEN** it explains install, dev, proof, package and every env var listed above
- **proof:** manual (documentation; checked by reading the file at Gate 2)

### Requirement: Entries table accepts magazines
Migration `0003_magazine.sql` SHALL rebuild `entries` so its `type` CHECK allows `magazine` and its status CHECK
requires a null status for magazines, keeping every row with its id and values, the indexes `entries_external`,
`entries_type_created` and `entries_updated`, the self-reference `artist_id` and every foreign key from `entry_tags`,
`status_events` and `collection_entries`. A fresh database and a migrated one SHALL end with the same schema.

#### Scenario: Existing database migrates without loss
- **WHEN** a database at `0002_core.sql` holds entries of all 11 earlier types (with an artist link, an image, progress, a rating, a kind, details and a note), tags on several entries, status events, two collections with entries and a hero, and `migrate` then applies `0003_magazine.sql`
- **THEN** every data table holds the same rows with the same values as before, ordered by rowid; `PRAGMA foreign_key_check` returns no row and `PRAGMA integrity_check` returns "ok"
- **proof:** unit

#### Scenario: Foreign keys still bind after the rebuild
- **WHEN** after migrating that database the artist entry and a tagged entry with events and collection links are deleted
- **THEN** the album's `artist_id` becomes null with `artist_name` kept, and the deleted entry's `entry_tags`, `status_events` and `collection_entries` rows are gone while the other entries' rows remain
- **proof:** unit

#### Scenario: Migration 0003 runs once
- **WHEN** `migrate` runs again on the migrated database
- **THEN** `schema_migrations` lists `0003_magazine.sql` exactly once and every data table is unchanged
- **proof:** unit

#### Scenario: Fresh and migrated databases share one schema
- **WHEN** the `sqlite_master` rows (type, name, sql) of a fresh database and of the migrated one are compared
- **THEN** they are equal, the three `entries` indexes among them
- **proof:** unit

#### Scenario: Database accepts a magazine only without a status
- **WHEN** a fresh database gets a magazine with a null status, one with status `done` and one with status `owned`
- **THEN** the first is stored and the other two fail the CHECK
- **proof:** unit

