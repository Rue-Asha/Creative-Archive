# domain-lists Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Per-type list queries
`listEntries` SHALL return the entries of the given types filtered by status (media and pieces), kind (brands and shops), tag
and minimum rating (media, on the 0 to 10 scale), sorted by added (newest first, the default), rating (highest first, unrated last) or
title (Unicode-aware, case- and accent-insensitive base order).

#### Scenario: List query filters by status, kind, tag and minimum rating
- **WHEN** `listEntries` is called on seeded albums, shops and pieces with `status: 'done'`, with `kind: 'site'`, with a tag id and with `minRating: 8`
- **THEN** each returns exactly the matching entries of the requested types
- **proof:** unit

#### Scenario: Combined brands-and-shops query spans both stored types
- **WHEN** `listEntries` is called with the combined list query on a seeded brand, a shop and a site, and then with `kind: 'shop'`
- **THEN** the first returns all three and the second only the shop
- **proof:** unit

#### Scenario: Minimum rating uses the 0 to 10 scale
- **WHEN** `listEntries` is called with `minRating: 7.5` on albums rated 7, 7.5 and 9.25 and one unrated
- **THEN** the albums rated 7.5 and 9.25 are returned
- **proof:** unit

#### Scenario: List query sorts by added, rating and title
- **WHEN** albums "Zeta" (rated 6, added first), "Ästhetik" (unrated, added second) and "alpha" (rated 10, added last) are listed with each sort
- **THEN** added gives alpha, Ästhetik, Zeta; rating gives alpha, Zeta, Ästhetik; title gives alpha, Ästhetik, Zeta
- **proof:** unit

### Requirement: Domain list pages
Each type SHALL have a list at `/[domain]/[slug]` (Brands and shops share one list at `/fashion/brands-shops`; Wardrobe at `/fashion/wardrobe` lists pieces with status owned; Magazines at `/fashion/magazines`) showing its entries in the domain's world, with a toolbar named "Filters": status (media, labelled per domain; pieces: Wishlist, Owned, Gone), Kind (brands and shops: Brand, Shop, Site, with one "All" choice clearing status and kind), tag (only when an entry of the list has a tag), minimum rating (media: "Any rating", "9 and up", "8 and up", "7 and up", "6 and up", "5 and up"; the URL accepts any value from 0 to 10 with up to two decimals) and sort by Recently added, Rating (media) and Title. Media lists SHALL also offer a View choice (Grid, Shelves); Shelves SHALL group the entries by status in the order In progress, Want, Done, Dropped, No status, one shelf per status with entries. Filter, sort and view state SHALL live in the URL query, so reload and Back restore it. "Add" SHALL show only when the list has entries (Wardrobe → `/add/piece?status=owned`, Brands & shops → `/add/brand`). With no entries the list SHALL show an empty state with "Add" and no filters; with filters that match nothing it SHALL show "Nothing matches" and "Reset filters". Long titles in any script SHALL be shortened in the list without overflowing, and 500 entries SHALL stay usable without pagination.

#### Scenario: List shows entries of one type
- **WHEN** two albums and one song are seeded and `/music/albums` is opened
- **THEN** exactly the two album cards show, newest first
- **proof:** e2e

#### Scenario: Filter media by status
- **WHEN** the status filter "Listened" is chosen on `/music/albums`
- **THEN** only albums with status done show and the URL contains `status=done`
- **proof:** e2e

#### Scenario: Filter by tag
- **WHEN** the tag filter "Summer" is chosen on `/books/books`
- **THEN** only books tagged "Summer" show and the URL contains the tag
- **proof:** e2e

#### Scenario: Filter by minimum rating
- **WHEN** `/animanga/anime?rating=8` is opened with anime rated 7.5, 8 and 9.25
- **THEN** only the anime rated 8 and 9.25 show
- **proof:** e2e

