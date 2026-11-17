# motion Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Page transitions
In-app navigation SHALL change pages without a View Transition: no cover morph between a card and its entry page and no crossfade, because the fingerprint moves only through its four motion hooks (press, pill glide, the cards settling on a full page load only, the rating confirm line). Going back (history back) SHALL restore the horizontal scroll position of the shelf rows on the page it returns to. Navigation SHALL work the same with and without `document.startViewTransition`.

#### Scenario: Navigation starts no view transition
- **WHEN** with `document.startViewTransition` spied the Main navigation moves from Home to Music, a card on `/music` is activated and the browser goes back
- **THEN** `startViewTransition` is never called, each page shows its content, and no element carries a `view-transition-name`
- **proof:** e2e

#### Scenario: Back restores the shelf scroll position
- **WHEN** a shelf row with 12 cards is scrolled so that its 8th card is in view, that card is activated and the browser goes back
- **THEN** the row's `scrollLeft` after the back navigation is within 2 px of its value before the click and the 8th card is in view
- **proof:** e2e

#### Scenario: Browser without View Transitions navigates plainly
- **WHEN** `document.startViewTransition` is deleted before the app loads and the Main navigation moves from Home to Books
- **THEN** Books shows, the URL is `/books` and no page error is raised
- **proof:** e2e

