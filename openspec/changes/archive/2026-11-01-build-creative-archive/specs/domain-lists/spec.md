## ADDED Requirements

### Requirement: Per-type list queries
`listEntries` SHALL return the entries of the given types filtered by status (media and pieces), kind (shops), tag
and minimum rating (media), sorted by added (newest first, the default), rating (highest first, unrated last) or
title (Unicode-aware, case- and accent-insensitive base order).

#### Scenario: List query filters by status, kind, tag and minimum rating
- **WHEN** `listEntries` is called on seeded albums, shops and pieces with `status: 'done'`, with `kind: 'site'`, with a tag id and with `minRating: 4`
- **THEN** each returns exactly the matching entries of the requested types
- **proof:** unit

#### Scenario: List query sorts by added, rating and title
- **WHEN** albums "Zeta" (rated 3, added first), "Ästhetik" (unrated, added second) and "alpha" (rated 5, added last) are listed with each sort
- **THEN** added gives alpha, Ästhetik, Zeta; rating gives alpha, Zeta, Ästhetik; title gives alpha, Ästhetik, Zeta
- **proof:** unit

### Requirement: Domain list pages
Each type SHALL have a list at `/[domain]/[slug]` (Wardrobe at `/fashion/wardrobe` lists pieces with status owned)
showing cards in the domain's world, with filters status (media), kind (shops), status (pieces), tag and minimum
rating (media), and sort by added, rating (media) and title. Filter and sort state SHALL live in the URL query, so
reload and back restore it. Media lists SHALL also offer a shelves view grouped by status. With no entries the list
SHALL show an empty state with "Add"; with filters that match nothing it SHALL show "Nothing matches" and "Reset
filters".

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
- **WHEN** minimum rating 4 is chosen on `/animanga/anime`
- **THEN** only anime rated 4 or higher show
- **proof:** e2e

#### Scenario: Filter shops by kind
- **WHEN** kind "Site" is chosen on `/fashion/shops`
- **THEN** only entries with kind site show
- **proof:** e2e

#### Scenario: Filter pieces by status
- **WHEN** status "Wishlist" is chosen on `/fashion/pieces`
- **THEN** only wishlist pieces show
- **proof:** e2e

#### Scenario: Wardrobe lists owned pieces
- **WHEN** an owned, a wishlist and a gone piece are seeded and `/fashion/wardrobe` is opened
- **THEN** only the owned piece shows
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
- **WHEN** the shelves view is chosen on `/animanga/manga` with manga in want, progress and done
- **THEN** shelves "Reading", "Want to read" and "Read" show those manga, and statuses without entries have no shelf
- **proof:** e2e

#### Scenario: Empty list offers Add
- **WHEN** `/fashion/looks` is opened with no looks
- **THEN** an empty state with an "Add" link to `/add/look` shows
- **proof:** e2e

#### Scenario: Filters matching nothing offer reset
- **WHEN** minimum rating 5 is chosen on a list where nothing is rated 5
- **THEN** "Nothing matches" shows, and "Reset filters" restores the full list and clears the URL query
- **proof:** e2e

#### Scenario: Unknown list answers 404
- **WHEN** `/music/podcasts` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: List query round-trips through the URL
- **WHEN** `toSearchParams` and `fromSearchParams` convert `{ status: 'done', tag: 3, minRating: 3.5, sort: 'title' }` and an empty query
- **THEN** both round-trip unchanged, the empty query gives an empty search string, and invalid values are dropped
- **proof:** unit
