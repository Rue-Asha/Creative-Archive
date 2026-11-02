## MODIFIED Requirements

### Requirement: Domain shelves
The server SHALL provide a domain's shelves: an "In progress" shelf for media domains, then a "Recently added" shelf
per type in the domain's type order (`TYPES_BY_DOMAIN`; Fashion: Brands, Shops, Influencers, Magazines, Pieces,
Looks), omitting empty shelves.

#### Scenario: Domain shelves group recent entries by type
- **WHEN** a watching anime, two manga and no other animanga entries exist
- **THEN** `domainShelves('animanga')` returns "In progress" with the anime, "Anime" with the anime and "Manga" with both manga
- **proof:** unit

#### Scenario: Fashion shelves follow the type order
- **WHEN** one entry of each Fashion type (brand, site, influencer, magazine, piece, look) is seeded
- **THEN** `domainShelves('fashion')` titles read Brands, Shops, Influencers, Magazines, Pieces, Looks
- **proof:** unit

### Requirement: Domain landing pages
`/music`, `/animanga`, `/books` and `/fashion` SHALL show the domain hero (its uploaded photo, or its world's gradient
without one) in the domain's world, sub-type tabs (Music: Albums / Artists / Songs; Animanga: Anime / Manga; Books:
Books; Fashion: Wardrobe / Pieces / Looks / Brands / Shops / Influencers / Magazines, grouped as in Grouped sub-type
tabs) linking to the lists, an "Add" action that lets Rue pick one of the domain's types (Fashion: Brand, Shop/Site,
Influencer, Magazine, Piece, Look), and the domain's shelves. Other paths SHALL answer 404.

#### Scenario: Domain page shows its hero photo
- **WHEN** a music hero is seeded and `/music` is opened
- **THEN** the hero image `src` is `/images/<hero id>`
- **proof:** e2e

#### Scenario: Domain without hero photo shows the theme gradient
- **WHEN** no books hero is set and `/books` is opened
- **THEN** the hero shows the books world's gradient and no `<img>`
- **proof:** e2e

#### Scenario: Sub-type tabs per domain
- **WHEN** each domain page is opened
- **THEN** the tabs read exactly as listed above in that order and each links to `/<domain>/<slug>`
- **proof:** e2e

#### Scenario: Add offers the domain's types
- **WHEN** "Add" is chosen on `/fashion`
- **THEN** a menu offers Brand, Shop/Site, Influencer, Magazine, Piece and Look, and choosing Magazine opens `/add/magazine`
- **proof:** e2e

#### Scenario: Domain shelves show its entries
- **WHEN** two albums and an artist are seeded and `/music` is opened
- **THEN** shelves "Albums" and "Artists" show them, and no "Songs" shelf renders
- **proof:** e2e

#### Scenario: Unknown domain answers 404
- **WHEN** `/podcasts` is opened
- **THEN** the response status is 404
- **proof:** e2e

## ADDED Requirements

### Requirement: Grouped sub-type tabs
The sub-tab bar SHALL render a domain's lists in the groups its list config (`LIST_GROUPS`) declares, inside the one
`nav` named "Sub-types". Fashion SHALL declare "My things" (Wardrobe, Pieces, Looks) and then "Discover" (Brands,
Shops, Influencers, Magazines); Music, Animanga and Books SHALL declare one unlabelled group and render their tabs flat
exactly as before, with no group, caption or divider. A labelled group SHALL be an element with `role="group"` named
by its visible caption (`aria-labelledby`); the caption SHALL sit at the inline start of its tabs, SHALL NOT be a link
or focusable, and SHALL use `--t-small` and the hero's on-photo colour token. A decorative divider (`aria-hidden`)
SHALL separate the groups: below 1024 px the groups stack with a horizontal divider between them, from 1024 px they sit
in one row with a vertical divider. The tabs keep their chip style (glass, at least 40 px tall) and none carries
`aria-current`, as before; the bar SHALL NOT overflow the page horizontally at 390 or 1280 px.

#### Scenario: Fashion tabs come in two labelled groups
- **WHEN** `/fashion` is opened
- **THEN** inside the "Sub-types" navigation the group "My things" holds the links Wardrobe, Pieces, Looks and the group "Discover" holds Brands, Shops, Influencers, Magazines; both captions are visible, neither is a link, and exactly one `aria-hidden` divider sits between the groups
- **proof:** e2e

#### Scenario: Fashion list config declares the groups
- **WHEN** `LIST_GROUPS` and `LISTS` are read
- **THEN** fashion has the groups "My things" (wardrobe, pieces, looks) and "Discover" (brands, shops, influencers, magazines); music, animanga and books each have one group with label null; and every domain's `LISTS` equals its groups' lists in order
- **proof:** unit

#### Scenario: Other domains keep a flat tab bar
- **WHEN** `/music`, `/animanga` and `/books` are opened
- **THEN** their "Sub-types" navigation contains no `role="group"`, no caption and no divider, and every tab link is a direct child of the navigation
- **proof:** e2e

#### Scenario: Group captions use the type scale and colour tokens
- **WHEN** `/fashion` is opened at 390 px and at 1280 px
- **THEN** each caption's computed font size equals the resolved `--t-small` of the root (13 px), its computed colour equals the hero eyebrow's (`--on-photo`), its `text-transform` is `none`, and its `transition-property` contains no `clip-path`
- **proof:** e2e

#### Scenario: Grouped tabs keep the chip style
- **WHEN** `/fashion` and `/music` are opened
- **THEN** every Fashion tab link has the same computed font size, min-height, border-radius and backdrop-filter as the Music tab links, is at least 40 px tall, and none carries `aria-current`
- **proof:** e2e

#### Scenario: Grouped tabs fit the phone
- **WHEN** `/fashion` is opened at 390 px
- **THEN** the document's and the navigation's `scrollWidth` are at most their `clientWidth`, "Discover" starts below the bottom of "My things", the divider is wider than tall and lies between them, each group's links lie inside that group's box and inside the viewport, and every tab link is at least 40 px tall
- **proof:** e2e

#### Scenario: Grouped tabs sit in one row on desktop
- **WHEN** `/fashion` is opened at 1280 px
- **THEN** all seven tab links share one top (within 1 px), "Discover" starts right of "My things" with the divider (taller than wide) between them, the Add button's vertical centre is within 2 px of the tabs' centre, and the navigation's `scrollWidth` is at most its `clientWidth`
- **proof:** e2e

#### Scenario: Grouped tabs read well
- **WHEN** Rue looks at `/fashion` on phone and desktop in the verifier's screenshots
- **THEN** she accepts the group wording ("My things" / "Discover"), the captions and the divider
- **proof:** manual (wording and look are taste, risk R3; judged at Gate 2)
