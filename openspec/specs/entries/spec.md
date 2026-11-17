# entries Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Generic entry model and type config
All 12 types (Album, Artist, Song, Anime, Manga, Book, Brand, Shop/Site, Influencer, Magazine, Piece, Look) SHALL be
stored in one `entries` table and described by one per-type config (`TYPES`) that declares domain, labels, list slug,
title label, fields, artist link, status kind, ratability, progress keys, provider and URL preview, so that create,
edit, detail and list code is shared. Fields per type SHALL be as in scope S10 (design.md → Type config); magazine has
the influencer's config apart from its type, labels and slug.

#### Scenario: Every type has a complete config
- **WHEN** `TYPES` is read
- **THEN** it has exactly the 12 types; media types have `status: 'media'` and `ratable: true`; piece has `status: 'piece'`; brand, site, influencer, magazine and look have neither; anime has progress `['episodes']`, manga `['chapters', 'volumes']`; album and song have `artist: true`; brand, site, influencer, magazine and piece have `preview: true`; magazine has domain fashion, label "Magazine", plural "Magazines", slug `magazines`, title label "Name", fields `['handles']` and provider null
- **proof:** unit

#### Scenario: Each list slug resolves to its type
- **WHEN** `typeBySlug` is called for every domain's slugs and for an unknown slug
- **THEN** each slug returns its type (fashion `wardrobe` returns piece with status owned via `LISTS`, fashion `magazines` returns magazine) and the unknown slug returns null
- **proof:** unit

### Requirement: Create entries
The server SHALL create an entry of any type from an `EntryInput` that has a non-blank title/name, storing the fields
its type config allows, `created_at` and `updated_at`, and ignoring fields the type doesn't have. Media entries
default to status `none` and pieces to `wishlist`; the input MAY carry an initial status valid for the type, and a media entry created with a status other than `none` SHALL get its first dated status event at creation. An invalid initial status SHALL be rejected with `Invalid status for <type>` and nothing stored. A blank title SHALL be rejected with the type's message ("Title is
required" or "Name is required") and nothing stored. The form SHALL show the type's fields and save once even when
Save is pressed repeatedly.

#### Scenario: Create an entry of each type
- **WHEN** `createEntry` is called once per type with a title and every field of that type
- **THEN** `getEntry` returns each with its fields, default status (media `none`, piece `wishlist`, others null), equal `createdAt` and `updatedAt`
- **proof:** unit

#### Scenario: Create a media entry with an initial status
- **WHEN** `createEntry` gets an album with status `want`, a book with status `none` and a piece with status `owned`
- **THEN** the album has status `want` and one status event, the book has status `none` and no event, and the piece has status `owned`
- **proof:** unit

#### Scenario: Invalid initial status is rejected
- **WHEN** `createEntry` gets an album with status `owned` and a piece with status `done`
- **THEN** each throws a ValidationError with `status: 'Invalid status for <type>'` and no row is stored
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
Brand and Shop/Site entries SHALL share their fields including `kind` (brand | shop | site), forming one combined
type from the user's point of view. Kind `brand` SHALL store the entry as type brand, kinds `shop` and `site` as type
site (storage detail), and changing the kind SHALL NOT change which list the entry appears in: both stored types belong
to the one combined list "Brands & shops". `/add/brand` and `/add/site` SHALL both open the same form, with kind
preselected `brand` and `shop` respectively.

#### Scenario: Kind decides the brand or site type
- **WHEN** `createEntry` gets type site with kind brand, and type brand with kind shop
- **THEN** the first is stored as type brand and the second as type site with kind shop
- **proof:** unit

#### Scenario: Changing the kind keeps the entry in the combined list
- **WHEN** a brand is updated to kind shop and `listEntries` is called for the combined list
- **THEN** the entry is still returned, with kind shop
- **proof:** unit