### Requirement: Micro-interactions
A committed typed rating that differs from the saved one SHALL draw the fingerprint's confirm line under the figure (`data-confirm-line`); the round step buttons, arrow keys and Escape SHALL save without it. A status change SHALL show the new status at once. Menus, popovers, sheets and dialogs SHALL open and close with a short soft motion (Rue, gate 7, reversing the fingerprint's "menus instant"): opacity plus the press scale (`--press-scale`) out of the trigger's corner for a menu (its bottom corner when the menu opens above its trigger), opacity plus a small rise (`--settle-rise`) for the phone's bottom sheet, opacity plus the press scale from the centre for a centred dialog, each `--motion-quick` long on `--ease-out`; a closing menu SHALL be `aria-hidden` and inert while it fades. Under reduced motion they SHALL open and close at once. Something Rue creates in place SHALL rise into its list (a new collection card on the collections index, a new collection chip on the entry page, a tag chip or tag suggestion that appears in the add and edit form: opacity, `--settle-rise` and the press scale over `--motion-glide`; what a page shows on arrival, including another entry's chips after a navigation between entries, SHALL NOT rise), and its siblings SHALL glide to their new places (FLIP through `transform`); a panel that opens in place (the "New collection" form) SHALL only fade in and out over `--motion-quick`, and the cards below it SHALL glide to their new place as it comes and goes, never jump; a collection's rows SHALL glide after a move made with the pointer, while a move made from the keyboard jumps. Under reduced motion all of these SHALL be instant. Saving and deleting SHALL show a toast ("Saved", "Deleted") that hides itself after about 3 s. Under reduced motion the confirm line SHALL only fade in and out, and the toast SHALL still appear, without sliding.

#### Scenario: Typed rating draws the confirm line
- **WHEN** 8.75 is typed into the rating field on a detail page and committed with Enter, then "Rating: one more" is activated
- **THEN** after the Enter an animation runs on the field's confirm line and the rating reads 8.75; after the step button the rating reads 9 and no new confirm-line animation starts
- **proof:** e2e

#### Scenario: Status changes at once
- **WHEN** the status is changed on a detail page through the status menu
- **THEN** no animation runs on the status control and the new status shows at once
- **proof:** e2e

#### Scenario: Menus open and close softly
- **WHEN** the "Entry menu" on a detail page is opened and then closed with Escape, with reduced motion off
- **THEN** opening runs an opacity and a transform transition of `--motion-quick` on the menu, and while it fades out after Escape the menu is `aria-hidden="true"` and inert
- **proof:** e2e

#### Scenario: A menu above its button grows from its bottom edge
- **WHEN** with reduced motion off, the "Entry menu" is opened at the top of an entry page at 1280×500, and at 390×500 on a collection page scrolled so the last row's "Actions for …" button sits at the viewport's bottom edge that row's menu is opened
- **THEN** the "Entry menu" opens below its button with its transform origin on its top edge; the row menu opens above its button with its transform origin on its bottom edge
- **proof:** e2e

#### Scenario: Dialogs open softly
- **WHEN** the delete confirmation is opened from the "Entry menu", with reduced motion off
- **THEN** an animation of `--motion-quick` or less runs on the dialog and its keyframes change only `opacity` and `transform`
- **proof:** e2e

#### Scenario: Reduced motion opens menus and dialogs at once
- **WHEN** reduced motion is on and the "Entry menu" and then the delete confirmation are opened
- **THEN** no animation or transition runs on the menu or the dialog
- **proof:** e2e

#### Scenario: A new collection rises into the list
- **WHEN** a second collection is created on the collections index, with reduced motion off
- **THEN** the new card's list item runs an animation whose keyframes change `opacity` and nothing but `opacity` and `transform`
- **proof:** e2e

#### Scenario: A new tag chip rises into the field
- **WHEN** on an album's edit form, with reduced motion off, the tag suggestion "summer" is activated
- **THEN** the "summer" item in "Selected tags" runs an animation whose keyframes change `opacity` and nothing but `opacity` and `transform`
- **proof:** e2e

#### Scenario: The new-collection form fades and the cards glide
- **WHEN** with reduced motion off, "New collection" is activated on a collections index with two collections, and a collection is created
- **THEN** the form runs animations changing only `opacity` as it opens and again as it leaves, the "Collections" list runs one `transform` animation each time, and focus returns to "New collection"
- **proof:** e2e

#### Scenario: Reduced motion opens and closes the new-collection form at once
- **WHEN** reduced motion is on and a collection is created through the "New collection" form
- **THEN** no script animation runs on the page and focus returns to "New collection"
- **proof:** e2e

#### Scenario: Moving to another entry does not raise its chips
- **WHEN** with reduced motion off, an album in one collection is opened and its linked artist, in two other collections, is reached through the artist link (a client-side navigation between entry pages)
- **THEN** the artist's two collection chips show and no animation runs on any list item
- **proof:** e2e

#### Scenario: Rows glide after a pointer move, a keyboard move jumps
- **WHEN** on a collection page with reduced motion off, "Move <title> down" is clicked with the mouse, then another row is moved with the keyboard (focus and Enter)
- **THEN** after the click the rows run `transform` animations; after the keyboard move none starts
- **proof:** e2e

#### Scenario: Toast confirms save
- **WHEN** an entry is saved from the form
- **THEN** a `role="status"` toast with "Saved" appears after landing on `/entries/<id>` and is gone after 4 s
- **proof:** e2e

#### Scenario: Reduced motion toast appears without sliding
- **WHEN** reduced motion is on and an entry is saved
- **THEN** the "Saved" toast is visible with no running animation
- **proof:** e2e

#### Scenario: Toast confirms delete
- **WHEN** an entry is deleted and the confirm accepted
- **THEN** the list page shows a `role="status"` toast with "Deleted"
- **proof:** e2e

#### Scenario: Micro-interactions stay calm
- **WHEN** Rue rates, changes a status, and saves
- **THEN** the confirm line and the toast confirm the change without noise, the status shows at once and the menus open and close softly
- **proof:** manual (motion quality at gate 7)

### Requirement: Shelf drag-scroll and card hover
Shelf rows SHALL drag-scroll with the mouse and keep gliding after release. Cards SHALL NOT move on hover: hover changes colour only (fingerprint motion), and no card lifts or tilts at any width. Pressing a card SHALL press it in to the fingerprint's press scale (`data-press`, 0.97; Rue, gate 7) and nothing else; a control inside the card presses on its own, and the cards of a shelf being dragged stay still. Under reduced motion drag-scroll SHALL stop on release and a pressed card SHALL stay still.

#### Scenario: Shelf rows drag-scroll with inertia on desktop
- **WHEN** a shelf with 20 cards is dragged left with the mouse and released quickly on desktop
- **THEN** its `scrollLeft` keeps increasing for a moment after `mouseup`
- **proof:** e2e

#### Scenario: Reduced motion drag-scroll stops on release
- **WHEN** reduced motion is on and the same drag is released
- **THEN** `scrollLeft` does not change after `mouseup`
- **proof:** e2e

#### Scenario: Inertia decays to a stop
- **WHEN** `inertiaSteps` is given a release velocity of 2 px/ms
- **THEN** each step's velocity is smaller than the previous one and the sequence ends below 0.05 px/ms
- **proof:** unit

#### Scenario: Cards do not move on hover on desktop
- **WHEN** the pointer hovers a card on desktop
- **THEN** the card's and its cover's computed transform stays `none`
- **proof:** e2e

#### Scenario: Cards press in
- **WHEN** a card on a list is pressed and held with the mouse on desktop
- **THEN** its computed transform is the press scale `matrix(0.97, 0, 0, 0.97, 0, 0)` (no rotation, no lift), and `none` again after release
- **proof:** e2e

#### Scenario: Reduced motion cards stay still when pressed
- **WHEN** reduced motion is on and the same card is pressed and held
- **THEN** its transform stays `none`
- **proof:** e2e

