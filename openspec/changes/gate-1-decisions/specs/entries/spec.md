## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Prefill status on the add route
`/add/[type]` SHALL accept a `status` query value and, when it is valid for the type (media statuses for media types,
`wishlist`/`owned`/`gone` for pieces), preselect it in the form; an invalid or inapplicable value SHALL be dropped.

#### Scenario: Valid status prefills the form
- **WHEN** `/add/piece?manual=1&status=owned` is loaded
- **THEN** the load result carries initial status `owned`
- **proof:** unit

#### Scenario: Invalid status is dropped
- **WHEN** `/add/piece?status=done` and `/add/book?status=owned` are loaded
- **THEN** neither carries an initial status
- **proof:** unit
