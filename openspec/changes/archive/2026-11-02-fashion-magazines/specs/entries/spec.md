## MODIFIED Requirements

### Requirement: Generic entry model and type config
All 12 types (Album, Artist, Song, Anime, Manga, Book, Brand, Shop/Site, Influencer, Magazine, Piece, Look) SHALL be
stored in one `entries` table and described by one per-type config (`TYPES`) that declares domain, labels, list slug,
title label, fields, artist link, status kind, ratability, progress keys, provider and URL preview, so that create,
edit, detail and list code is shared. Fields per type SHALL be as in scope S10 (design.md → Type config); magazine has
the influencer's config apart from its type, labels and slug.

#### Scenario: Every type has a complete config
- **WHEN** `TYPES` is read
- **THEN** it has exactly the 12 types; media types have `status: 'media'` and `ratable: true`; piece has `status: 'piece'`; brand, site, influencer, magazine and look have neither; anime has progress `['episodes']`, manga `['chapters', 'volumes']`; album and song have `artist: true`; brand, site, influencer, magazine and piece have `preview: true`; magazine has domain fashion, label "Magazine", plural "Magazines", slug `magazines`, title label "Name", fields `['handles']` and provider null
- **proof:** unit

#### Scenario: Each list slug resolves to its type
- **WHEN** `typeBySlug` is called for every domain's slugs and for an unknown slug
- **THEN** each slug returns its type (fashion `wardrobe` returns piece with status owned via `LISTS`, fashion `magazines` returns magazine) and the unknown slug returns null
- **proof:** unit

## ADDED Requirements

### Requirement: Magazine type
Magazine entries SHALL behave exactly as influencer entries (name and handles, no status, rating or progress, URL
preview with handle prefill) and SHALL appear wherever the generic config lists Fashion types: the Fashion Add menu,
`/add/magazine`, the list `/fashion/magazines` with the generic empty state, the Fashion domain shelves, the Home
"Recently added · Fashion" shelf and collections. The Fashion welcome line on an empty Home SHALL read "Brands, shops,
magazines, pieces you own and looks you keep."

#### Scenario: Create a magazine from the Add menu
- **WHEN** on `/fashion` "Add" → "Magazine" is chosen, the name "Vestoj" and the Instagram handle "vestoj" are entered and saved
- **THEN** the browser lands on `/entries/<id>` showing "Vestoj" and the handle, `/fashion/magazines` shows exactly that card, and Home's "Recently added · Fashion" shelf shows it
- **proof:** e2e

#### Scenario: Magazine form shows the influencer fields
- **WHEN** `/add/magazine?manual=1` is opened
- **THEN** it shows Name and the Instagram, TikTok, YouTube and Website handle fields, and no status, rating or progress control
- **proof:** e2e

#### Scenario: Empty magazines list offers Add
- **WHEN** `/fashion/magazines` is opened with no magazines
- **THEN** no card shows and the empty state's "Add" link points to `/add/magazine`
- **proof:** e2e

#### Scenario: Magazine joins a collection
- **WHEN** a magazine is created and added to a collection
- **THEN** that collection's entries include the magazine
- **proof:** unit

#### Scenario: Fashion welcome names magazines
- **WHEN** the archive is empty and `/` is opened
- **THEN** the Fashion welcome card reads "Brands, shops, magazines, pieces you own and looks you keep." and its link still points to `/add/piece`
- **proof:** e2e
