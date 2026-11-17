# home Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Home queries
The server SHALL provide the coverflow (the 20 most recently added entries of any type that have an image), the "In
progress" shelf (media entries with status in progress, most recently updated first), a "Recently added" shelf per
domain and the collections for the bento, omitting empty shelves.

#### Scenario: Coverflow takes the 20 newest entries with images
- **WHEN** 25 entries with images and 3 newer ones without are seeded
- **THEN** `coverflowEntries` returns 20 entries, newest first, all with images
- **proof:** unit

#### Scenario: In progress orders by last update
- **WHEN** three in-progress media entries are updated in the order B, C, A and a piece and a done album exist
- **THEN** `inProgress` returns A, C, B
- **proof:** unit

#### Scenario: Home shelves omit empty ones
- **WHEN** only books exist, none in progress
- **THEN** `homeShelves` returns exactly one shelf, "Recently added" for Books
- **proof:** unit

### Requirement: Home page
Home SHALL be the way in and show, in this order: one tile per domain (Music, Animanga, Books, Fashion, each linking to its domain page with its entry count and its world's hero photo or, without one, the colour field), the "In progress" shelf, "Recently added" (one card stacking one shelf per domain that has entries, each with the domain's 12 newest entries, its count and a "See all" link), and a "Collections" section with each collection's collage, name and count, the first collection that has images listed first, and a link "All collections". The Home head SHALL hold a labelled "Settings" chip (link to `/settings`) and, in the desktop posture only, the screen's dark "Add" arrow pill that opens the same type sheet as the phone's "+" (all types grouped by domain). Nothing in progress SHALL leave out the In progress section; no collections SHALL show a "New collection" prompt in the Collections section instead of collages; an empty archive SHALL show a welcome with "Add your first …" per domain and the "+" in place of the domain tiles, shelves and collections; an entry or tile without an image SHALL show the initials placeholder, never a broken image. Long titles SHALL be shortened in shelves and tiles without overflowing.

#### Scenario: Home shows the sections in order
- **WHEN** a music hero, an in-progress anime, two albums, a book and a collection with images are seeded and `/` is opened
- **THEN** the domain tiles Music, Animanga, Books and Fashion come first (each a link to its domain page showing its count), then "In progress", then "Recently added", then "Collections" with "All collections" to `/collections`
- **proof:** e2e

#### Scenario: In progress shelf lists media in progress
- **WHEN** an anime watching, a book reading and an album listened are seeded
- **THEN** the "In progress" shelf shows the anime and the book only
- **proof:** e2e

#### Scenario: In progress cards read their progress with its total
- **WHEN** an anime watching at 3 of 28 episodes and a manga reading at 5 of an unknown number of chapters are seeded and `/` and `/animanga` are opened
- **THEN** in each "In progress" shelf the anime's card reads "3 / 28 episodes" and the manga's card "5 / ? chapters" above its − and + steps (signed hi-fi, Rue gate 7)
- **proof:** e2e

#### Scenario: Nothing in progress leaves the section out
- **WHEN** only done and want entries are seeded and `/` is opened
- **THEN** no "In progress" region renders and the other sections do
- **proof:** e2e

#### Scenario: Recently added shelves per domain
- **WHEN** entries in Music and Fashion only are seeded
- **THEN** "Recently added" is one card holding a Music shelf and a Fashion shelf with their entries and "See all" links, and nothing for Animanga or Books
- **proof:** e2e

#### Scenario: Collections section shows collages
- **WHEN** the collections "Summer" (entries with images), "Late Night" (entries with images) and "Empty one" (no entries) are seeded in that order, so the list (newest first) reads Empty one, Late Night, Summer
- **THEN** the Collections section lists "Late Night" first (the first collection with images by newest, featured), then "Empty one" and "Summer" in newest-first order, each collection with its collage (or placeholder) and count, each linking to its page
- **proof:** e2e

#### Scenario: No collections shows a New collection prompt
- **WHEN** entries but no collections are seeded and `/` is opened
- **THEN** the Collections section shows "New collection" (to `/collections`) and no collage
- **proof:** e2e

#### Scenario: Settings is reached from the Home header
- **WHEN** `/` is opened at 390×844 and at 1280×800 and the "Settings" link inside the Home head (located within the page header, not the top bar's same-named link) is activated
- **THEN** the browser lands on `/settings`; at 1280×800 the page has two links named "Settings" (top bar and Home head) and the test addresses the head's one by scope
- **proof:** e2e

#### Scenario: Empty archive shows a welcome per domain
- **WHEN** the archive is empty and `/` is opened
- **THEN** a welcome shows "Add your first" links for Music, Animanga, Books and Fashion and the "Add" button, and no domain tile, shelf or collection renders
- **proof:** e2e

#### Scenario: Home head offers Add on the desktop only
- **WHEN** `/` is opened at 1280×800, the Home head's "Add" arrow pill is activated and "Album" is chosen, then `/` is opened at 390×844
- **THEN** at 1280 the type sheet titled "Add to your archive" with every domain's types opens and the browser lands on `/add/album`; at 390 the Home head has no "Add" pill (the phone bar's "+" is the add)
- **proof:** e2e

#### Scenario: Long titles and missing images stay inside Home
- **WHEN** entries with 180-character titles and no images and a collection without images are seeded and `/` is opened at 320, 390 and 1280 px
- **THEN** every tile and card shows the initials placeholder where an image would be, no image is broken, and the document's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Home looks like the signed-off hi-fi
- **WHEN** Rue opens Home with real data on phone and desktop
- **THEN** it matches the gate-5 hi-fi of SC1
- **proof:** manual (visual judgement by Rue at gate 7)

