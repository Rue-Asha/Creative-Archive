## MODIFIED Requirements

### Requirement: Settings page
`/settings` SHALL show one slot per world in the order Home, Music, Animanga, Books, Fashion where Rue can upload, replace and remove the hero photo, with the same type and 16 MB checks and messages as entry images (a HEIC file reads "Unsupported image type"). A slot holding a photo SHALL offer Replace and Remove as equal choices (same button variant, neither the default action); a slot without one SHALL read "No photo yet" with "Upload". The explanation SHALL read "Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB." (fixed at gate 5; the upload accepts exactly these five types up to 16 MB) and be recorded in the contract (§4.9, §6). On the desktop the slots SHALL sit three to a row (Home, Music and Animanga, then Books and Fashion), and on the phone one to a row, never wider than the screen (source: Rue, gate 7, the signed hi-fi).

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
- **WHEN** a `.txt` file and then `fixtures/heic/sample.heic` are chosen in the Books slot
- **THEN** "Unsupported image type" shows in that slot each time and its hero is unchanged
- **proof:** e2e

#### Scenario: Oversize hero file shows an inline error
- **WHEN** a 17 MB file is chosen in the Animanga slot
- **THEN** "Image is larger than 16 MB" shows in that slot and nothing is uploaded
- **proof:** e2e

#### Scenario: Slots come in world order
- **WHEN** `/settings` is opened with no hero set
- **THEN** five slots named Home, Music, Animanga, Books and Fashion show in that order, each reading "No photo yet" with "Upload"
- **proof:** e2e

#### Scenario: Slots sit three to a row on desktop
- **WHEN** `/settings` is opened at 1280×800 and at 390×844
- **THEN** at 1280 Home, Music and Animanga share one top edge, Books and Fashion share a lower one with Books under Home; at 390 every slot has its own row; no slot reaches past the viewport's right edge
- **proof:** e2e

#### Scenario: Replace and Remove are equal choices
- **WHEN** the Music slot holds a seeded hero, at 390 and at 1280 px
- **THEN** Replace and Remove have the same computed background, border and height, neither is focused on load, and neither is the page's dark arrow pill
- **proof:** e2e

#### Scenario: Settings explanation matches the contract
- **WHEN** `/settings` is opened and the `### 4.9 \`/settings\`` section of `docs/functional-contract.md` is read
- **THEN** the page's explanation reads "Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB.", equals the wording recorded in that §4.9 section and no longer mentions a theme gradient
- **proof:** e2e
