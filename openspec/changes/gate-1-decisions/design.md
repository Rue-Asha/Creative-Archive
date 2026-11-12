## Context

SQLite via `node:sqlite`; migrations are numbered `.sql` files applied in name order, each in its own transaction and recorded in `schema_migrations` (harness spec). Current state found in the repo: `entries.rating_x2 INTEGER CHECK (1..10)` (stars x 2), `collection_entries(collection_id, entry_id, added_at)` ordered by `added_at, rowid`, brand and site are two stored types with a `kind` column (`brand` -> type brand, `shop`/`site` -> type site), lists are `LISTS[domain]` entries (slug, label, query) and `typeBySlug` maps one slug to one type, HEIC is allowed by an extension/MIME check in `ImageField.svelte` (the server only checks sharp's format, which reports HEIC as `heif`).

## Decisions

**Rating conversion.** The old stored integer already equals the new score: `rating_x2` 9 (4.5 stars) is 9 out of 10. So the migration is arithmetic with no loss: `rating_x100 = rating_x2 * 100`. Migration `0003_rating_x100.sql`: `ALTER TABLE entries ADD COLUMN rating_x100 INTEGER CHECK (rating_x100 BETWEEN 0 AND 1000)`, `UPDATE entries SET rating_x100 = rating_x2 * 100 WHERE rating_x2 IS NOT NULL`, `ALTER TABLE entries DROP COLUMN rating_x2` (allowed because the only constraint on it is its own column CHECK; verify against the bundled SQLite version in the migration test; fallback is a table rebuild). Storing hundredths keeps equality and ordering exact. `ratingFromX2` / `ratingToX2` become `ratingFromX100` / `ratingToX100`; `toX100` rounds `value * 100` and rejects when the rounding error exceeds 1e-6 (so 8.755 fails, 0.1+0.2 passes as 0.3), range 0..10 inclusive, finite only. 0 is allowed and distinct from null (the old scale had no 0). The migration is one-way (`irreversible`); the old column's information is fully contained in the new one, so a manual rollback is `rating_x2 = rating_x100 / 100` for values on whole numbers only, anything finer is lost.

**List merge.** Smaller design chosen: keep the two stored types, build a combined list. `LISTS.fashion` gets `{ slug: 'brands-shops', label: 'Brands & shops', query: { types: ['brand','site'] } }` replacing the two lists; `listEntries` already filters by `kind`, so the kind filter works across both types. `typeBySlug` returns a list's first type, which stays correct for the add and Cancel targets (brand), and a new helper maps type `site` to the combined slug for navigation after delete/cancel. `/fashion/brands` and `/fashion/shops` redirect in the `[list]` load with `redirect(308, ...)`: other query values are kept; `brands` appends `kind=brand`, `shops` appends nothing because that list held both shops and sites and the Kind filter is single-valued. `/add/brand` and `/add/site` stay valid and both show the form (Kind preselected brand or shop, matching `resolveType`'s existing default). What the bigger build (one stored type, table rebuild) would buy: simpler queries and no `resolveType`; it costs a risky rebuild of `entries` with foreign keys, not justified for a list merge.

**Collection order.** Migration `0004_collection_position.sql`: `ALTER TABLE collection_entries ADD COLUMN position INTEGER NOT NULL DEFAULT 0`, then back-fill `position = row index` per collection ordered by `added_at, rowid` (window function `ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY added_at, rowid)`, 1-based), then `CREATE INDEX collection_entries_position ON collection_entries(collection_id, position)`. `addToCollection` inserts with `position = COALESCE(MAX(position),0)+1`; removing leaves gaps (order unchanged, no renumbering needed). `reorderCollection(collectionId, entryIds)` validates the id set equals the members, then rewrites `position = index+1` in one transaction. `getCollection` and the collage query order by `position`. The collection page gets a `reorder` form action with `ids` (comma separated); no UI.

**Initial status on create.** `EntryInput` gets an optional `status`. `createEntry` validates it with the same rule as `setStatus` (`Invalid status for <type>`), stores it, and inserts a `status_events` row when a media status other than `none` is given (pieces keep no history). The add load validates a `status` query value against the type and returns it as `initialStatus`; the form wiring is UI. Wardrobe's Add link is UI (it will use `/add/piece?status=owned`).

**HEIC.** Client rule moves out of `ImageField.svelte` into `src/lib/entries/imageFormats.ts` (testable without sharp), dropping `image/heic` and `.heic`. Server: sharp reports HEIC as format `heif`, so `downscale` additionally rejects `compression === 'hevc'` (AV1-in-HEIF = AVIF files are unaffected). A tiny HEIC fixture is needed since sharp cannot encode HEVC; if the prebuilt sharp cannot even read HEVC metadata the file already fails and the test only pins that it throws `ImageError('not-image')`.

**Adapters for the current UI** (deleted by the redesign): `StarRating` shows `rating / 2` and posts `stars * 2`; card accessible name becomes `<stars> of 5` from the converted value; FilterBar minimum-rating options send `stars * 2`; list `rating` query accepts 0..10. e2e tests that name a star value are updated to the converted numbers.

## Contracts

- `ratingFromX100(x100: number | null): number | null` and `ratingToX100(rating: number | null): number | null` in `src/lib/entries/derive.ts`; `Entry.rating` stays a `number | null` but on the 0..10 scale.
- `entries.rating_x100 INTEGER CHECK (rating_x100 BETWEEN 0 AND 1000)` replaces `rating_x2`.
- `collection_entries.position INTEGER NOT NULL`; `reorderCollection(collectionId: Id, entryIds: Id[]): void`; form action `reorder` on `/collections/[id]`.
- `EntryInput.status?: string`; load result `initialStatus?: string` on `/add/[type]`.
- `LISTS.fashion` slug `brands-shops`; redirects from `brands` and `shops`.
- `isAcceptedImageFile(file: { type: string; name: string }): boolean` in `src/lib/entries/imageFormats.ts`.

## Risks / Trade-offs

- `DROP COLUMN` on a column with its own CHECK: verify early (task 1.3); fallback is rebuilding `entries`.
- Old bookmarked `rating=` values change meaning (single user; accepted).
- Production data: back up the DB file before first start; both migrations are one-way.
- The adapter keeps the star control until the redesign; a half-star value of 0.1/10 would display as 0.05 stars. Adapter rounds to the nearest half star for display only.
