# tracking Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Media status with dated events
Album, Artist, Song, Anime, Manga and Book entries SHALL have a status none | want | in progress | done | dropped,
labelled per domain (Music: Want to listen / Listening / Listened; Anime: Plan to watch / Watching / Watched; Manga
and Books: Want to read / Reading / Read; all: Dropped; none: No status). Every change of status SHALL store one
status event with the new status and the time; setting the current status again SHALL store nothing. Creating a media
entry with a status other than none SHALL store its first event. Pieces SHALL have wishlist | owned | gone without
events; brands, shops, influencers, magazines and looks SHALL have no status.

#### Scenario: Changing status stores a dated event
- **WHEN** `setStatus` moves a seeded album from want to done
- **THEN** it returns true, the album's status is done, and `statusEvents` ends with one `done` event whose `at` is the current time
- **proof:** unit

#### Scenario: Setting the same status again stores no event
- **WHEN** `setStatus` sets a book that is already reading to reading
- **THEN** it returns false and the number of status events is unchanged
- **proof:** unit

#### Scenario: New entry with a status stores its first event
- **WHEN** `createEntry` creates an anime with status want, and another with status none
- **THEN** the first has one `want` event and the second has none
- **proof:** unit

#### Scenario: Status none is allowed
- **WHEN** `setStatus` sets an artist from listened to none
- **THEN** the status is none and one `none` event is stored
- **proof:** unit

#### Scenario: Invalid status for a type is rejected
- **WHEN** `setStatus` gives a brand or a magazine any status, or a piece the status want
- **THEN** it throws a ValidationError and nothing changes
- **proof:** unit

#### Scenario: Status labels follow the domain
- **WHEN** the status pill menu is opened on the detail pages of an album, an anime, a manga and a book
- **THEN** they list "Want to listen, Listening, Listened, Dropped", "Plan to watch, Watching, Watched, Dropped", "Want to read, Reading, Read, Dropped" and the same for the book, each plus "No status"
- **proof:** e2e

#### Scenario: Set status from the detail page
- **WHEN** "Listened" is chosen in a seeded album's status pill
- **THEN** the pill shows "Listened" and after a reload it still does
- **proof:** e2e

#### Scenario: Set a piece status from the detail page
- **WHEN** "Owned" is chosen in a seeded piece's status pill
- **THEN** the pill shows "Owned" after a reload
- **proof:** e2e

#### Scenario: Fashion entries without status or rating show no controls
- **WHEN** the detail pages of a seeded brand, a seeded magazine and a seeded look are opened
- **THEN** none of them shows a status pill or a star rating
- **proof:** e2e

### Requirement: Progress for anime and manga
Anime SHALL track episodes and manga chapters and volumes, each as `current / total` with total possibly unknown.
The detail page and in-progress cards SHALL offer − and + buttons and a value that reads as text. Current SHALL never
go below 0 nor above a known total; with an unknown total it SHALL show "n / ?" with no upper bound. Reaching a known
total SHALL offer "Mark as watched" (anime) or "Mark as read" (manga), which sets the status to done. Progress above 0
while the status is want SHALL set the status to in progress (storing that event).

Outside edit mode the value SHALL be a button named "<Label> <current> of <total>" ("of unknown" without a total) and
the control SHALL contain no text input, so a click or tap shows no caret, no text cursor and no keyboard. Activating
the value (click, tap, or Enter/Space while focused) SHALL switch it to a numeric input (`inputmode="numeric"`, named
"<Label>") that is focused with its value selected. Enter or leaving the input SHALL save a changed value through the
existing save queue and return to the button; Escape SHALL return without saving. Empty, non-integer, negative or
above-a-known-total input SHALL revert to the old value without a save. Inside a card, activating the value SHALL NOT
open the detail page. In a card narrower than 210 px the total SHALL be hidden visually (it stays in the button's
name) so that −, value and + are each at least 44 × 44 px and none is clipped by the card; wider cards and the detail
page SHALL show the total. A card too narrow to show the total beside its steps (a shelf card, a phone grid card) SHALL read "n / total unit" ("12 / 28 episodes", "5 / ? chapters") on a line above them (signed hi-fi, Rue gate 7); a wider card shows the total inside the control.

