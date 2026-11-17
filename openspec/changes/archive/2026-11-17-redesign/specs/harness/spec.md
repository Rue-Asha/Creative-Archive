## MODIFIED Requirements

### Requirement: Test-only routes
`POST /__test/reset`, `POST /__test/seed`, `GET /__test/counts` and `GET /__test/image/[name]` SHALL exist only for e2e and answer 404 unless `CREATIVE_ARCHIVE_TEST=1`. Reset SHALL delete every row of every table. Seed SHALL insert the entries (with tags, status, rating, progress, artist link, generated image, explicit timestamps), collections and hero images it is given and return the ids of the entries and collections. Counts SHALL return the row count of every table and, so a test can tell which status event a save wrote, the status events per status as `status_events.<status>`. The image route SHALL return a small generated PNG.

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

### Requirement: Proof commands
The repo SHALL provide `npm run proof` (the fingerprint guards `check-slop` and `check-drift`, svelte-check with `--fail-on-warnings`, build, vitest) and `npm run proof:full` (proof plus Playwright e2e). Both SHALL print the name of every passed test (vitest `--reporter=verbose`, Playwright `--reporter=list`) and exit non-zero on any failure.

#### Scenario: Proof prints test names and passes
- **WHEN** `npm run proof` runs on a clean checkout with all tests passing
- **THEN** the output lists each passed unit test by name and the command exits 0
- **proof:** manual (infrastructure; its output is the evidence every other unit relies on, read in U1's report)

#### Scenario: Proof fails on a failing check
- **WHEN** a typecheck error, build error, failing test, `check-slop` violation or edited vendored file is present
- **THEN** `npm run proof` and `npm run proof:full` exit non-zero
- **proof:** manual (infrastructure; proven once in U1 with a deliberate raw colour in a new file and a deliberate vendored edit, then reverted)

#### Scenario: Proof runs the fingerprint guards
- **WHEN** `package.json` is read
- **THEN** `proof` runs the slop check and `scripts/fingerprint/check-drift.mjs` before `npm run check`
- **proof:** unit
