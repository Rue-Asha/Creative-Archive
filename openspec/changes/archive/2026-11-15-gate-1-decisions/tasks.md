## 1. Rating 0 to 10

> unit: depends=none · files=migrations/0004_rating_x100.sql, src/lib/server/migrate-0004.test.ts, src/lib/server/migrate-0003.test.ts, src/lib/server/schema.test.ts, src/lib/entries/derive.ts, src/lib/entries/derive.test.ts, src/lib/server/rows.ts, src/lib/server/rows.test.ts, src/lib/server/tracking.ts, src/lib/server/tracking.test.ts, src/lib/server/entries.ts, src/lib/server/entries-list.test.ts, src/lib/server/testing.ts, src/lib/types.ts, src/routes/__test/test-routes.test.ts, src/lib/entries/query.ts, src/lib/entries/query.test.ts, src/lib/entries/FilterBar.svelte, src/routes/(app)/entries/[id]/+page.svelte, src/lib/entries/EntryCard.svelte, src/lib/ui/Card.svelte, e2e/rating.test.ts, e2e/cards.test.ts, e2e/list-filters.test.ts, e2e/detail.test.ts, e2e/journey.test.ts, e2e/globals.test.ts, e2e/layout.test.ts, e2e/artist-link.test.ts, e2e/status.test.ts, e2e/progress.test.ts

One unit because the wave must end with proof-full green: once ratings are stored on 0..10, the seed route, the star control, the minimum-rating filter and every e2e that seeds or asserts a rating have to move in the same merge. Build order: 1.1–1.5 server storage (unit proof green after each commit), then 1.6–1.9 query, adapter and e2e; run `proof:full` once at the end of the unit before handing back. `StarRating.svelte` stays on stars (the design-system scenarios and `e2e/design.test.ts` keep passing unchanged); the adapter lives at its two app call sites. The migration file and its test are reversible code; the migration only becomes one-way when it runs on real data (task 6.4 and the README upgrade note).

