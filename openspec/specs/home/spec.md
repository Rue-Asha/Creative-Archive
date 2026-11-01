# home Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Home queries
The server SHALL provide the coverflow (the 20 most recently added entries of any type that have an image), the "In
progress" shelf (media entries with status in progress, most recently updated first), a "Recently added" shelf per
domain and the collections for the bento, omitting empty shelves.

#### Scenario: Coverflow takes the 20 newest entries with images
- **WHEN** 25 entries with images and 3 newer ones without are seeded
- **THEN** `coverflowEntries` returns 20 entries, newest first, all with images
- **proof:** unit

#### Scenario: In progress orders by last update
- **WHEN** three in-progress media entries are updated in the order B, C, A and a piece and a done album exist
- **THEN** `inProgress` returns A, C, B
- **proof:** unit

#### Scenario: Home shelves omit empty ones
- **WHEN** only books exist, none in progress
- **THEN** `homeShelves` returns exactly one shelf, "Recently added" for Books
- **proof:** unit

### Requirement: Home page
Home SHALL show a hero with Rue's home hero photo (or the home world's gradient without one), a headline in the display face and the
coverflow, then the "In progress" shelf, a "Recently added" shelf per domain and a collections bento of collages.
On a first run with an empty archive it SHALL show a welcoming empty state with "Add your first …" per domain and no
shelves; empty shelves SHALL be hidden.

#### Scenario: Home shows the hero photo and headline
- **WHEN** a home hero is seeded and `/` is opened
- **THEN** the hero image `src` is `/images/<hero id>` and the headline shows in the display face (Bricolage Grotesque)
- **proof:** e2e

#### Scenario: Home without hero photo shows the world gradient
- **WHEN** no home hero is set
- **THEN** the hero shows the home world's gradient background and no `<img>`
- **proof:** e2e

#### Scenario: Coverflow shows the most recent entries with images
- **WHEN** 22 entries with images are seeded
- **THEN** the coverflow counter reads "01 / 20" and its first card is the newest entry
- **proof:** e2e

#### Scenario: In progress shelf lists media in progress
- **WHEN** an anime watching, a book reading and an album listened are seeded
- **THEN** the "In progress" shelf shows the anime and the book only
- **proof:** e2e

#### Scenario: Recently added shelves per domain
- **WHEN** entries in Music and Fashion only are seeded
- **THEN** "Recently added" shelves for Music and Fashion show, none for Animanga or Books
- **proof:** e2e

#### Scenario: Collections bento shows collages
- **WHEN** two collections with images are seeded
- **THEN** the bento shows both with their collage and count, each linking to its page
- **proof:** e2e

#### Scenario: Empty archive shows a welcome per domain
- **WHEN** the archive is empty and `/` is opened
- **THEN** a welcome shows "Add your first" links for Music, Animanga, Books and Fashion, and no shelf, coverflow or bento renders
- **proof:** e2e

#### Scenario: Home looks like the approved mockup
- **WHEN** Rue opens Home with real data on phone and desktop
- **THEN** it matches the approved Home mockup's structure in the picked world
- **proof:** manual (visual judgement at Gate 2)

