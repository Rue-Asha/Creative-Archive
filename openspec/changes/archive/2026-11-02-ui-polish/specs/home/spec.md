## MODIFIED Requirements

### Requirement: Home page
Home SHALL show a hero with Rue's home hero photo (or the home world's gradient without one), a headline in the display face and the
coverflow, then the "In progress" shelf, a "Recently added" shelf per domain and a collections bento of collages.
The bento SHALL feature (as its large tile, placed first) the first collection that has images; a collection without
images SHALL never be the large tile, and when no collection has images every tile SHALL have the same size. Without
collections no bento SHALL render. On a first run with an empty archive it SHALL show a welcoming empty state with
"Add your first …" per domain and no shelves; empty shelves SHALL be hidden.

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

#### Scenario: Bento features the first collection with images
- **WHEN** the collections "Empty one" (no entries), "Late Night" (entries with images) and "Summer" (entries with images) are seeded in that order and `/` is opened on desktop
- **THEN** the first and largest bento tile (spanning two columns and two rows) is "Late Night", and "Empty one" is a regular-size tile
- **proof:** e2e

#### Scenario: Bento without images features no collection
- **WHEN** only collections whose entries have no images are seeded and `/` is opened on desktop
- **THEN** every bento tile has the same size
- **proof:** e2e

#### Scenario: Home without collections shows no bento
- **WHEN** entries but no collections are seeded and `/` is opened
- **THEN** no collections bento renders
- **proof:** e2e

#### Scenario: Empty archive shows a welcome per domain
- **WHEN** the archive is empty and `/` is opened
- **THEN** a welcome shows "Add your first" links for Music, Animanga, Books and Fashion, and no shelf, coverflow or bento renders
- **proof:** e2e

#### Scenario: Home looks like the approved mockup
- **WHEN** Rue opens Home with real data on phone and desktop
- **THEN** it matches the approved Home mockup's structure in the picked world
- **proof:** manual (visual judgement at Gate 2)
