## MODIFIED Requirements

### Requirement: Collection store
A collection SHALL have a required name and an optional description and hold any entries of mixed types in a manual order: a newly added entry goes to the end, and the order can be
set by hand. Existing collections keep the order in which their entries were added. Adding an entry already in it SHALL change nothing; removing an entry or deleting the collection
SHALL keep the entries. Each collection SHALL report its count and a collage of the images of its first three entries
in that order that have one.

#### Scenario: Collection requires a name
- **WHEN** `createCollection` gets "  "
- **THEN** it throws a ValidationError with `name: 'Name is required'`
- **proof:** unit

#### Scenario: Same entry added twice is kept once
- **WHEN** `addToCollection` adds the same album twice
- **THEN** the collection's count is 1
- **proof:** unit

#### Scenario: Collage uses the first three images in collection order
- **WHEN** a collection gets, in order, an album without image and four entries with images
- **THEN** its collage holds the images of the 2nd, 3rd and 4th entries and its count is 5

#### Scenario: Reordering changes the order and the collage
- **WHEN** `reorderCollection` puts the last of those entries first
- **THEN** `getCollection` lists it first, the collage starts with its image, and the count is unchanged
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
new ones. `/collections/[id]` SHALL show the name, description and the entries as mixed cards in the collection's order, and
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
- **THEN** three cards show in the collection's order, each with its own type chip
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

## ADDED Requirements

### Requirement: Collection order
Each collection SHALL keep an explicit order of its entries. `addToCollection` SHALL append at the end; removing an
entry SHALL keep the relative order of the rest. `reorderCollection(collectionId, entryIds)` SHALL set the order to the
given list and SHALL reject, changing nothing, a list that is not exactly the collection's current members (missing,
extra or duplicated ids). The page SHALL expose a `reorder` form action taking the ordered ids. A migration SHALL give
existing collections the order they had (added time, then insertion order).

#### Scenario: New entry goes to the end
- **WHEN** `addToCollection` adds entry C to a collection ordered A, B
- **THEN** `getCollection` lists A, B, C
- **proof:** unit

#### Scenario: Removing keeps the order of the rest
- **WHEN** B is removed from a collection ordered A, B, C and D is added
- **THEN** `getCollection` lists A, C, D
- **proof:** unit

#### Scenario: Reorder sets the given order
- **WHEN** `reorderCollection` gets [C, A, B] for a collection ordered A, B, C
- **THEN** `getCollection` lists C, A, B and the order survives reopening the database
- **proof:** unit

#### Scenario: Reorder with a wrong id set is rejected
- **WHEN** `reorderCollection` gets [A, B] (missing C), [A, B, C, X] (foreign X) and [A, A, B]
- **THEN** each throws a ValidationError and the order stays A, B, C
- **proof:** unit

#### Scenario: Reorder action saves the order
- **WHEN** the collection page's `reorder` action gets ids `3,1,2` as form data for a collection holding 1, 2 and 3
- **THEN** the collection lists 3, 1, 2 and an invalid id list answers a 400 failure
- **proof:** unit

#### Scenario: Migration preserves the existing order
- **WHEN** the order migration runs on a database whose collection holds entries added at t1 < t2 < t3, inserted out of order
- **THEN** after it `getCollection` lists them by added time
- **proof:** unit
