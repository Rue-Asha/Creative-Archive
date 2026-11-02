## MODIFIED Requirements

### Requirement: Media status with dated events
Album, Artist, Song, Anime, Manga and Book entries SHALL have a status none | want | in progress | done | dropped,
labelled per domain (Music: Want to listen / Listening / Listened; Anime: Plan to watch / Watching / Watched; Manga
and Books: Want to read / Reading / Read; all: Dropped; none: No status). Every change of status SHALL store one
status event with the new status and the time; setting the current status again SHALL store nothing. Creating a media
entry with a status other than none SHALL store its first event. Pieces SHALL have wishlist | owned | gone without
events; brands, shops, influencers, magazines and looks SHALL have no status.

#### Scenario: Changing status stores a dated event
- **WHEN** `setStatus` moves a seeded album from want to done
- **THEN** it returns true, the album's status is done, and `statusEvents` ends with one `done` event whose `at` is the current time
- **proof:** unit

#### Scenario: Setting the same status again stores no event
- **WHEN** `setStatus` sets a book that is already reading to reading
- **THEN** it returns false and the number of status events is unchanged
- **proof:** unit

#### Scenario: New entry with a status stores its first event
- **WHEN** `createEntry` creates an anime with status want, and another with status none
- **THEN** the first has one `want` event and the second has none
- **proof:** unit

#### Scenario: Status none is allowed
- **WHEN** `setStatus` sets an artist from listened to none
- **THEN** the status is none and one `none` event is stored
- **proof:** unit

#### Scenario: Invalid status for a type is rejected
- **WHEN** `setStatus` gives a brand or a magazine any status, or a piece the status want
- **THEN** it throws a ValidationError and nothing changes
- **proof:** unit

#### Scenario: Status labels follow the domain
- **WHEN** the status pill menu is opened on the detail pages of an album, an anime, a manga and a book
- **THEN** they list "Want to listen, Listening, Listened, Dropped", "Plan to watch, Watching, Watched, Dropped", "Want to read, Reading, Read, Dropped" and the same for the book, each plus "No status"
- **proof:** e2e

#### Scenario: Set status from the detail page
- **WHEN** "Listened" is chosen in a seeded album's status pill
- **THEN** the pill shows "Listened" and after a reload it still does
- **proof:** e2e

#### Scenario: Set a piece status from the detail page
- **WHEN** "Owned" is chosen in a seeded piece's status pill
- **THEN** the pill shows "Owned" after a reload
- **proof:** e2e

#### Scenario: Fashion entries without status or rating show no controls
- **WHEN** the detail pages of a seeded brand, a seeded magazine and a seeded look are opened
- **THEN** none of them shows a status pill or a star rating
- **proof:** e2e
