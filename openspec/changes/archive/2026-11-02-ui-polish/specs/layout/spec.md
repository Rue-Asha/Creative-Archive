## MODIFIED Requirements

### Requirement: Navigation
Every app screen SHALL show a floating glass pill nav with Home, Music, Animanga, Books, Fashion and Collections plus a
Settings button: centred at the top from 1024 px, at the bottom below 1024 px, with content padded clear of it. The
item of the current section SHALL be marked (`aria-current="page"`); an entry's detail, edit and add pages SHALL mark
their type's domain. On the phone tab bar every label SHALL use the eyebrow size and fit inside its item with room on
both sides, and the active item's highlight SHALL be a stadium at least 64 px wide.

#### Scenario: Desktop shows the top pill nav
- **WHEN** any app screen is open on desktop
- **THEN** the nav's top edge is within 32 px of the viewport top and it is horizontally centred on the content column
- **proof:** e2e

#### Scenario: Phone shows the bottom pill nav
- **WHEN** any app screen is open on phone
- **THEN** the nav's bottom edge is within 32 px of the viewport bottom and every nav item is at least 44 px tall
- **proof:** e2e

#### Scenario: Phone tab bar labels have room
- **WHEN** `/animanga` and then `/collections` are opened at 390 px
- **THEN** every tab label has the computed font size of `--t-eyebrow`, no label overflows its item (scrollWidth ≤ clientWidth), the active label's text is at least 4 px inside the active highlight on both sides, the "Collections" item is at least 4 px inside the bar, and the active highlight is at least 64 px wide
- **proof:** e2e

#### Scenario: Nav marks the current section
- **WHEN** `/`, `/music`, `/fashion/pieces` and `/collections` are opened in turn
- **THEN** Home, Music, Fashion and Collections respectively carry `aria-current="page"`
- **proof:** e2e

#### Scenario: Entry pages mark their domain
- **WHEN** `/entries/<id>` of a seeded manga is opened
- **THEN** Animanga carries `aria-current="page"`
- **proof:** e2e

#### Scenario: Content clears the bottom nav on phone
- **WHEN** a long page is scrolled to its end on phone
- **THEN** the last element of `<main>` ends above the nav's top edge
- **proof:** e2e

#### Scenario: Active section follows the path
- **WHEN** `activeSection` is given `/` (world home), `/books/books` (books), `/entries/3` (animanga), `/add/piece` (fashion), `/collections/2` (home) and `/settings` (home)
- **THEN** it returns home, books, animanga, fashion, collections and settings
- **proof:** unit

### Requirement: One alignment rule and desktop width
Every main screen (Home, domain pages, lists, detail, add/edit, collections index and page, settings) SHALL follow the
alignment rule in design.md → Visual brief: one centred column of at most 1200 px with 16 px side gutters on phone
and 40 px from 1280 px; page headers and section headings start at the column's left edge; only full-bleed heroes, the
detail backdrop and the nav leave the column. At 1280 px screens SHALL use the width (multi-column grids, bento,
two-column detail and add) rather than a stretched phone column, and no screen SHALL scroll horizontally on phone. The
desktop sticky shelf head's glass bar SHALL reach out around the head with balanced padding while the heading text
stays on the column edge.

#### Scenario: Real screens share one alignment rule
- **WHEN** each main screen is opened with seeded data at 390 and 1280 px
- **THEN** its page header and every section heading start at the same x as the content column's left edge (16 px on phone, (1280 − 1200) / 2 on desktop)
- **proof:** e2e

#### Scenario: Sticky shelf head keeps the heading on the column edge
- **WHEN** a domain page with a shelf is opened at 1280 px
- **THEN** the shelf heading starts at the column's left edge (within 1 px), and the head's glass bar (`::before`) has equal computed top and bottom insets and a left inset of at least 16 px outside the heading
- **proof:** e2e

#### Scenario: Desktop uses the width
- **WHEN** a list with 10 albums, a detail page, Home and the collections index are opened at 1280 px
- **THEN** the list shows at least 4 cards in its first row, the detail page shows the cover and the glass panel side by side, Home's collections bento has at least 3 columns and the index at least 3 collage cards per row
- **proof:** e2e

#### Scenario: No horizontal page scroll on phone
- **WHEN** each main screen is opened at 390 px with long seeded titles
- **THEN** `document.documentElement.scrollWidth` equals the viewport width
- **proof:** e2e

#### Scenario: Desktop layouts look composed
- **WHEN** Rue looks at every main screen at 1280 px and at phone size
- **THEN** desktop uses the width without large empty areas and matches the approved mockups' structure
- **proof:** manual (visual judgement at Gate 2, from the verifier's screenshots)
