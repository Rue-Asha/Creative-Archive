# domain-pages Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Domain shelves
The server SHALL provide a domain's shelves: an "In progress" shelf for media domains, then a "Recently added" shelf per sub-type list in the order the "Sub-types" navigation shows them (`LIST_GROUPS`; Fashion: Wardrobe, Pieces, Looks, then Brands & shops, Influencers, Magazines, so the shelves follow "My things" before "Discover" as the kicker and the signed-off hi-fi do), each shelf holding its list's entries (Wardrobe the owned pieces; the one "Brands & shops" shelf both stored types brand and site) and linking to its list (`/<domain>/<slug>`), omitting empty shelves.

#### Scenario: Domain shelves group recent entries by type
- **WHEN** a watching anime, two manga and no other animanga entries exist
- **THEN** `domainShelves('animanga')` returns "In progress" with the anime, "Anime" with the anime and "Manga" with both manga
- **proof:** unit

#### Scenario: Fashion shelves follow the sub-type order
- **WHEN** one entry of each Fashion type (brand, site, influencer, magazine, an owned piece, look) is seeded
- **THEN** `domainShelves('fashion')` titles read Wardrobe, Pieces, Looks, Brands & shops, Influencers, Magazines, and Wardrobe links to `/fashion/wardrobe`
- **proof:** unit

#### Scenario: Wardrobe holds only owned pieces
- **WHEN** an owned and a wishlist piece are seeded
- **THEN** the "Wardrobe" shelf holds the owned piece with count 1 and the "Pieces" shelf holds both with count 2; with only the wishlist piece no "Wardrobe" shelf exists
- **proof:** unit

#### Scenario: One shelf holds brands and shops
- **WHEN** a brand, a shop and a site are seeded and `domainShelves('fashion')` is read
- **THEN** exactly one shelf "Brands & shops" holds all three with count 3 and href `/fashion/brands-shops`, and no "Brands" or "Shops" shelf exists
- **proof:** unit

### Requirement: Domain landing pages
`/music`, `/animanga`, `/books` and `/fashion` SHALL show, in the domain's world, the domain's night banner (its hero photo full bleed under the world's veil, the type light at the banner's foot, or the flat night band without one; Source: Rue, gate 7, 2026-11-17, direction B; fingerprint 2.1.0.), the sub-type navigation named "Sub-types" (Music: Albums / Artists / Songs; Animanga: Anime / Manga; Books: Books; Fashion: Wardrobe / Pieces / Looks / Brands & shops / Influencers / Magazines) linking to the lists, placed below the title and its lede, as it is on every list page of the domain (Rue, gate 7, 2026-11-17), an "Add" menu named "Add to <Domain>" with the domain's types (Fashion: Brand or shop as one item, Influencer, Magazine, Piece, Look), the "In progress" shelf (media domains, only when something is in progress) and one shelf per sub-type that has entries, each with its count and "See all" to its list. An empty domain SHALL keep the sub-types and Add and show an empty state instead of shelves; an empty sub-type SHALL have no shelf. The charcoal key-facts card ("<Domain> key facts": entries, in progress on media domains, sub-types) SHALL sit beside the title from 768 px and after the last shelf on the phone (Rue 2026-11-16), and an empty domain SHALL show none. Other paths SHALL answer 404.

#### Scenario: Domain page shows its hero photo
- **WHEN** a music hero is seeded and `/music` is opened
- **THEN** the frame's stage photo `src` is `/images/<hero id>`
- **proof:** e2e

#### Scenario: Domain without hero photo shows the colour field
- **WHEN** no books hero is set and `/books` is opened
- **THEN** the app root carries `data-backdrop="field"`, no stage photo renders and no `/images/` request is made for a hero; the head sits on the flat night band (layout "A world without a hero photo shows the flat night band"): the frame's band is the flat Books night (`#16252A`, no gradient) at least as tall as the head
- **proof:** e2e

#### Scenario: Sub-type tabs per domain
- **WHEN** each domain page is opened
- **THEN** the "Sub-types" navigation reads exactly as listed above in that order and each item links to `/<domain>/<slug>`
- **proof:** e2e

#### Scenario: Sub-types sit below the title
- **WHEN** each domain page and each list page of each domain is opened at 390 and 1280 px
- **THEN** the "Sub-types" navigation's top edge lies below the bottom edge of the page's `h1` and of its lede, and it follows the `h1` in the DOM (source: Rue, gate 7, 2026-11-17)
- **proof:** e2e

#### Scenario: Sub-type links show their counts
- **WHEN** two albums and an artist are seeded and `/music` is opened
- **THEN** in the "Sub-types" navigation the links keep the names "Albums", "Artists" and "Songs", and each item shows its list's count as text after its link: 2, 1 and 0 (no count drawn by CSS from a `data-*` attribute; the list page's sub-type navigation shows none)
- **proof:** e2e

#### Scenario: Add offers the domain's types
- **WHEN** "Add" is chosen on `/fashion`
- **THEN** a menu "Add to Fashion" offers Brand or shop, Influencer, Magazine, Piece and Look, Brand or shop opens `/add/brand` and Magazine opens `/add/magazine`
- **proof:** e2e

