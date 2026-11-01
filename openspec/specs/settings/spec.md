# settings Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Hero photo store
The server SHALL keep at most one hero image per world (home, music, animanga, books, fashion); setting a new one
SHALL delete the previous image row, removing one SHALL delete its row.

#### Scenario: Setting a hero replaces the old image
- **WHEN** `setHero('music', a)` and then `setHero('music', b)` run
- **THEN** `getHeroes().music` is b and image a no longer exists
- **proof:** unit

#### Scenario: Removing a hero deletes its image
- **WHEN** `removeHero('home')` runs after a home hero was set
- **THEN** `getHeroes().home` is undefined and its image row is gone
- **proof:** unit

### Requirement: Settings page
`/settings` SHALL show one slot per world (Home, Music, Animanga, Books, Fashion) where Rue can upload, replace and
remove the hero photo, with the same type and 16 MB checks and messages as entry images.

#### Scenario: Upload a hero photo for Home
- **WHEN** a mockup photo is uploaded in the Home slot on `/settings`
- **THEN** the slot shows an image whose `src` is `/images/<id>`, and after a reload it still does
- **proof:** e2e

#### Scenario: Replace a domain hero photo
- **WHEN** a seeded music hero is replaced with another photo in the Music slot
- **THEN** the slot shows an image with a new id and the old image URL answers 404
- **proof:** e2e

#### Scenario: Remove a hero photo
- **WHEN** "Remove" is used in the Fashion slot that holds a hero
- **THEN** the slot shows its empty state after a reload and the old image URL answers 404
- **proof:** e2e

#### Scenario: Unsupported hero file shows an inline error
- **WHEN** a `.txt` file is chosen in the Books slot
- **THEN** "Unsupported image type" shows in that slot and its hero is unchanged
- **proof:** e2e

#### Scenario: Oversize hero file shows an inline error
- **WHEN** a 17 MB file is chosen in the Animanga slot
- **THEN** "Image is larger than 16 MB" shows in that slot and nothing is uploaded
- **proof:** e2e

