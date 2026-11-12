## 1. Contracts and migrations

> unit: depends=none · files=migrations/0003_rating_x100.sql, migrations/0004_collection_position.sql, src/lib/entries/derive.ts, src/lib/entries/derive.test.ts, src/lib/server/schema.test.ts, src/lib/server/testing.ts

- [ ] 1.1 Write the failing tests "Scenario: Rating is stored in whole hundredths" (derive helpers) and "Scenario: Migration preserves the existing order" (schema test on a database migrated to 0002 with out-of-order collection rows)
- [ ] 1.2 ⚠ irreversible Add `migrations/0003_rating_x100.sql`: add `rating_x100` with CHECK 0..1000, back-fill `rating_x2 * 100`, drop `rating_x2`
- [ ] 1.3 Check on the bundled SQLite that dropping `rating_x2` works with its own column CHECK; if not, rebuild `entries` in the same migration instead
- [ ] 1.4 ⚠ irreversible Add `migrations/0004_collection_position.sql`: add `position`, back-fill with `ROW_NUMBER()` by `added_at, rowid`, add the index
- [ ] 1.5 Add `ratingFromX100` / `ratingToX100` (round, range 0..10, reject more than two decimals and non-finite) and remove the x2 helpers; update `insertEntryRow` in `testing.ts` for the new column
- [ ] 1.6 Schema test: a database holding 4.5 stars (`rating_x2` 9) reads 9 after migration, a 0.5-star row reads 1, null stays null

## 2. Rating 0 to 10

> unit: depends=1 · files=src/lib/server/tracking.ts, src/lib/server/tracking.test.ts, src/lib/server/rows.ts, src/lib/server/rows.test.ts, src/lib/server/entries-list.test.ts, src/lib/entries/query.ts, src/lib/entries/query.test.ts, src/lib/ui/StarRating.svelte, src/lib/entries/FilterBar.svelte, src/lib/entries/EntryCard.svelte

- [ ] 2.1 Write the failing tests "Scenario: Rating accepts 0 to 10 with two decimals", "Scenario: Clearing keeps 0 distinct from unrated", "Scenario: Minimum rating uses the 0 to 10 scale" and the round-trip with `minRating: 8.75`
- [ ] 2.2 `setRating` validates 0..10 with two decimals, message "Rating must be between 0 and 10 with up to two decimals"; `rows.ts` reads and writes `rating_x100`; `listEntries` min-rating and rating sort use the new column
- [ ] 2.3 `fromSearchParams` accepts `rating` 0..10 with up to two decimals and drops the rest
- [ ] 2.4 Adapter: `StarRating` shows value / 2 (rounded to half steps for display) and posts stars x 2; FilterBar minimum-rating options send stars x 2; card name reads `<stars> of 5`
- [ ] 2.5 Update the e2e rating scenarios named in the spec to the converted values (rating, cards, list-filters, detail, journey)

## 3. Combined brands-and-shops list

> unit: depends=2 · files=src/lib/entries/config.ts, src/lib/entries/config.test.ts, src/lib/entries/query.ts, src/lib/entries/query.test.ts, src/routes/(app)/[domain]/[list]/+page.server.ts, src/routes/(app)/add/[type]/+page.server.ts, src/lib/entries/FilterBar.svelte, src/lib/server/entries-list.test.ts

- [ ] 3.1 Write the failing tests "Scenario: Combined brands-and-shops query spans both stored types", "Scenario: Changing the kind keeps the entry in the combined list", "Scenario: Retired brands list redirects", "Scenario: Retired shops list redirects" and "Scenario: Both add routes open the combined form"
- [ ] 3.2 Replace the Brands and Shops lists in `LISTS.fashion` with `brands-shops` / "Brands & shops"; map stored type `site` to the combined slug wherever a list slug is derived from a type (Cancel, delete navigation, domain shelves)
- [ ] 3.3 The kind filter applies on the combined list; `fromSearchParams` accepts `kind` for it
- [ ] 3.4 `[list]` load: 308 redirect from `brands` (adds `kind=brand`) and `shops` (adds nothing), keeping other query values
- [ ] 3.5 `/add/brand` and `/add/site` load the same form with Kind preselected brand / shop
- [ ] 3.6 Update e2e: domain-pages sub-type tabs and Add menu, list-filters shops-by-kind, lists

## 4. Collection order

> unit: depends=1 · files=src/lib/server/collections.ts, src/lib/server/collections.test.ts, src/routes/(app)/collections/[id]/+page.server.ts, src/lib/server/home.ts, src/lib/server/home.test.ts

- [ ] 4.1 Write the failing tests "Scenario: New entry goes to the end", "Scenario: Removing keeps the order of the rest", "Scenario: Reorder sets the given order", "Scenario: Reorder with a wrong id set is rejected", "Scenario: Reorder action saves the order" and the updated collage scenario
- [ ] 4.2 `addToCollection` appends with the next `position`; `getCollection`, the collage and the home collections query order by `position`
- [ ] 4.3 `reorderCollection` validates the id set and rewrites positions in one transaction; wire the `reorder` form action (400 failure on invalid ids)

## 5. Initial status on create

> unit: depends=3 · files=src/lib/server/entries.ts, src/lib/server/entries.test.ts, src/lib/types.ts, src/lib/entries/save.ts, src/lib/entries/save.test.ts, src/routes/(app)/add/[type]/+page.server.ts

- [ ] 5.1 Write the failing tests "Scenario: Create a media entry with an initial status", "Scenario: Invalid initial status is rejected", "Scenario: Valid status prefills the form" and "Scenario: Invalid status is dropped"
- [ ] 5.2 `EntryInput.status`; `createEntry` validates like `setStatus`, stores it and writes the first status event for media other than none; the form-data parser reads an optional `status`
- [ ] 5.3 `/add/[type]` load returns `initialStatus` from a valid `status` query value and drops invalid ones

## 6. HEIC removed

> unit: depends=1 · files=src/lib/entries/imageFormats.ts, src/lib/entries/imageFormats.test.ts, src/lib/entries/ImageField.svelte, src/lib/server/images.ts, src/lib/server/images.test.ts, fixtures/heic/sample.heic

- [ ] 6.1 Write the failing tests "Scenario: A .heic file is refused in the browser" and "Scenario: HEIC is rejected by the server" (add a small HEIC fixture)
- [ ] 6.2 Move the MIME/extension check into `imageFormats.ts` without `image/heic` and `.heic`; `ImageField.svelte` imports it
- [ ] 6.3 `downscale` rejects `compression === 'hevc'` with `ImageError('not-image')`; AVIF files still pass (existing "Each listed format is accepted" scenario stays green)

## 7. Proof and docs sync

> unit: depends=2,3,4,5,6 · files=e2e/*.test.ts, docs/functional-contract.md, README.md

- [ ] 7.1 `npm run proof` green, then `npm run proof:full` green (background job, run once at a time)
- [ ] 7.2 Start the new build on a copy of the real database file and open a rated album, a collection and `/fashion/shops` once
- [ ] 7.3 Mark the server/data rows of the contract's Gate-1 decisions table as done; README mentions the combined list, the 0..10 rating and no HEIC where it listed the old behavior
- [ ] 7.4 `graphify update .` and `openspec validate gate-1-decisions --strict`
