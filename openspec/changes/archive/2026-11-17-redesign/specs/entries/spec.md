## MODIFIED Requirements

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

## ADDED Requirements

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
