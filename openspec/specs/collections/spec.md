# collections Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
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
- **proof:** unit

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
`/collections` SHALL list every collection on a solid card with its collage (a placeholder collage of initials plates when it holds no images) and count, and create new ones ("New collection"). `/collections/[id]` SHALL show the name, description and the entries as ordered rows (cover thumbnail or initials plate, title, type and maker) in the collection's order, and allow rename, removing an entry and deleting the collection after a confirm. Every entry detail page SHALL offer "Add to collection": a menu listing all collections with a check on those holding the entry, each row toggling membership at once, and "New collection", which asks for a name in a dialog and adds the entry to the new collection at once.

#### Scenario: Create a collection from the index
- **WHEN** "New collection" is used on `/collections` with name "Autumn"
- **THEN** "Autumn" appears in the index with count 0 and a placeholder collage
- **proof:** e2e

#### Scenario: Add an entry from its detail page
- **WHEN** "Add to collection" is opened on an album's detail page and the seeded collection "Moodboard" chosen
- **THEN** "Moodboard" shows checked in the menu, and `/collections/<id>` lists the album
- **proof:** e2e

#### Scenario: Create a collection from the popover
- **WHEN** "New collection" in the "Add to collection" menu gets "Late Night" and is confirmed
- **THEN** the collection exists, holds the entry and shows checked in the menu
- **proof:** e2e

#### Scenario: Adding an entry twice from the popover keeps one
- **WHEN** a collection that already holds the entry is shown checked and the page is reloaded and the menu reopened
- **THEN** the collection is still checked and its count is unchanged
- **proof:** e2e

#### Scenario: Failed save in the popover shows a toast and reverts
- **WHEN** the collect save for "Moodboard" fails in an entry's "Add to collection" menu and then "Autumn" is chosen, then the page is reloaded
- **THEN** the toast "Couldn't save — try again" shows, "Moodboard" returns to unchecked, and after the reload "Autumn" is checked and "Moodboard" is not
- **proof:** e2e

#### Scenario: Collection page lists mixed entries in order
- **WHEN** a collection holding an album, a manga and a piece in that order is opened
- **THEN** three rows show in the collection's order, each naming its own type
- **proof:** e2e

#### Scenario: Index shows collage and count
- **WHEN** `/collections` is opened with a collection of four entries with images
- **THEN** its card shows a collage of three images and the count 4
- **proof:** e2e

#### Scenario: Remove an entry from a collection
- **WHEN** "Remove <title>" is used on a row of the collection page (on the phone the row menu's "Remove")
- **THEN** the row disappears, the count drops by one and the entry still exists
- **proof:** e2e

#### Scenario: Rename a collection on its page
- **WHEN** the collection's name is edited to "Archive Picks" and saved
- **THEN** the page and the index show "Archive Picks"
- **proof:** e2e

#### Scenario: Deleting a collection asks first
- **WHEN** "Delete collection" is chosen and the confirm cancelled, then chosen again and accepted
- **THEN** after cancel the collection stays; after accept the browser is on `/collections`, the collection is gone and its entries still exist
- **proof:** e2e

### Requirement: Collection order
Each collection SHALL keep an explicit order of its entries. `addToCollection` SHALL append at the end; removing an entry SHALL keep the relative order of the rest. `reorderCollection(collectionId, entryIds)` SHALL set the order to the given list and SHALL reject, changing nothing, a list that is not exactly the collection's current members (missing, extra or duplicated ids). `removeManyFromCollection(collectionId, entryIds)` SHALL remove all given members in one transaction or none (any id that isn't a member rejects the whole call), keeping the relative order of the rest. The page SHALL expose a `reorder` form action taking the ordered ids, answering 400 for a malformed list (non-numeric or duplicate ids) and 409 for a stale one — a well-formed list that no longer matches the members (Gate 1, A2), and a `removeMany` form action taking ids. A migration SHALL give existing collections the order they had (added time, then insertion order).

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
- **THEN** the collection lists 3, 1, 2
- **proof:** unit

#### Scenario: Reorder action tells a stale order from a malformed one
- **WHEN** the `reorder` action gets `1,1,2`, then `1,x,2`, then `1,2` for a collection holding 1, 2 and 3
- **THEN** the first two answer a 400 failure, the third a 409 failure, and the order is unchanged
- **proof:** unit

#### Scenario: Remove several keeps the rest in order
- **WHEN** `removeManyFromCollection` gets [B, D] for a collection ordered A, B, C, D, E, then [A, X] with a non-member X
- **THEN** after the first the collection lists A, C, E and the entries B and D still exist; the second throws a ValidationError and A stays
- **proof:** unit