#### Scenario: Minimum rating offers whole steps
- **WHEN** the Minimum rating control of `/music/albums` is opened and "8 and up" is chosen with albums rated 7.99, 8 and 9.5
- **THEN** its options read exactly "Any rating", "9 and up", "8 and up", "7 and up", "6 and up", "5 and up", the URL carries `rating=8`, and the albums rated 8 and 9.5 show
- **proof:** e2e

#### Scenario: Filter brands and shops by kind
- **WHEN** kind "Site" is chosen on `/fashion/brands-shops`
- **THEN** only entries with kind site show and the URL contains `kind=site`
- **proof:** e2e

#### Scenario: Filter pieces by status
- **WHEN** status "Wishlist" is chosen on `/fashion/pieces`
- **THEN** only wishlist pieces show
- **proof:** e2e

#### Scenario: Wardrobe lists owned pieces
- **WHEN** an owned, a wishlist and a gone piece are seeded and `/fashion/wardrobe` is opened
- **THEN** only the owned piece shows, there is no status filter, and "Add" links to `/add/piece?status=owned`
- **proof:** e2e

#### Scenario: Sort by title and rating in the list
- **WHEN** sort "Title" and then "Rating" is chosen on `/music/albums` with the three albums of the unit scenario
- **THEN** the cards follow the same orders as `listEntries`, and the URL carries `sort=`
- **proof:** e2e

#### Scenario: Filter state survives reload and back
- **WHEN** status and sort are chosen, the page reloaded, then another filter chosen and Back pressed
- **THEN** after reload the same filters and order show, and after Back the earlier filter set shows
- **proof:** e2e

#### Scenario: Shelves view groups media by status
- **WHEN** the shelves view is chosen on `/animanga/manga` with manga in want, progress, done and none
- **THEN** shelves "Reading", "Want to read", "Read" and "No status" show in that order, statuses without entries have no shelf, and the View choice "Shelves" is pressed
- **proof:** e2e

#### Scenario: Empty list offers Add
- **WHEN** `/fashion/looks` is opened with no looks
- **THEN** an empty state "No looks yet" with an "Add" link to `/add/look` shows and the "Filters" toolbar is absent
- **proof:** e2e

#### Scenario: Add shows only when the list has entries
- **WHEN** `/fashion/magazines` is opened with one magazine and `/fashion/brands-shops` with one shop
- **THEN** each shows one "Add" (to `/add/magazine` and `/add/brand`) outside the empty state
- **proof:** e2e

#### Scenario: Filters matching nothing offer reset
- **WHEN** minimum rating "9 and up" is chosen on a list where nothing is rated 9 or more
- **THEN** "Nothing matches" shows, and "Reset filters" restores the full list and clears the URL query
- **proof:** e2e

#### Scenario: Five hundred entries and long titles stay usable
- **WHEN** 500 albums are seeded, ten of them with 180-character titles in Latin, Japanese and Arabic script, and `/music/albums` is opened at 390 and 1280 px
- **THEN** all 500 cards render, every card title stays inside its card, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Retired brands list redirects
- **WHEN** `/fashion/brands?tag=3&sort=title` is requested
- **THEN** the response is a 308 to `/fashion/brands-shops?tag=3&sort=title&kind=brand`
- **proof:** e2e

#### Scenario: Retired shops list redirects
- **WHEN** `/fashion/shops?sort=title` is requested
- **THEN** the response is a 308 to `/fashion/brands-shops?sort=title` with no kind added
- **proof:** e2e

#### Scenario: Unknown list answers 404
- **WHEN** `/music/podcasts` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: List query round-trips through the URL
- **WHEN** `toSearchParams` and `fromSearchParams` convert `{ status: 'done', tag: 3, minRating: 8.75, sort: 'title' }` and an empty query
- **THEN** both round-trip unchanged, the empty query gives an empty search string, and invalid values are dropped
- **proof:** unit