#### Scenario: Step episodes with plus and minus
- **WHEN** + is pressed three times and − once on a seeded anime at 0 / 28
- **THEN** the control reads "2 / 28", it contains no text input, and after a reload it still reads "2 / 28"
- **proof:** e2e

#### Scenario: Type progress directly
- **WHEN** the value of that anime is clicked, 27 typed and Enter pressed
- **THEN** the control reads "27 / 28" with no text input left, and after a reload it still does
- **proof:** e2e

#### Scenario: Progress value is not editable text until activated
- **WHEN** the detail page of a seeded anime at 3 / 28 is opened and nothing is clicked
- **THEN** the "Episodes" group contains no textbox, its value is a button named "Episodes 3 of 28", no element in the group has computed cursor `text`, and `document.activeElement` is not an input
- **proof:** e2e

#### Scenario: Clicking the value enters edit mode with the value selected
- **WHEN** the value button "Episodes 3 of 28" is clicked
- **THEN** a textbox named "Episodes" with value "3" is focused, its whole value is selected (selectionStart 0, selectionEnd 1) and it has `inputmode="numeric"`
- **proof:** e2e

#### Scenario: Keyboard enters edit mode
- **WHEN** the value button is focused with Tab and Enter is pressed, and on another load Space is pressed
- **THEN** both times the textbox named "Episodes" is focused with its value selected
- **proof:** e2e

#### Scenario: Leaving the input saves the edit
- **WHEN** the value is clicked, 12 typed and the page heading clicked
- **THEN** the control reads "12 / 28" with no text input left, one save request is sent, and after a reload it reads "12 / 28"
- **proof:** e2e

#### Scenario: Escape cancels editing
- **WHEN** the value of an anime at 3 / 28 is clicked, 9 typed and Escape pressed
- **THEN** the control reads "3 / 28", no text input is left and no save request is sent
- **proof:** e2e

#### Scenario: Invalid input reverts without saving
- **WHEN** on an anime at 5 / 28 the value is edited in turn to "", "abc", "-1", "2.5" and "40", each confirmed with Enter
- **THEN** after each the control reads "5 / 28", and no save request is sent in total
- **proof:** e2e

#### Scenario: Typed progress is parsed strictly
- **WHEN** `parseProgress` is given "27" with total 28, "400" with no total, and "", "abc", "-1", "2.5", " 7 " and "40" with total 28
- **THEN** it returns 27, 400, null, null, null, null, 7 and null
- **proof:** unit

#### Scenario: Progress value is named for screen readers
- **WHEN** the detail pages of an anime at 3 / 28 and a manga at 120 chapters with unknown total are opened
- **THEN** the value buttons are named "Episodes 3 of 28" and "Chapters 120 of unknown"
- **proof:** e2e

#### Scenario: Numeric keyboard opens only in edit mode
- **WHEN** an in-progress anime card on Home is shown on phone, then its value is tapped
- **THEN** before the tap no element in the card has an `inputmode` attribute; after it the focused input has `inputmode="numeric"`
- **proof:** e2e

#### Scenario: Activating the value on a card stays on the list
- **WHEN** the value of an in-progress anime card at 5 / 28 on `/animanga/anime` is clicked, 6 typed and Enter pressed
- **THEN** the URL is still `/animanga/anime`, the card reads 6, and after the save the detail page reads "6 / 28"
- **proof:** e2e

#### Scenario: Progress control fits a phone shelf card
- **WHEN** Home's "In progress" shelf shows an anime at 12 / 28 on phone
- **THEN** in that card −, the value button and + are each at least 44 × 44 px, each lies inside the card's box, the "/ 28" text inside the control is not visible, the line "12 / 28 episodes" shows above the steps and the value button is named "Episodes 12 of 28"
- **proof:** e2e

#### Scenario: Three-digit progress fits a phone shelf card
- **WHEN** Home's "In progress" shelf shows a manga at 120 / 327 chapters on phone
- **THEN** −, the value button showing "120" and + are each at least 44 × 44 px and lie inside the card's box
- **proof:** e2e

#### Scenario: Desktop cards show the total
- **WHEN** `/animanga/anime` shows an in-progress anime at 5 / 28 on desktop
- **THEN** the card's progress control shows the visible text "5 / 28"
- **proof:** e2e

