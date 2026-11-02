## MODIFIED Requirements

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
page SHALL show the total.

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
- **THEN** in that card −, the value button and + are each at least 44 × 44 px, each lies inside the card's box, the "/ 28" text is not visible and the value button is named "Episodes 12 of 28"
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
