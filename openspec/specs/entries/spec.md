# entries Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Generic entry model and type config
All 11 types (Album, Artist, Song, Anime, Manga, Book, Brand, Shop/Site, Influencer, Piece, Look) SHALL be stored in
one `entries` table and described by one per-type config (`TYPES`) that declares domain, labels, list slug, title
label, fields, artist link, status kind, ratability, progress keys, provider and URL preview, so that create, edit,
detail and list code is shared. Fields per type SHALL be as in scope S10 (design.md → Type config).

#### Scenario: Every type has a complete config
- **WHEN** `TYPES` is read
- **THEN** it has exactly the 11 types; media types have `status: 'media'` and `ratable: true`; piece has `status: 'piece'`; brand, site, influencer and look have neither; anime has progress `['episodes']`, manga `['chapters', 'volumes']`; album and song have `artist: true`; brand, site, influencer and piece have `preview: true`
- **proof:** unit

#### Scenario: Each list slug resolves to its type
- **WHEN** `typeBySlug` is called for every domain's slugs and for an unknown slug
- **THEN** each slug returns its type (fashion `wardrobe` returns piece with status owned via `LISTS`) and the unknown slug returns null
- **proof:** unit

### Requirement: Create entries
The server SHALL create an entry of any type from an `EntryInput` that has a non-blank title/name, storing the fields
its type config allows, `created_at` and `updated_at`, and ignoring fields the type doesn't have. Media entries
default to status `none`, pieces to `wishlist`. A blank title SHALL be rejected with the type's message ("Title is
required" or "Name is required") and nothing stored. The form SHALL show the type's fields and save once even when
Save is pressed repeatedly.

#### Scenario: Create an entry of each type
- **WHEN** `createEntry` is called once per type with a title and every field of that type
- **THEN** `getEntry` returns each with its fields, default status (media `none`, piece `wishlist`, others null), equal `createdAt` and `updatedAt`
- **proof:** unit

#### Scenario: Server rejects a blank title
- **WHEN** `createEntry` gets a title of "   " for a book and for a brand
- **THEN** it throws a ValidationError with `title: 'Title is required'` and `title: 'Name is required'` and no row is stored
- **proof:** unit

#### Scenario: Fields of another type are ignored
- **WHEN** `createEntry` gets a book with `details.trackCount` and `progress.episodes`
- **THEN** the stored book has neither
- **proof:** unit

#### Scenario: Create an album manually from the form
- **WHEN** `/add/album?manual=1` is opened, title "Ctrl", year 2017, type EP and 7 tracks entered and saved
- **THEN** the browser lands on `/entries/<id>`, and that entry's edit form shows "Ctrl", 2017, EP and 7 tracks
- **proof:** e2e

#### Scenario: Form shows the fields of its type
- **WHEN** `/add/anime?manual=1`, `/add/piece?manual=1` and `/add/influencer?manual=1` are opened
- **THEN** anime shows Title, Alt title, Year and Episodes total; piece shows Name, Brand, URL, Price and Status; influencer shows Name and Instagram, TikTok, YouTube and Website handles
- **proof:** e2e

#### Scenario: Empty title is not saved
- **WHEN** the manual form for a book is saved with an empty title
- **THEN** an inline "Title is required" shows at the title field, the URL stays under `/add/book` and no entry exists
- **proof:** e2e

#### Scenario: Double submit creates one entry
- **WHEN** Save on the manual album form is clicked twice in quick succession
- **THEN** exactly one entry with that title exists
- **proof:** e2e

### Requirement: Brand and shop kinds
Brand and Shop/Site entries SHALL share their fields including `kind` (brand | shop | site); kind `brand` SHALL store
the entry as type brand, kinds `shop` and `site` as type site, so changing the kind moves the entry between the
Brands and Shops lists.

#### Scenario: Kind decides the brand or site type
- **WHEN** `createEntry` gets type site with kind brand, and type brand with kind shop
- **THEN** the first is stored as type brand and the second as type site with kind shop
- **proof:** unit

### Requirement: Edit entries
Editing SHALL load every stored field into the type's form, save changes through the same validation and bump
`updated_at`, then show the detail page.

#### Scenario: Edit changes are saved
- **WHEN** a seeded manga's edit page changes the title and chapters total and saves
- **THEN** the browser is on `/entries/<id>`, and reopening the edit form shows the new title and total
- **proof:** e2e

#### Scenario: Update bumps the updated timestamp
- **WHEN** `updateEntry` changes a note
- **THEN** `updatedAt` is later than before and `createdAt` is unchanged
- **proof:** unit

### Requirement: Entry detail
`/entries/[id]` SHALL show the entry's image (or placeholder), full title, every filled field of its type, tags, note
and the controls its type has, inside its domain's world; unknown ids SHALL answer 404. Card titles SHALL truncate to
two lines; the detail page SHALL show the full title. Below 1024 px the cover SHALL be at most 240 px wide, so at
390 × 844 the title starts above the fold. On desktop the status pill, the star rating and the progress control SHALL
sit on one aligned row (the progress label does not push the control off it). The actions (Edit, add to collection,
Delete) SHALL sit on one row, with Delete as a quiet text button that still asks for confirmation.

