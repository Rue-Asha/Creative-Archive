## MODIFIED Requirements

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
