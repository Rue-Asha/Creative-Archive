# collections Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Collection store
A collection SHALL have a required name and an optional description and hold any entries of mixed types in the order
they were added. Adding an entry already in it SHALL change nothing; removing an entry or deleting the collection
SHALL keep the entries. Each collection SHALL report its count and a collage of the images of its first three entries
that have one.

#### Scenario: Collection requires a name
- **WHEN** `createCollection` gets "  "
- **THEN** it throws a ValidationError with `name: 'Name is required'`
- **proof:** unit

#### Scenario: Same entry added twice is kept once
- **WHEN** `addToCollection` adds the same album twice
- **THEN** the collection's count is 1
- **proof:** unit

#### Scenario: Collage uses the first three images in added order
- **WHEN** a collection gets, in order, an album without image and four entries with images
- **THEN** its collage holds the images of the 2nd, 3rd and 4th added entries and its count is 5
- **proof:** unit

#### Scenario: Deleting a collection keeps its entries
- **WHEN** `deleteCollection` deletes a collection with two entries
- **THEN** both entries still exist
- **proof:** unit

#### Scenario: Rename a collection
- **WHEN** `renameCollection` sets name "Autumn" and a description
- **THEN** `getCollection` returns the new name and description
- **proof:** unit

### Requirement: Collections pages and the add popover
`/collections` SHALL list every collection with its collage (a placeholder collage when empty) and count, and create
new ones. `/collections/[id]` SHALL show the name, description and the entries as mixed cards in added order, and
allow rename, removing an entry and deleting the collection after a confirm. Every entry detail page SHALL offer "Add
to collection": a popover listing all collections with a mark on those holding the entry, toggling membership, and
creating a new collection that the entry joins at once.

#### Scenario: Create a collection from the index
- **WHEN** "New collection" is used on `/collections` with name "Autumn"
- **THEN** "Autumn" appears in the index with count 0 and a placeholder collage
- **proof:** e2e

#### Scenario: Add an entry from its detail page
- **WHEN** "Add to collection" is opened on an album's detail page and the seeded collection "Moodboard" chosen
- **THEN** "Moodboard" shows a mark in the popover, and `/collections/<id>` lists the album
- **proof:** e2e

#### Scenario: Create a collection from the popover
- **WHEN** "New collection" in the popover gets "Late Night" and is confirmed
- **THEN** the collection exists, holds the entry and shows marked in the popover
- **proof:** e2e

#### Scenario: Adding an entry twice from the popover keeps one
- **WHEN** a collection that already holds the entry is shown marked and the page is reloaded and the popover reopened
- **THEN** the collection is still marked and its count is unchanged
- **proof:** e2e

#### Scenario: Failed save in the popover shows a toast and reverts
- **WHEN** the collect save for "Moodboard" fails in an entry's popover and then "Autumn" is chosen, then the page is reloaded
- **THEN** the toast "Couldn't save — try again" shows, "Moodboard" returns to unmarked, and after the reload "Autumn" is marked and "Moodboard" is not
- **proof:** e2e

#### Scenario: Collection page shows mixed cards
- **WHEN** a collection holding an album, a manga and a piece in that order is opened
- **THEN** three cards show in added order, each with its own type chip
- **proof:** e2e

#### Scenario: Index shows collage and count
- **WHEN** `/collections` is opened with a collection of four entries with images
- **THEN** its card shows a collage of three images and the count 4
- **proof:** e2e

#### Scenario: Remove an entry from a collection
- **WHEN** "Remove" is used on a card on the collection page
- **THEN** the card disappears, the count drops by one and the entry still exists
- **proof:** e2e

#### Scenario: Rename a collection on its page
- **WHEN** the collection's name is edited to "Archive Picks" and saved
- **THEN** the page and the index show "Archive Picks"
- **proof:** e2e

#### Scenario: Deleting a collection asks first
- **WHEN** "Delete collection" is chosen and the confirm cancelled, then chosen again and accepted
- **THEN** after cancel the collection stays; after accept the browser is on `/collections`, the collection is gone and its entries still exist
- **proof:** e2e