### Requirement: Select mode in a list
A list with entries SHALL offer "Select". In Select mode a tap or click on an entry SHALL toggle it instead of opening it, a shift-click on the desktop SHALL select the range from the last toggled entry, and a selection bar SHALL show the count, the actions valid for the selection and "Done": in the desktop posture (from 1024 px, the posture switch) sticky above the list with every action, in the phone posture (below 1024 px, tablets included) docked at the bottom with the count, one main action ("Set status" when offered, else "Add tag") and a "More" menu holding the rest. "Set status" SHALL be offered only when every selected entry has the same status set (all media, or all pieces) and SHALL list that set's statuses; "Add tag" and "Remove tag" SHALL be offered for every type ("Remove tag" lists only tags present on the selection). With nothing selected the actions SHALL be disabled. An action SHALL send one request for the whole selection; on success the list SHALL show the new values and a toast SHALL name the count (gate 5: "Status set to <status> for N entries", "Tag added to N entries", "Tag removed from N entries", "1 entry" in the singular); on failure a toast SHALL name what failed ("Couldn't update N entries — try again") and every entry SHALL keep its stored value. Escape or "Done" SHALL leave Select mode and clear the selection. Following a link to another list SHALL leave Select mode too, and a filter that hides a picked entry SHALL drop that pick, so an action only ever reaches entries the grid shows. Entering Select mode SHALL move focus to the first entry's toggle and leaving it SHALL return focus to "Select"; in the phone posture a focused entry SHALL scroll clear of the docked bar, and a picked entry SHALL look different from a focused one beyond its check (a fill and an inner ring, while focus is the ring outside the edge). Every step SHALL work by keyboard.

#### Scenario: Selection toggles and ranges
- **WHEN** a selection over the ids [1, 2, 3, 4, 5] in display order toggles 2, then 4 with range, then 3 without range, then calls `clear()`
- **THEN** the selected ids are {2}, then {2, 3, 4}, then {2, 4}, then empty, and `count` follows
- **proof:** unit

#### Scenario: Set status on several entries
- **WHEN** on `/music/albums` with four albums "Select" is chosen, three albums are picked and "Set status" → "Listened" is applied
- **THEN** the three albums show "Listened" after a reload, the fourth is unchanged, and the toast "Status set to Listened for 3 entries" shows
- **proof:** e2e

#### Scenario: Add and remove a tag on several entries
- **WHEN** on `/books/books` three books are selected, "Add tag" with the new name "Summer" is applied, then two of them are selected and "Remove tag" → "Summer" is applied
- **THEN** after a reload exactly one of the three books carries "Summer", and the actions showed the toasts "Tag added to 3 entries" and "Tag removed from 2 entries"
- **proof:** e2e

#### Scenario: Shift-click selects a range on the desktop
- **WHEN** at 1280×800 in Select mode the second card is clicked and the fifth is shift-clicked
- **THEN** the selection bar reads 4 selected and cards two to five are marked selected (`aria-pressed="true"` or `aria-checked="true"`)
- **proof:** e2e

#### Scenario: Only valid actions are offered
- **WHEN** Select mode is entered on `/fashion/brands-shops` with a brand and a site selected, and on `/fashion/pieces` with two pieces selected
- **THEN** the first offers "Add tag" and "Remove tag" but no "Set status", the second offers "Set status" with exactly Wishlist, Owned and Gone
- **proof:** e2e

#### Scenario: Selection bar docks on the phone
- **WHEN** three albums are selected on `/music/albums` at 390×844, the page is scrolled, and "More" is opened; then the same at 1280×800
- **THEN** on the phone the bar stays at the viewport's bottom edge above the safe area with "3 selected", "Set status" and "More", whose menu offers "Add tag" and "Remove tag" and renders outside the frame (not clipped, fixed to the viewport); on the desktop the bar sticks above the list and shows "Set status", "Add tag" and "Remove tag" without "More"
- **proof:** e2e

#### Scenario: Nothing selected disables the actions
- **WHEN** Select mode is entered on a list and nothing is picked
- **THEN** the selection bar reads 0 selected and every action is disabled while "Done" is enabled
- **proof:** e2e

#### Scenario: Failed bulk action keeps every value
- **WHEN** three albums are selected and the `bulkStatus` request is answered with a 400 (routed to fail)
- **THEN** the toast "Couldn't update 3 entries — try again" shows, and after a reload all three keep their status
- **proof:** e2e