#### Scenario: Domain shelves show its entries
- **WHEN** two albums and an artist are seeded and `/music` is opened
- **THEN** shelves "Albums" and "Artists" show them with their counts and "See all" links, and no "Songs" shelf renders
- **proof:** e2e

#### Scenario: Shelf counts name their type or entries
- **WHEN** two albums and an artist are seeded and `/music` is opened, then two anime and a manga and `/animanga` is opened
- **THEN** the "Albums" shelf reads "2 albums" and the "Artists" shelf "1 artist"; the "Anime" shelf reads "2 entries" and the "Manga" shelf "1 entry" (a type whose plural is its singular counts in entries; copy from `COPY.typeCount` and `COPY.entryCount`)
- **proof:** e2e

#### Scenario: In progress shelf on a media domain
- **WHEN** a watching anime and a done manga are seeded and `/animanga` and `/fashion` are opened
- **THEN** `/animanga` shows "In progress" with the anime only, and `/fashion` has no "In progress" shelf
- **proof:** e2e

#### Scenario: Empty domain keeps sub-types and Add
- **WHEN** the archive holds no books and `/books` is opened
- **THEN** the "Sub-types" navigation and "Add" are present, no shelf and no facts card render, and an empty state offers adding a book
- **proof:** e2e

#### Scenario: The facts card comes after the shelves on the phone
- **WHEN** an album is seeded and `/music` is opened on the phone
- **THEN** the "Music key facts" card is visible below the "Albums" shelf and only one such card is exposed
- **proof:** e2e

#### Scenario: The facts card sits beside the title on desktop
- **WHEN** an album is seeded and `/music` is opened on the desktop
- **THEN** the "Music key facts" card lies to the right of the title and above the first shelf
- **proof:** e2e

#### Scenario: Unknown domain answers 404
- **WHEN** `/podcasts` is opened
- **THEN** the response status is 404
- **proof:** e2e

#### Scenario: Domain page looks like the signed-off hi-fi
- **WHEN** Rue opens each domain page with real data on phone and desktop
- **THEN** it matches the gate-5 hi-fi of SC2
- **proof:** manual (visual judgement by Rue at gate 7)

### Requirement: Grouped sub-type tabs
The "Sub-types" navigation SHALL list a domain's lists as the fingerprint's `ul.kicker` in the order its list config (`LIST_GROUPS`) declares: Fashion as two labelled groups, "My things" (Wardrobe, Pieces, Looks) and "Discover" (Brands & shops, Influencers, Magazines), each a `role="group"` named by its caption with its own kicker (Rue 2026-11-16: Fashion keeps its captions, they help); Music, Animanga and Books as one unlabelled kicker with no group, caption or divider. No divider renders between groups. Captions SHALL use the fingerprint's overline size and the secondary ink; in a world's head, on the night stage, the secondary ink is the light one (`--ink-on-inverse-secondary`, like the kicker they head; Source: Rue, gate 7, 2026-11-17, direction B; fingerprint 2.1.0). Every sub-type link SHALL meet the fingerprint target size (44 px tall on touch), and the navigation SHALL NOT overflow the page horizontally at 320, 390 or 1280 px. A wrapped line of sub-types, on the domain page and in a list's head, SHALL open with a part, never with an orphan dash, and its lines SHALL sit one target apart with no extra gap (Rue, gate 7 re-verify, 2026-11-17).

#### Scenario: Fashion list config declares the groups
- **WHEN** `LIST_GROUPS` and `LISTS` are read
- **THEN** fashion has the groups "My things" (wardrobe, pieces, looks) and "Discover" (brands-shops, influencers, magazines); music, animanga and books each have one group with label null; and every domain's `LISTS` equals its groups' lists in order
- **proof:** unit

#### Scenario: Fashion tabs come in two labelled groups
- **WHEN** `/fashion` is opened
- **THEN** the "Sub-types" navigation holds the groups "My things" (Wardrobe, Pieces, Looks) and "Discover" (Brands & shops, Influencers, Magazines), their captions are visible and are not links, and no separator renders
- **proof:** e2e

#### Scenario: Other domains keep a flat tab bar
- **WHEN** `/music`, `/animanga` and `/books` are opened
- **THEN** their "Sub-types" navigation contains one kicker and no `role="group"`, no caption and no separator
- **proof:** e2e

#### Scenario: Group captions use the type scale and colour tokens
- **WHEN** `/fashion` is opened
- **THEN** both captions have the computed font size of `--type-overline-size` and, on Fashion's night stage, the computed colour of `--ink-on-inverse-secondary`, the same colour as the kicker items they head
- **proof:** e2e

#### Scenario: Wrapped sub-types never open a line on a dash
- **WHEN** `/fashion` and `/fashion/wardrobe` are opened at 375 px without a fashion hero
- **THEN** at least one kicker line wraps, every wrapped line opens with its link's text at the kicker's start edge, sits at most 44 px below the line before it, and nothing light is painted in the gap before it
- **proof:** e2e

#### Scenario: Sub-types fit the phone
- **WHEN** `/fashion` is opened at 320×640 and 390×844
- **THEN** the document's and the navigation's `scrollWidth` are at most their `clientWidth`, every sub-type link lies inside the viewport and is at least 44 px tall
- **proof:** e2e