#### Scenario: Progress cannot go below zero
- **WHEN** `stepProgress` steps −1 on an anime at 0 episodes
- **THEN** episodes stay 0
- **proof:** unit

#### Scenario: Progress cannot exceed a known total
- **WHEN** `setProgress` sets 40 episodes on an anime with 28 total, and `stepProgress` steps +1 at 28 / 28
- **THEN** episodes are 28 both times
- **proof:** unit

#### Scenario: Unknown total has no upper bound
- **WHEN** `setProgress` sets 400 chapters on a manga with an unknown chapter total
- **THEN** chapters are 400 and `progressLabel` returns "400 / ?"
- **proof:** unit

#### Scenario: Ongoing manga shows n / ?
- **WHEN** the detail page of a seeded manga at 120 chapters with unknown totals is opened
- **THEN** the chapter control reads "120 / ?" and its + button is enabled
- **proof:** e2e

#### Scenario: Reaching the total offers Mark as watched
- **WHEN** + is pressed on a seeded anime at 27 / 28 with status watching
- **THEN** the control reads "28 / 28", "Mark as watched" appears, and choosing it sets the pill to "Watched"
- **proof:** e2e

#### Scenario: Reaching the chapter total offers Mark as read
- **WHEN** + is pressed on a seeded manga at 99 / 100 chapters with status reading
- **THEN** "Mark as read" appears, and choosing it sets the pill to "Read"
- **proof:** e2e

#### Scenario: Progress moves want to in progress
- **WHEN** `stepProgress` steps +1 on an anime with status want
- **THEN** its status is progress and a `progress` event is stored
- **proof:** unit

#### Scenario: Progress leaves other statuses alone
- **WHEN** `stepProgress` steps +1 on an anime with status none, and on one with status dropped
- **THEN** their statuses stay none and dropped
- **proof:** unit

#### Scenario: Manga tracks chapters and volumes separately
- **WHEN** `setProgress` sets chapters 50 and volumes 6 on a manga with totals 100 and 12
- **THEN** the entry's progress reads chapters 50 / 100 and volumes 6 / 12
- **proof:** unit

#### Scenario: Progress on the card
- **WHEN** + is pressed on the progress control of an in-progress anime card on `/animanga/anime`
- **THEN** the card reads one episode more and the detail page agrees
- **proof:** e2e

### Requirement: Failed saves are reported
A status, rating or progress change SHALL show at once and be saved in the background. When a save fails (network
error or an error response), the page SHALL show the toast "Couldn't save — try again", the control SHALL return to the
server's value, and later changes SHALL still be saved.

#### Scenario: Failed save on the detail page shows a toast and reverts
- **WHEN** the status save of a seeded want album fails and "Listened" was chosen, then the rating is set to 4 and the page reloaded
- **THEN** the toast "Couldn't save — try again" shows, the status pill returns to "Want to listen", and after the reload the rating still reads 4
- **proof:** e2e

#### Scenario: Failed save on the card shows a toast and reverts
- **WHEN** the progress save of an in-progress anime at episode 5 fails on `/animanga/anime` and + is pressed, then + is pressed again and the page reloaded
- **THEN** the toast "Couldn't save — try again" shows, the card returns to 5, and after the reload it reads 6
- **proof:** e2e

### Requirement: Rating
Media entries (albums, artists, songs, anime, manga, books) SHALL be ratable with a number from 0 to 10 inclusive with at most two decimal places (stored as whole hundredths), or unrated, clearable, shown on cards and on the entry page; unrated entries SHALL show no rating on cards. A rating of 0 is a rating, distinct from unrated. Values outside 0 to 10, with more than two decimals or not finite SHALL be rejected with "Rating must be between 0 and 10 with up to two decimals" and leave the stored value unchanged. Fashion entries SHALL have no rating. On the entry page the rating SHALL be one typed text field named "Rating" (decimal keypad hint, never `type="number"`, no slider) with spin-button semantics (`role="spinbutton"`, `aria-valuemin` 0, `aria-valuemax` 10, `aria-valuenow`, `aria-valuetext` "<n> of 10"), round step buttons "Rating: one less" and "Rating: one more" beside the typed figure (step 0.25, clamped to 0 and 10, from unrated the first step-up gives 0.25; disabled at 0 and 10) and "Clear rating" when rated — a deliberate exception to the fingerprint's "no stepper arrows" rule, filed with Design-System (gate 4); typing any valid value such as 8.75 stays possible; ArrowUp/ArrowDown step by 0.25, Home and End move the text cursor; a valid value saves when committed (Enter or leaving the field) through the ordered write queue; an invalid value shows the message inline and saves nothing. Cards SHALL show the value as "<n> / 10" with the accessible text "<n> of 10". No star display or star adapter SHALL remain.