#### Scenario: Escape and Done leave Select mode by keyboard
- **WHEN** Select mode is entered with the keyboard, two entries are toggled with Space, then Escape is pressed; then the same with "Done"
- **THEN** each time the selection bar is gone, no entry is marked selected, and activating a card opens its entry again
- **proof:** e2e

#### Scenario: Select mode moves focus in and back out
- **WHEN** "Select" is activated with the keyboard on `/music/albums`, then Escape is pressed; then the same with "Done"
- **THEN** after entering, focus is on the first album's toggle, and after leaving, focus is on "Select"
- **proof:** e2e

#### Scenario: Another list leaves Select mode
- **WHEN** on `/music/albums` an album is picked in Select mode, the "Artists" sub-type link is followed and "Albums" is followed back
- **THEN** on both lists the selection bar is gone, "Select" is offered and no card is marked selected
- **proof:** e2e

#### Scenario: A filter drops the picks it hides
- **WHEN** in Select mode on `/music/albums` a listened and a wanted album are picked, the Status filter is set to "Listened" and then back to every status
- **THEN** with the filter the bar reads "1 selected", and after it the bar still reads "1 selected" with only the listened album marked selected
- **proof:** e2e

#### Scenario: Focused card clears the docked bar
- **WHEN** at 390×844 Select mode is entered on a list of twelve albums and Tab moves focus through the toggles
- **THEN** every focused toggle's card ends above the docked bar's top edge, and a picked card shows a fill and an inner ring while a focused card that is not picked has neither
- **proof:** e2e

### Requirement: Bulk list actions
The list page SHALL expose the form actions `bulkStatus` (ids, status) and `bulkTag` (ids, tag, op `add` | `remove`), backed by `bulkSetStatus` and `bulkTag` in `src/lib/server/bulk.ts`. Each SHALL apply to every given entry in one transaction or to none: an unknown id or a status that isn't valid for a given entry's type SHALL be rejected with a 400 and change nothing; an empty id list SHALL change nothing. A media status change SHALL store a dated status event per changed entry, as a single change does; entries already at the status SHALL be left as they are. Adding a tag SHALL reuse an existing tag with the same Unicode-aware key; removing one SHALL prune tags no entry uses.

#### Scenario: Bulk status sets every entry and records events
- **WHEN** `bulkSetStatus([a, b, c], 'done')` runs on three albums where c is already done
- **THEN** it returns 2, all three are done, and a and b each have one new `done` event while c has none
- **proof:** unit

#### Scenario: Unknown id changes nothing
- **WHEN** `bulkSetStatus([a, 999999], 'done')` and `bulkTag([a, 999999], 'Summer', 'add')` run
- **THEN** each throws a ValidationError naming 999999, and a keeps its status and tags
- **proof:** unit

#### Scenario: Invalid status for a type is rejected
- **WHEN** `bulkSetStatus([album, piece], 'owned')` runs
- **THEN** it throws a ValidationError for the album's type and neither entry changes
- **proof:** unit

#### Scenario: Empty id list is a no-op
- **WHEN** `bulkSetStatus([], 'done')` and `bulkTag([], 'Summer', 'add')` run
- **THEN** both return 0 and no row changes
- **proof:** unit

#### Scenario: Bulk tag reuses and prunes tags
- **WHEN** `bulkTag([a, b], 'summer', 'add')` runs while a tag "Summer" exists, then `bulkTag([a, b], 'Summer', 'remove')` runs while no other entry has it
- **THEN** after the first a and b carry the one tag "Summer" (no second tag), after the second the tag is gone from the tag list
- **proof:** unit

#### Scenario: Bulk actions answer the list page
- **WHEN** the list page's `bulkStatus` action gets ids `1,2` and status `done`, then ids `1,x`, and `bulkTag` gets ids `1,2`, tag `Summer`, op `add`
- **THEN** the first and third succeed with `updated` 2, the second answers a 400 failure and nothing changed
- **proof:** unit

