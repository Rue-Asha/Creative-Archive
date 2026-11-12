## MODIFIED Requirements

### Requirement: Domain landing pages
`/music`, `/animanga`, `/books` and `/fashion` SHALL show the domain hero (its uploaded photo, or its world's gradient
without one) in the domain's world, sub-type tabs (Music: Albums / Artists / Songs; Animanga: Anime / Manga; Books:
Books; Fashion: Brands & shops / Influencers / Pieces / Wardrobe / Looks) linking to the lists, an "Add" action that
lets Rue pick one of the domain's types, and the domain's shelves. Other paths SHALL answer 404.

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
- **THEN** a menu offers Brand or shop, Influencer, Piece and Look, and choosing Piece opens `/add/piece`
- **proof:** e2e

#### Scenario: Domain shelves show its entries
- **WHEN** two albums and an artist are seeded and `/music` is opened
- **THEN** shelves "Albums" and "Artists" show them, and no "Songs" shelf renders
- **proof:** e2e

#### Scenario: Unknown domain answers 404
- **WHEN** `/podcasts` is opened
- **THEN** the response status is 404
- **proof:** e2e