#### Scenario: Rating accepts 0 to 10 with two decimals
- **WHEN** `setRating` is called with 8.75, then with 0, 10, 8.755, -0.01, 10.01 and NaN
- **THEN** 8.75, 0 and 10 are each stored, and the other three throw a ValidationError leaving 10
- **proof:** unit

#### Scenario: Create and update accept the full rating range
- **WHEN** `createEntry` is called with rating 8.75 and `updateEntry` with 0, 7 and 10, then each with -0.01, 10.01, 8.755 and NaN
- **THEN** the first four are stored and the last four throw a ValidationError leaving 10
- **proof:** unit

#### Scenario: Rating is stored in whole hundredths
- **WHEN** `setRating` is called with 8.75 and with 0.1 + 0.2
- **THEN** the stored integers are 875 and 30 and `getEntry` returns 8.75 and 0.3
- **proof:** unit

#### Scenario: Migration converts star ratings
- **WHEN** the rating migration runs on a database holding a 4.5-star album (`rating_x2` 9), a half-star book (`rating_x2` 1) and an unrated song
- **THEN** after it `getEntry` returns 9, 1 and null, and the `rating_x2` column is gone
- **proof:** unit

#### Scenario: Clearing keeps 0 distinct from unrated
- **WHEN** an entry is rated 0 and `setRating(id, null)` is then called
- **THEN** `getEntry` returns 0 first and null after
- **proof:** unit

#### Scenario: Type a rating with two decimals
- **WHEN** "8.75" is typed into the Rating field of a seeded album's entry page and Enter is pressed, the saves are awaited and the page reloaded
- **THEN** the field shows 8.75, its `aria-valuenow` is 8.75 and its `aria-valuetext` is "8.75 of 10"
- **proof:** e2e

#### Scenario: Steps and arrow keys change the rating
- **WHEN** on a book rated 7 "Rating: one more" is pressed twice, then the field is focused, ArrowDown is pressed once and the field is left, and on an unrated book "Rating: one more" is pressed once
- **THEN** the first book shows 7.5 and then 7.25 and is stored as 7.25 after a reload, the second shows and stores 0.25, and every committed value was sent as one save
- **proof:** e2e

#### Scenario: Step buttons stop at the ends
- **WHEN** the entry page of an album rated 10 and of an album rated 0 is opened
- **THEN** "Rating: one more" is disabled on the first and "Rating: one less" on the second, and each button is at least 44×44 px at 390×844
- **proof:** e2e

#### Scenario: Too many decimals are rejected inline
- **WHEN** "8.755" is typed into the Rating field of an album rated 7 and Enter is pressed
- **THEN** "Rating must be between 0 and 10 with up to two decimals" shows next to the field, no save is sent, and after a reload the rating is still 7
- **proof:** e2e

#### Scenario: Clear the rating
- **WHEN** "Clear rating" is chosen on a rated album
- **THEN** the field is empty and after a reload the album is unrated
- **proof:** e2e

#### Scenario: Zero is a rating
- **WHEN** "0" is typed into the Rating field of an unrated album and committed, and the album's list is opened
- **THEN** after a reload the field shows 0 and the album's card shows "0 / 10"
- **proof:** e2e

#### Scenario: Rated entries show their rating on cards
- **WHEN** a list holds an album whose stored rating is 7.5
- **THEN** its card shows "7.5 / 10" with the accessible text "7.5 of 10"
- **proof:** e2e

#### Scenario: Unrated entries show no rating on cards
- **WHEN** a list holds an unrated album
- **THEN** its card shows no rating value
- **proof:** e2e

#### Scenario: No star adapter is left
- **WHEN** `src/` is searched after the build
- **THEN** no file is named `StarRating.svelte` and no code imports or defines `starsFromRating`
- **proof:** unit