#### Scenario: Remove-many action removes the given entries
- **WHEN** the `removeMany` action gets ids `2,3` for a collection holding 1, 2 and 3, then ids `` (empty)
- **THEN** the first answers `removed` 2 and the collection holds 1, the second removes nothing
- **proof:** unit

#### Scenario: Migration preserves the existing order
- **WHEN** the order migration runs on a database whose collection holds entries added at t1 < t2 < t3, inserted out of order
- **THEN** after it `getCollection` lists them by added time
- **proof:** unit

#### Scenario: A migrated database matches a fresh one at head
- **WHEN** a database migrated step by step from 0000 with data in it and a fresh database are both at the latest migration
- **THEN** their schemas (tables, indexes, constraints) are identical and both pass the foreign key and integrity checks
- **proof:** unit

### Requirement: Collections index with descriptions
`/collections` SHALL list every collection, newest first, with its name (link to its page), its description when it has one (shortened when long), its count and its collage (the images of its first three entries in the collection's order, or a placeholder without images), and offer "New collection" with Name and Description. With no collections it SHALL show "No collections yet" and keep "New collection".

#### Scenario: Index shows descriptions
- **WHEN** a collection "Late Night" with the description "Albums for after midnight" and one without a description are seeded and `/collections` is opened
- **THEN** "Late Night" shows its description, the other shows none, and each shows its count and links to its page
- **proof:** e2e

#### Scenario: Long description and no images stay inside the card
- **WHEN** a collection with a 600-character description and entries without images is seeded and `/collections` is opened at 390 and 1280 px
- **THEN** the description is shortened inside its card, the collage shows the placeholder, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: No collections yet
- **WHEN** `/collections` is opened with no collections and "New collection" is used with the name "Summer" and the description "Light reads"
- **THEN** "No collections yet" shows first, and after Create the collection "Summer" shows with its description and count 0
- **proof:** e2e

### Requirement: Reorder on the collection page
`/collections/[id]` SHALL let Rue move an entry to another position by drag on a fine pointer (the drag handle SHALL show only under `(pointer: fine)`) and by "Move up" / "Move down" for keyboard and touch: in the desktop posture as buttons on every entry (named "Move <title> up" / "Move <title> down"), in the phone posture as items of a per-row "…" menu (named "Actions for <title>") holding Move up, Move down and Remove; the first entry has no Move up, the last no Move down. Each move SHALL save at once through the `reorder` action and survive a reload. A failed save SHALL restore the saved order and show "Couldn't save — try again"; a 409 SHALL reload the collection and show a polite toast "This collection changed in another tab — reloaded". A save that fails or answers 409 SHALL drop the saves queued behind it (each was built on the order it assumed), so one failure shows one toast. Every move SHALL be announced as a polite status message ("<title> moved to <n> of <total>"). Under reduced motion the move SHALL be instant. 100 entries SHALL stay usable. The page SHALL also offer "Rename" (secondary) and "Delete collection" (danger), with "Select" as the page's one dark pill.

#### Scenario: Drag reorders on the desktop
- **WHEN** at 1280×800 the third entry of a collection ordered A, B, C is dragged above the first, the save is awaited and the page reloaded
- **THEN** the collection reads C, A, B
- **proof:** e2e

#### Scenario: Move up and down reorder by keyboard and touch
- **WHEN** at 390×844 "Actions for B" → "Move down" is tapped in a collection ordered A, B, C, then at 1280×800 "Move B up" is activated with the keyboard
- **THEN** after the first the order is A, C, B, after the second A, B, C again, each surviving a reload, and focus stays on the moved entry's control
- **proof:** e2e

#### Scenario: Phone rows use a row menu and no drag handle
- **WHEN** a collection ordered A, B, C is opened at 390×844 (touch) and at 1280×800 (mouse)
- **THEN** on the phone each row has one "Actions for <title>" button whose menu offers Move up (not on A), Move down (not on C) and Remove, no Move buttons sit on the row and no drag handle shows; on the desktop each row has a drag handle and the Move buttons
- **proof:** e2e

#### Scenario: Select is the collection page's primary action
- **WHEN** a collection with entries is opened at 390×844 and 1280×800
- **THEN** "Select" is the page's only dark arrow pill, "Rename" is a secondary button and "Delete collection" uses the danger style and is not focused on load
- **proof:** e2e

#### Scenario: Failed reorder restores the order
- **WHEN** the `reorder` request is made to fail and "Move A down" is activated in a collection ordered A, B, C
- **THEN** the toast "Couldn't save — try again" shows and the page reads A, B, C again
- **proof:** e2e

#### Scenario: Changed elsewhere reloads politely
- **WHEN** an entry is added to the collection through the API after the page loaded and "Move A down" is then activated
- **THEN** the `reorder` request answers 409, a toast says "This collection changed in another tab — reloaded", and the page shows the current members including the new entry
- **proof:** e2e

#### Scenario: A move is announced
- **WHEN** at 1280×800 "Move B down" is activated in a collection ordered A, B, C
- **THEN** a polite live region reads "B moved to 3 of 3" and focus stays on the moved entry's control
- **proof:** e2e

#### Scenario: A failed removal drops the moves queued behind it
- **WHEN** at 1280×800 "Remove A" is activated with the `removeMany` request held and then made to fail, and "Move C up" is activated while it is held
- **THEN** no `reorder` request is sent, "Couldn't save — try again" is the only toast (no "This collection changed in another tab — reloaded"), and the page reads A, B, C again
- **proof:** e2e

#### Scenario: A hundred entries stay usable
- **WHEN** a collection with 100 entries is opened at 390 and 1280 px and the last entry's "Move up" is used
- **THEN** all 100 render, the move saves once, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Reduced motion moves instantly
- **WHEN** reduced motion is emulated and "Move B up" is activated
- **THEN** no element of the list changes `transform` over time and the new order shows at once
- **proof:** e2e

### Requirement: Select mode in a collection
A collection with entries SHALL offer "Select". In Select mode picking entries (tap, click, shift-click range on the desktop, keyboard) SHALL offer "Move to top", "Move to bottom", "Move before…" (choosing a target entry not in the selection applies the move at once, no confirm step) and "Remove from collection". Each action SHALL be one save (`reorder` with the full order, or `removeMany`), the moved set SHALL keep its relative order, and a toast SHALL name the count (gate 5: "N entries moved to the top", "N entries moved to the bottom", "N entries moved", "N entries removed from this collection", "1 entry" in the singular). Selecting every entry SHALL be possible; removing the last entries SHALL show the empty state. The toast SHALL show only once the save succeeded. Escape or "Done" SHALL leave Select mode; entering it SHALL move focus to the first entry's toggle and leaving it SHALL return focus to "Select".

#### Scenario: Move several to the top keeps their order
- **WHEN** in a collection ordered A, B, C, D, E the entries D and B are selected (in that click order) and "Move to top" is applied
- **THEN** exactly one `reorder` request is sent, the order is B, D, A, C, E after a reload, and the toast "2 entries moved to the top" shows
- **proof:** e2e

#### Scenario: A move's toast waits for its save
- **WHEN** B and D are selected in A, B, C, D, E and "Move to top" is applied while the `reorder` request answers 409
- **THEN** the toast "This collection changed in another tab — reloaded" shows and "2 entries moved to the top" never shows
- **proof:** e2e

#### Scenario: Select mode in a collection moves focus in and back out
- **WHEN** "Select" is activated with the keyboard in a collection ordered A, B, C, then Escape is pressed
- **THEN** after entering, focus is on A's toggle, and after leaving, focus is on "Select"
- **proof:** e2e

#### Scenario: Move several before another entry
- **WHEN** A and E are selected in A, B, C, D, E and "Move before…" → C is applied
- **THEN** the order is B, A, E, C, D after a reload, with one save
- **proof:** e2e

#### Scenario: Move to bottom with everything selected
- **WHEN** every entry of A, B, C is selected and "Move to bottom" is applied
- **THEN** the order stays A, B, C and nothing breaks
- **proof:** e2e

#### Scenario: Remove several from the collection
- **WHEN** B and C are selected in A, B, C and "Remove from collection" is applied, then A is selected and removed
- **THEN** one `removeMany` request per action is sent, the count drops to 1 and then to 0, the empty state "Nothing in here yet" shows, and the three entries still exist
- **proof:** e2e

#### Scenario: Move order is computed for any selection
- **WHEN** `moveSelection` gets the order [A, B, C, D, E] with the selection {B, D} and the targets top, bottom and before C, and with the selection {A, B, C, D, E} and top
- **THEN** it returns [B, D, A, C, E], [A, C, E, B, D], [A, B, D, C, E] and [A, B, C, D, E]
- **proof:** unit

