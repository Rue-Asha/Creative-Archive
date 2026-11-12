## Why

Rue's gate-1 review of `docs/functional-contract.md` settled eight open questions before the full UI/UX redesign. Four of them change what the server stores, validates or routes (ratings, brands/shops, collection order, initial status, HEIC). Doing these first means the redesign starts on the final data model instead of changing storage mid-redesign.

## What Changes

- Rating becomes a number from 0 to 10 with up to two decimals. Stored as whole hundredths; existing star ratings migrate by doubling (`rating_x2` value 1..10 becomes the same number out of 10, i.e. x100 hundredths). Artists keep status and rating.
- Brands and Shops/Sites become one combined list `/fashion/brands-shops`, filtered by Kind. `/fashion/brands` (adds `kind=brand`) and `/fashion/shops` (no kind) redirect with 308, keeping other query values. Changing Kind no longer moves an entry between lists.
- Collection entries get an explicit order (new column, back-filled from added order), `addToCollection` appends, a new `reorderCollection` and a `reorder` form action set it.
- The create path accepts an initial status for media (writes the first status event) and the add route accepts a `status` prefill (used for Owned from Wardrobe).
- HEIC (`image/heic`, `.heic`) is no longer accepted by browser or server validation; the six other formats stay.
- **BREAKING** for stored data and URLs: rating column replaced, old list URLs redirect, `rating=` list query values now mean the 0..10 scale (an old bookmark `rating=3` now means 3/10, not 3 stars).

Decided but not code in this change: artists keep status and rating (contract-only), SvelteKit's default error page stays (contract-only), collection descriptions on `/collections` (UI).

**UI is not built in this change.** Every affordance (initial-status field, Wardrobe Add link, a 0..10 rating control, the Kind filter wording, a reorder control, descriptions on the index, the merged Add menu item) comes with the redesign. The current UI only gets a thin adapter so it keeps working until then: the star control reads value/2 and writes stars x 2; the fashion tabs show the combined list; filter and Add wiring follow the renamed list. These shims are removed by the redesign.

## Capabilities

### New Capabilities
<!-- none: every behavior lands in an existing capability -->

### Modified Capabilities
- `entries`: create accepts an initial status; brand and shop kinds form one combined type whose Kind does not move it between lists; the add route prefills a valid `status` (ADDED requirement).
- `tracking`: Rating is 0..10 with two decimals.
- `domain-lists`: combined brands-and-shops list, kind filter on it, 0..10 minimum rating, redirects for the retired lists.
- `domain-pages`: Fashion sub-types and Add menu show the combined type.
- `collections`: entries keep a manual order; reorder operation (ADDED requirement).
- `images`: HEIC is rejected.

## Impact

- Code: `migrations/` (two new files), `src/lib/server/{tracking,rows,entries,collections,images}.ts`, `src/lib/entries/{derive,config,query,save,ImageField.svelte}`, route loads under `src/routes/(app)/{[domain]/[list],add/[type],collections/[id]}`, adapter edits in `StarRating.svelte` and FilterBar, tests next to them plus affected e2e files.
- Data: one-way migrations on the production SQLite file; take a copy of the DB file before the first start on the new build.
- Docs: `docs/functional-contract.md`, `PRODUCT.md` (already updated, uncommitted on this branch).

## Appetite

One to two evenings of focused work; exceeding that means renegotiating scope (most likely cost: the e2e adaptation for the merged list).

## Non-Goals

- Any new UI: no rating control out of 10, no initial-status field, no reorder control, no Wardrobe Add change, no descriptions on `/collections`, no custom error page.
- Merging the stored entry types `brand` and `site` into one (a table rebuild); the merge is at list/route level only.
- A multi-select Kind filter (so `/fashion/shops` redirects without a kind rather than to "shop or site").
- Converting old bookmarked `rating=` list URLs.
- Changing how HEIF (non-HEIC) or AVIF are handled.

## Done criteria

- [ ] `npm run proof` is green and `npm run proof:full` is green with the adapter in place.
- [ ] A database created on the previous build opens on the new build: a 4.5-star album reads 9 out of 10, collection order is unchanged.
- [ ] `/fashion/brands` and `/fashion/shops` answer 308 to `/fashion/brands-shops`; the combined list shows brands, shops and sites and filters by `kind`.
- [ ] `setRating` accepts 8.75 and rejects 8.755 and 10.01.
- [ ] `createEntry` with a media status stores a status event; `/add/piece?status=owned` carries Owned.
- [ ] A `.heic` upload is refused in the browser and on the server.
- [ ] `openspec validate gate-1-decisions --strict` passes.