#### Scenario: Both add routes open the combined form
- **WHEN** `/add/brand` and `/add/site` are opened
- **THEN** both show the same fields, with Kind "Brand" selected on the first and "Shop" on the second
- **proof:** e2e

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
`/entries/[id]` SHALL show, inside its domain's world, the entry's cover (or initials placeholder), domain and type, the full title, every filled field of its type, tags, the note and the controls its type has: media get the status menu, the typed rating (see Rating) and, for anime and manga, the progress steps with "Mark as watched" / "Mark as read" once the finishing counter reaches a known total; pieces get the status menu. "Add to collection" SHALL sit in the page's "In collections" card and "Edit" and "Delete" in the ··· menu of the top-right `.detail-actions` pill ("Entry menu"), Delete last after a separator as a danger item; all three SHALL be reachable on phone and desktop, with Delete never the primary or default action. An artist SHALL show its "Works" (albums and songs linked to it), and an artist without works SHALL say so. Unknown ids SHALL answer 404. Card titles SHALL be shortened in listings; the entry page SHALL show the full title, and on the phone a 180-character title SHALL not push the page's controls or the navigation out of reach.

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
- **THEN** its card title is clamped (it ends with an ellipsis and is shorter than the full title's single-line width)
- **proof:** e2e

#### Scenario: Unknown entry answers 404
- **WHEN** `/entries/999999` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: Phone detail keeps controls in reach with a long title
- **WHEN** the entry page of a manga with a 180-character title is opened at 390×844
- **THEN** the top of the `h1` is above 844 px, and after scrolling the Status, Rating and progress controls and the actions are each reachable without being covered by the phone bar
- **proof:** e2e

#### Scenario: Delete is never the primary action
- **WHEN** the entry page of a seeded album is opened at 390 and at 1280 px
- **THEN** "Delete" is a menu item in the "Entry menu" that is not a dark primary button, is drawn in the danger colour and is not focused on load, and activating it opens the confirmation dialog
- **proof:** e2e

#### Scenario: Delete is a danger item in the entry menu
- **WHEN** the "Entry menu" button of a seeded album's entry page is activated
- **THEN** the menu lists "Edit" (a link to the edit page) and then, after a separator, "Delete" in the danger colour with a visible trash icon, and Escape closes it and returns focus to the button
- **proof:** e2e

#### Scenario: Entry without cover shows the placeholder
- **WHEN** the entry page of a book without an image is opened
- **THEN** the initials placeholder shows where the cover would be and no image request fails
- **proof:** e2e

#### Scenario: Artist with no works says so
- **WHEN** the entry page of an artist without linked albums or songs is opened
- **THEN** the Works section states that nothing is linked yet and lists no work
- **proof:** e2e

#### Scenario: Entry page looks like the signed-off hi-fi
- **WHEN** Rue looks at an anime, a book, a piece and an artist on phone and desktop
- **THEN** each matches the gate-5 hi-fi of SC5
- **proof:** manual (visual judgement by Rue at gate 7)

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

### Requirement: Magazine type
Magazine entries SHALL behave exactly as influencer entries (name and handles, no status, rating or progress, URL
preview with handle prefill) and SHALL appear wherever the generic config lists Fashion types: the Fashion Add menu,
`/add/magazine`, the list `/fashion/magazines` with the generic empty state, the Fashion domain shelves, the Home
"Recently added · Fashion" shelf and collections. The Fashion welcome line on an empty Home SHALL read "Brands, shops,
magazines, pieces you own and looks you keep."

#### Scenario: Create a magazine from the Add menu
- **WHEN** on `/fashion` "Add" → "Magazine" is chosen, the name "Vestoj" and the Instagram handle "vestoj" are entered and saved
- **THEN** the browser lands on `/entries/<id>` showing "Vestoj" and the handle, `/fashion/magazines` shows exactly that card, and Home's "Recently added · Fashion" shelf shows it
- **proof:** e2e

#### Scenario: Magazine form shows the influencer fields
- **WHEN** `/add/magazine?manual=1` is opened
- **THEN** it shows Name and the Instagram, TikTok, YouTube and Website handle fields, and no status, rating or progress control
- **proof:** e2e

#### Scenario: Empty magazines list offers Add
- **WHEN** `/fashion/magazines` is opened with no magazines
- **THEN** no card shows and the empty state's "Add" link points to `/add/magazine`
- **proof:** e2e

#### Scenario: Magazine joins a collection
- **WHEN** a magazine is created and added to a collection
- **THEN** that collection's entries include the magazine
- **proof:** unit

#### Scenario: Fashion welcome names magazines
- **WHEN** the archive is empty and `/` is opened
- **THEN** the Fashion welcome card reads "Brands, shops, magazines, pieces you own and looks you keep." and its link still points to `/add/piece`
- **proof:** e2e

### Requirement: Prefill status on the add route
`/add/[type]` SHALL accept a `status` query value and, when it is valid for the type (media statuses for media types, `wishlist`/`owned`/`gone` for pieces), return it as the initial status; the piece form and the media add form SHALL preselect it. An invalid or inapplicable value SHALL be dropped.

#### Scenario: Valid status prefills the form
- **WHEN** `/add/piece?manual=1&status=owned` is loaded
- **THEN** the load result carries initial status `owned`
- **proof:** unit

#### Scenario: Status prefill reaches the piece form
- **WHEN** `/add/piece?manual=1&status=owned` is opened, a name is entered and the form is saved
- **THEN** the Status select shows Owned beforehand and the saved piece is owned
- **proof:** e2e

#### Scenario: Status prefill reaches the media form
- **WHEN** `/add/book?manual=1&status=want` is opened, a title is entered and the form is saved
- **THEN** the Status field shows "Want to read" beforehand and the saved book has status want
- **proof:** e2e

#### Scenario: Invalid status is dropped
- **WHEN** `/add/piece?status=done` and `/add/book?status=owned` are loaded
- **THEN** neither carries an initial status
- **proof:** unit

### Requirement: Add flow on the fingerprint
`/add/[type]` SHALL offer, per type, the catalogue search then the form (album, artist, song, anime, manga, book), the page URL preview then the form (brand, site, influencer, magazine, piece), or the manual form (look), with "Add manually" always reachable. The media form SHALL offer an initial Status (No status plus the domain's labels, default No status); a choice other than No status SHALL store the first status event at creation. Save SHALL show the toast "Saved" on the entry page; leaving an edited form in-app SHALL ask "Discard changes?". A catalogue failure SHALL lead to the manual form with the query as title; a HEIC file SHALL be rejected with "Unsupported image type"; a duplicate title SHALL be allowed; a 180-character title SHALL stay usable in the form and its heading.

#### Scenario: Media form saves an initial status
- **WHEN** on `/add/anime?manual=1` the title "Frieren" is entered, Status "Watching" is chosen and the form is saved
- **THEN** the entry page shows "Watching", the toast "Saved" shows, and the entry has exactly one status event `progress`
- **proof:** e2e

#### Scenario: Media form defaults to No status
- **WHEN** `/add/album?manual=1` is opened
- **THEN** the Status field shows "No status" and saving a title stores status none with no event
- **proof:** e2e

#### Scenario: Catalogue down leads to the manual form
- **WHEN** the search on `/add/book` fails (fake provider error) for the query "Dune" and "Add manually" is chosen
- **THEN** "Search is unavailable right now" shows first, and the manual form opens with the title "Dune"
- **proof:** e2e

#### Scenario: HEIC photo is rejected in the add form
- **WHEN** `fixtures/heic/sample.heic` is chosen as the image on `/add/look`
- **THEN** "Unsupported image type" shows at the Image field and nothing is uploaded
- **proof:** e2e

#### Scenario: Duplicate title and long title are allowed
- **WHEN** a book titled with a 180-character title is saved twice through `/add/book?manual=1`
- **THEN** two entries exist with that title, each entry page heading shows it in full, and the form had no horizontal scroll at 390 px
- **proof:** e2e

#### Scenario: Add form looks like the signed-off hi-fi
- **WHEN** Rue adds an album by search, a piece by URL and a look by hand on her phone
- **THEN** each step matches the gate-5 hi-fi of SC4
- **proof:** manual (visual judgement by Rue at gate 7, real phone)

### Requirement: Edit form for every type
`/entries/[id]/edit` SHALL open the add form's manual mode with every stored value for every type (album, artist, song, anime, manga, book, brand, site, influencer, magazine, piece, look), including the piece Status. Media status, rating and the current progress SHALL NOT be in the form; they stay on the entry page. Leaving an edited form in-app SHALL ask "Discard changes?" and an untouched form SHALL never ask.

#### Scenario: Edit opens every type with its values
- **WHEN** one entry of each of the twelve types is seeded with its type's fields and `/entries/<id>/edit` is opened for each
- **THEN** each form shows the stored title/name and fields, the piece form shows its Status, and no media form shows Status, Rating or a current progress field
- **proof:** e2e

#### Scenario: Edited form asks before leaving
- **WHEN** the title is changed on an edit form and the Main navigation's Home is activated, then "Keep editing" is chosen, then Home again and "Discard"
- **THEN** the dialog "Discard changes?" shows, the first choice keeps the form with the change, the second lands on `/` and the entry is unchanged
- **proof:** e2e

### Requirement: Magazines in the functional contract
The functional contract SHALL list magazine as a full Fashion type: `/fashion/magazines` among the valid list pairs (§4.3), `magazine` among the valid add types with URL preview (§4.4) and both routes in the coverage check (§8); existing magazine entries SHALL show in `/fashion/magazines`.

#### Scenario: Contract lists magazines
- **WHEN** `docs/functional-contract.md` is read
- **THEN** §4.3's valid pairs include `/fashion/magazines`, §4.4's valid types include `magazine` with the preview types, and the Magazine row of §3 is unchanged
- **proof:** unit

#### Scenario: Existing magazines appear in their list
- **WHEN** two magazines are seeded through the test seed route and `/fashion/magazines` is opened
- **THEN** both show, newest first, and "Add" links to `/add/magazine`
- **proof:** e2e

