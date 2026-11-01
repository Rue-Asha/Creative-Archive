## ADDED Requirements

### Requirement: Album and song link to an artist
Albums and songs SHALL store an artist name and an optional link to one Artist entry. The detail page SHALL show the
name as a link to the artist when linked and as plain text otherwise. An artist's detail page SHALL list the linked
albums and songs from the archive. Deleting an artist SHALL clear the link on its albums and songs and keep their
artist name text.

#### Scenario: Album links to its artist
- **WHEN** the detail page of a seeded album linked to the artist "Frank Ocean" is opened
- **THEN** "Frank Ocean" is a link to that artist's `/entries/<id>`
- **proof:** e2e

#### Scenario: Unlinked artist name shows as text
- **WHEN** the detail page of a seeded song with artist name "SZA" and no link is opened
- **THEN** "SZA" shows as plain text, not a link
- **proof:** e2e

#### Scenario: Artist lists linked albums and songs
- **WHEN** the detail page of an artist with two linked albums and one linked song is opened
- **THEN** it shows a shelf with those two albums and the song, and no unlinked entry
- **proof:** e2e

#### Scenario: Deleting an artist keeps the name text
- **WHEN** `deleteEntry` deletes an artist linked from an album and a song
- **THEN** both keep `artistName` "Frank Ocean" and have `artistId` null
- **proof:** unit

### Requirement: Artist matching on autofill
Saving an album or song picked from Deezer with "Add artist" ticked (the default) SHALL link the existing Artist entry
with the same Deezer id, or else create one with status none and the Deezer photo. Unticking "Add artist" SHALL store
the artist name as text only. Two artists with the same name and different Deezer ids SHALL stay separate entries.

#### Scenario: Ensure artist reuses the same Deezer id
- **WHEN** `ensureArtist` is called twice with Deezer id `100` and name "Frank Ocean"
- **THEN** the first call returns `created: true`, the second the same id with `created: false`, and one artist exists
- **proof:** unit

#### Scenario: Same name with different Deezer ids stays separate
- **WHEN** `ensureArtist` is called with name "Nova" and Deezer ids `201` and `202`
- **THEN** two artist entries named "Nova" exist
- **proof:** unit

#### Scenario: Autofill creates the artist with status none and photo
- **WHEN** "Blonde" is searched on `/add/album`, the result picked and saved with "Add artist" ticked
- **THEN** the album links to a new artist "Frank Ocean" whose status is "No status" and whose image is stored locally
- **proof:** e2e

#### Scenario: Autofill links an existing artist
- **WHEN** an artist "Frank Ocean" with the fake Deezer id `fake-ar-1` is seeded and the track "Nikes" is added by search
- **THEN** the song links to the seeded artist and still exactly one "Frank Ocean" artist exists
- **proof:** e2e

#### Scenario: Unticking Add artist stores the name only
- **WHEN** "Blonde" is picked, "Add artist" unticked and saved
- **THEN** the album shows "Frank Ocean" as plain text and no artist entry exists
- **proof:** e2e

### Requirement: Artist on manual entry
The manual album and song form SHALL offer picking an existing artist (by name) or typing a name that is stored as
text only, without creating an artist.

#### Scenario: Manual entry picks an existing artist
- **WHEN** an artist "Solange" is seeded, the manual album form's artist field gets "Sol" and the suggestion "Solange" is chosen
- **THEN** the reopened edit form shows "Solange" as a linked artist chip (`data-linked`)
- **proof:** e2e

#### Scenario: Manual entry types an artist as text only
- **WHEN** the manual song form's artist field gets "Unknown Band" with no suggestion chosen and is saved
- **THEN** the reopened edit form shows "Unknown Band" as text without `data-linked`, and `GET /__test/counts` reports one entry
- **proof:** e2e