#### Scenario: Detail shows every filled field
- **WHEN** `/entries/<id>` of a seeded piece with brand, URL, price, status owned, two tags and a note is opened
- **THEN** it shows the name, brand, a link to the URL, the price, "Owned", both tags and the note
- **proof:** e2e

#### Scenario: Long title shows in full on detail
- **WHEN** an entry with a 180-character title is opened
- **THEN** the detail heading contains the whole title
- **proof:** e2e

#### Scenario: Long title truncates on cards
- **WHEN** a list holds an entry with a 180-character title
- **THEN** its card title is clamped to two lines (its height equals two line heights and it ends with an ellipsis)
- **proof:** e2e

#### Scenario: Unknown entry answers 404
- **WHEN** `/entries/999999` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: Phone detail shows the title above the fold
- **WHEN** the detail pages of a seeded manga (2/3 cover) and of an entry with a 180-character title are opened at 390 × 844
- **THEN** the cover is at most 240 px wide and the top of the `h1` is above 844 px in both
- **proof:** e2e

#### Scenario: Desktop controls share one row
- **WHEN** the detail page of an in-progress anime with a rating is opened at 1280 px
- **THEN** the status pill, the star rating and the progress control's buttons have vertical centres within 2 px of each other
- **proof:** e2e

#### Scenario: Detail without progress keeps its controls row
- **WHEN** the detail page of a rated album is opened at 1280 px
- **THEN** the status pill and the star rating have vertical centres within 2 px of each other
- **proof:** e2e

#### Scenario: Delete is a quiet action on the actions row
- **WHEN** the detail page of a seeded album is opened at 390 and at 1280 px
- **THEN** the Delete button's top is within 2 px of the Edit action's top, its computed background is transparent and it has no visible border
- **proof:** e2e

#### Scenario: Detail looks balanced
- **WHEN** Rue looks at detail screenshots of an anime, a book and a piece at phone and desktop size
- **THEN** the cover, title, controls and actions read as one composed screen
- **proof:** manual (visual judgement at Gate 2, from the verifier's screenshots)

### Requirement: Delete entries
Deleting SHALL ask for confirmation first; on confirm the entry, its image, its tag links, its status events and its
collection memberships SHALL be removed, and the browser SHALL return to the type's list with a "Deleted" toast.

#### Scenario: Delete asks first and returns to the list
- **WHEN** Delete is chosen on a seeded album's detail page and the confirm accepted
- **THEN** the browser is on `/music/albums`, a "Deleted" toast shows and `/entries/<id>` answers 404
- **proof:** e2e

#### Scenario: Cancelled delete keeps the entry
- **WHEN** Delete is chosen and the confirm cancelled
- **THEN** the detail page stays and the entry still exists
- **proof:** e2e

#### Scenario: Deleted entry leaves every collection
- **WHEN** an entry in two collections is deleted with `deleteEntry`
- **THEN** both collections still exist with one entry fewer, and the entry's image row and status events are gone
- **proof:** unit

### Requirement: Unsaved-changes guard
The add and edit forms SHALL ask "Discard changes?" before an in-app navigation leaves a form whose values differ from
the values it opened with (a prefill from search or preview counts as a change), and SHALL trigger the browser's
native `beforeunload` prompt on reload or close in that state. An untouched form, the Save submit and the navigation
after a successful save SHALL never ask.

#### Scenario: Leaving a changed form asks first
- **WHEN** a title is typed on `/add/book?manual=1` and the nav's Music item is clicked, then "Keep editing" is chosen
- **THEN** a "Discard changes?" dialog shows, and after "Keep editing" the URL is still under `/add/book` with the typed title in place
- **proof:** e2e

#### Scenario: Discarding leaves the form
- **WHEN** the same dialog is answered with "Discard"
- **THEN** the browser is on `/music`
- **proof:** e2e

#### Scenario: Leaving an untouched form does not ask
- **WHEN** `/entries/<id>/edit` of a seeded album is opened and the nav's Home item clicked without changing anything
- **THEN** no dialog shows and the browser is on `/`
- **proof:** e2e

#### Scenario: Changed edit form asks before leaving
- **WHEN** the note is changed on `/entries/<id>/edit` and the nav's Collections item clicked
- **THEN** the "Discard changes?" dialog shows
- **proof:** e2e

#### Scenario: Saving does not ask
- **WHEN** a changed manual album form is saved and, on the page it lands on, the nav's Home item is clicked
- **THEN** no dialog shows at any point and the browser is on `/`
- **proof:** e2e

#### Scenario: Reload of a changed form triggers the native prompt
- **WHEN** a title is typed on `/add/look` and the page reloaded
- **THEN** Playwright sees a `beforeunload` dialog
- **proof:** e2e

#### Scenario: Reload of an untouched form does not prompt
- **WHEN** `/add/look` is reloaded without input
- **THEN** no `beforeunload` dialog is raised
- **proof:** e2e