- [x] 1.1 Write the failing tests "Scenario: Rating is stored in whole hundredths", "Scenario: Migration converts star ratings" (new `migrate-0004.test.ts`: migrate through `0003`, seed `rating_x2` 9, 1 and null, then migrate through `0004` only), "Scenario: Rating accepts 0 to 10 with two decimals", "Scenario: Clearing keeps 0 distinct from unrated" and "Scenario: Minimum rating uses the 0 to 10 scale"; move the existing "List query filters by status, kind, tag and minimum rating" (`minRating: 8`) and "List query sorts by added, rating and title" (6 / 10) to the new values
- [x] 1.2 Add `migrations/0004_rating_x100.sql`: add `rating_x100` with CHECK 0..1000, back-fill `rating_x2 * 100`, drop `rating_x2`; the migration test pins that `DROP COLUMN` works on the bundled SQLite (if it doesn't, rebuild `entries` in the same migration as `0003_magazine.sql` does)
- [x] 1.3 Limit `migrate-0003.test.ts` to the migrations through `0003` so its before/after snapshot stays a test of `0003` when later migrations change columns; move the rating CHECK test in `schema.test.ts` to `rating_x100` (0 and 1000 pass, -1 and 1001 fail)
- [x] 1.4 Replace `ratingFromX2` / `ratingToX2` with `ratingFromX100` / `ratingToX100` (round, range 0..10, reject more than two decimals and non-finite); `rows.ts` reads and writes `rating_x100`; `insertEntryRow` and the seed route take ratings on the 0..10 scale; update the `types.ts` comment and `test-routes.test.ts`
- [x] 1.5 `setRating` validates 0..10 with two decimals, message "Rating must be between 0 and 10 with up to two decimals"; `listEntries` minimum rating and rating sort use `rating_x100`
- [x] 1.6 Write the failing tests: the round-trip with `minRating: 8.75` in "Scenario: List query round-trips through the URL"; retitle and rewrite the e2e tests to "Scenario: Rate in half stars through the adapter" (stored rating 9), "Scenario: Keyboard rates with arrow keys through the adapter", "Scenario: Rated entries show their rating on cards" (stored 7 reads "3.5 of 5"), "Scenario: Filter by minimum rating" (`?rating=8` on 7.5, 8 and 9.25) and "Scenario: Filters matching nothing offer reset" (minimum 10)
- [x] 1.7 `fromSearchParams` accepts `rating` 0..10 with up to two decimals and drops the rest
- [x] 1.8 Adapter: the detail page passes `rating / 2` (rounded to half steps) to `StarRating` and posts stars x 2; `EntryCard` passes `rating / 2` to `Card`, and `Card` shows the display for any non-null rating; FilterBar minimum-rating options send stars x 2 with their labels unchanged
- [x] 1.9 Update the other e2e tests that seed a `rating` or assert a saved `rating=` value (globals, layout, artist-link, status, progress, journey, detail) to the 0..10 scale; tests that reload after a rating write await it with `countSaves`, tests that count saves use `recordSaves`

## 2. Collection order

> unit: depends=1 · files=migrations/0005_collection_position.sql, src/lib/server/migrate-0005.test.ts, src/lib/server/schema.test.ts, src/lib/server/collections.ts, src/lib/server/collections.test.ts, src/routes/(app)/collections/[id]/+page.server.ts, src/routes/(app)/collections/[id]/page.server.test.ts

Depends on 1 for the migration order and for the `migrate-0003.test.ts` limit (without it the `0003` snapshot test goes red on the new column). The migration file and its test are reversible code; see unit 1.

- [x] 2.1 Write the failing tests "Scenario: New entry goes to the end", "Scenario: Removing keeps the order of the rest", "Scenario: Reorder sets the given order", "Scenario: Reorder with a wrong id set is rejected", "Scenario: Reordering changes the order and the collage", "Scenario: Reorder action saves the order" (new `page.server.test.ts` calling the action with form data) and "Scenario: Migration preserves the existing order" (new `migrate-0005.test.ts`: migrate through `0004`, insert collection rows out of order, then migrate through `0005`); retitle the collage test to "Scenario: Collage uses the first three images in collection order"
- [x] 2.2 Add `migrations/0005_collection_position.sql`: add `position`, back-fill with `ROW_NUMBER()` by `added_at, rowid`, add the index
- [x] 2.3 `addToCollection` appends with the next `position`; `getCollection` and the collage order by `position`
- [x] 2.4 `reorderCollection` validates the id set and rewrites positions in one transaction; wire the `reorder` form action (400 failure on invalid ids)

## 3. Initial status on create

> unit: depends=1 · files=src/lib/server/entries.ts, src/lib/server/entries.test.ts, src/lib/types.ts, src/lib/entries/save.ts, src/lib/entries/save.test.ts, src/routes/(app)/add/[type]/+page.server.ts, src/routes/(app)/add/[type]/page.server.test.ts

- [x] 3.1 Write the failing tests "Scenario: Create a media entry with an initial status", "Scenario: Invalid initial status is rejected", "Scenario: Valid status prefills the form" and "Scenario: Invalid status is dropped" (the last two in a new `page.server.test.ts` calling the add load)
- [x] 3.2 `EntryInput.status`; `createEntry` validates like `setStatus`, stores it and writes the first status event for media other than none; the form-data parser reads an optional `status`
- [x] 3.3 `/add/[type]` load returns `initialStatus` from a valid `status` query value and drops invalid ones

## 4. HEIC removed

> unit: depends=none · files=src/lib/entries/imageFormats.ts, src/lib/entries/imageFormats.test.ts, src/lib/entries/ImageField.svelte, src/lib/server/images.ts, src/lib/server/images.test.ts, fixtures/heic/sample.heic

- [x] 4.1 Write the failing tests "Scenario: A .heic file is refused in the browser" and "Scenario: HEIC is rejected by the server" (add a small HEIC fixture)
- [x] 4.2 Move the MIME/extension check into `imageFormats.ts` without `image/heic` and `.heic`; `ImageField.svelte` imports it
- [x] 4.3 `downscale` rejects `compression === 'hevc'` with `ImageError('not-image')`; AVIF files still pass (existing "Each listed format is accepted" scenario stays green)

## 5. Combined brands-and-shops list

> unit: depends=1,3 · files=src/lib/entries/config.ts, src/lib/entries/config.test.ts, src/lib/entries/derive.ts, src/lib/entries/derive.test.ts, src/lib/entries/query.ts, src/lib/entries/query.test.ts, src/lib/entries/FilterBar.svelte, src/lib/server/entries-list.test.ts, src/routes/(app)/[domain]/[list]/+page.server.ts, src/routes/(app)/add/[type]/+page.server.ts, e2e/domain-pages.test.ts, e2e/subtabs.test.ts, e2e/list-filters.test.ts, e2e/brands-shops.test.ts, src/lib/server/home.ts, src/lib/server/home.test.ts

Depends on 1 (query, FilterBar, derive, list-filters e2e) and 3 (add load). The new e2e scenarios go into a new `e2e/brands-shops.test.ts` to keep edits to shared e2e files small. `AddMenu.svelte` and `TYPES_BY_DOMAIN` stay unchanged (the merged Add item comes with the redesign); `domainShelves` builds the one combined shelf itself.

- [x] 5.1 Write the failing tests "Scenario: Combined brands-and-shops query spans both stored types", "Scenario: Changing the kind keeps the entry in the combined list", "Scenario: Fashion list config declares the groups" (updated), "Scenario: Retired brands list redirects", "Scenario: Retired shops list redirects" and "Scenario: Both add routes open the combined form", "Scenario: One shelf holds brands and shops" and the updated "Scenario: Fashion shelves follow the type order"
- [x] 5.2 Replace the Brands and Shops lists in `LISTS.fashion` and the "Discover" group with `brands-shops` / "Brands & shops"; map stored type `site` to the combined slug in `listHref` (Cancel, delete navigation, shelf links)
- [x] 5.3 The kind filter (Brand, Shop, Site) applies on the combined list; `fromSearchParams` accepts `kind` for it
- [x] 5.4 `[list]` load: 308 redirect from `brands` (adds `kind=brand`) and `shops` (adds nothing), keeping other query values
- [x] 5.5 `/add/brand` and `/add/site` load the same form with Kind preselected brand / shop
- [x] 5.6 `domainShelves('fashion')` returns one "Brands & shops" shelf over brand and site (count, 12 newest, href `/fashion/brands-shops`) in place of the Brands and Shops shelves
- [x] 5.7 Update e2e: "Scenario: Sub-type tabs per domain" (domain-pages), "Scenario: Fashion tabs come in two labelled groups" and "Scenario: Grouped tabs sit in one row on desktop" (subtabs, six tabs), "Scenario: Filter brands and shops by kind" (list-filters, renamed from "Filter shops by kind")

## 6. Release, proof and docs

> unit: depends=1,2,3,4,5 · files=package.json, package-lock.json, scripts/version.test.ts, openspec/changes/gate-1-decisions/specs/release/spec.md, docs/functional-contract.md, README.md, graphify-out/

- [x] 6.1 Bump to 0.2.0 (feature = minor under `release: tag`): `package.json`, the lockfile, `scripts/version.test.ts` retitled "Scenario: Package and lockfile carry 0.2.0", and a release delta spec renaming the Version requirement from main's current version (0.1.3 once flow/e2e-decouple is merged) to 0.2.0
- [x] 6.2 Mark the server/data rows of the contract's Gate-1 decisions table as done and bring the contract's Fashion tabs, shelves and lists in line with main (Wardrobe, Pieces, Looks, Brands & shops, Influencers, Magazines; Magazines was missing); README mentions the combined list, the 0..10 rating and no HEIC where it listed the old behavior, and gets an upgrade note for 0.2.0: copy the database file before the first start, because `0004` and `0005` are one-way on real data
- [x] 6.3 `npm run proof` green, then `npm run proof:full` green (background job, run once at a time)
- [x] 6.4 ⚠ irreversible (human-gated; Rue runs or approves it and ticks the box): start the new build on a copy of the real database file (never the live file) and open a rated album, a collection and `/fashion/shops` once; the live file is only migrated by the first start of 0.2.0 on the host after the README backup step
- [x] 6.5 `graphify update .` and `openspec validate gate-1-decisions --strict`
