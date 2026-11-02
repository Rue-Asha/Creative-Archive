## MODIFIED Requirements

### Requirement: Settings page
`/settings` SHALL show one slot per world (Home, Music, Animanga, Books, Fashion) where Rue can upload, replace and
remove the hero photo, with the same type and 16 MB checks and messages as entry images. A slot holding a photo SHALL
show Replace and Remove side by side in one button variant.

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

#### Scenario: Replace and Remove sit side by side in one style
- **WHEN** the Music slot holds a seeded hero, at 390 and at 1280 px
- **THEN** Replace and Remove have tops within 2 px of each other, Remove starts right of Replace, and both have the same computed background, border and height
- **proof:** e2e
