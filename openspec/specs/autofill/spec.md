# autofill Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Provider interface and parsers
Search autofill SHALL go through one `Provider` interface: Deezer for albums (incl. EPs), artists and tracks, AniList
GraphQL for anime and manga, Open Library for books, all keyless, each built on an injected JSON fetcher with a 5 s
timeout. Each provider SHALL map its payload to `SearchResult`s with cover URL, title, creator, year and the type's
details; unknown AniList totals SHALL stay null; Open Library author names SHALL be kept as given. Parsers SHALL be
unit-tested on recorded JSON fixtures in the shapes listed in design.md, never against the network.

#### Scenario: Deezer album results map to drafts
- **WHEN** the Deezer provider parses `deezer-search-album.json` enriched with `deezer-album.json`
- **THEN** the first result is "Blonde" by "Frank Ocean", year 2016, record type album, 17 tracks, the `cover_xl` URL, and artist `{ externalId, name: 'Frank Ocean', imageUrl: picture_xl }`
- **proof:** unit

#### Scenario: EP record type maps to EP
- **WHEN** the Deezer provider parses the fixture's result with `record_type: "ep"`
- **THEN** its details have `recordType: 'ep'`
- **proof:** unit

#### Scenario: Failed album enrichment leaves the year empty
- **WHEN** the album lookup for one result fails while search succeeded
- **THEN** that result has `year: null` and the other results keep their years
- **proof:** unit

#### Scenario: Deezer artist results carry the photo
- **WHEN** the Deezer provider parses `deezer-search-artist.json`
- **THEN** each result has the artist name as title, `picture_xl` as cover and no year, and the two "Nova" results have different external ids
- **proof:** unit

#### Scenario: Deezer track results carry album and artist
- **WHEN** the Deezer provider parses `deezer-search-track.json` enriched with `deezer-album.json`
- **THEN** the result is "Nikes" by "Frank Ocean" with `albumTitle: 'Blonde'`, year 2016 and the album's cover
- **proof:** unit

#### Scenario: AniList anime maps episodes and year
- **WHEN** the AniList provider parses `anilist-anime-frieren.json`
- **THEN** the result has the English title, alt title "Sousou no Frieren", year 2023, episodes total 28 and the `extraLarge` cover
- **proof:** unit

#### Scenario: AniList null totals stay empty
- **WHEN** the AniList provider parses `anilist-manga-vagabond.json`
- **THEN** chapters and volumes totals are null (not 0) and the year comes from `startDate.year` 1998
- **proof:** unit

#### Scenario: AniList errors become a provider error
- **WHEN** the AniList fetcher returns `anilist-error.json`
- **THEN** `search` throws `ProviderError('failed')`
- **proof:** unit

#### Scenario: Open Library keeps the author in original script
- **WHEN** the Open Library provider parses `openlibrary-search.json`
- **THEN** the first result has creator "村上春樹", `authors: ['村上春樹']`, year 1987 and cover `https://covers.openlibrary.org/b/id/12345-L.jpg`
- **proof:** unit

#### Scenario: Open Library result without cover has no cover
- **WHEN** the same fixture's second doc is parsed
- **THEN** its `coverUrl` is null
- **proof:** unit

#### Scenario: Provider times out after 5 seconds
- **WHEN** a provider's fetcher never answers
- **THEN** `search` rejects with `ProviderError('timeout')` after 5 s (fake timers)
- **proof:** unit

#### Scenario: Real providers answer a live search
- **WHEN** Rue runs `npm run dev` and searches "Blonde" (album), "Frieren" (anime), "Vagabond" (manga) and "Norwegian Wood" (book)
- **THEN** each shows results with covers, and picking one prefills the form
- **proof:** manual (needs the real APIs over the network, which tests and CI never call; Gate 2)

### Requirement: Search, pick and prefill
For types with a provider, `/add/[type]` SHALL show a search field; typing SHALL be debounced (no request per
keystroke) and show results with cover, title, creator and year. Picking a result SHALL prefill the type's form,
which stays editable; Save SHALL download the cover server-side and store it as WebP in SQLite. A result whose
provider id already exists SHALL show "Already in your archive" linking to the entry instead of being pickable. A
provider error or timeout and an empty result SHALL show a message plus "Add manually" that opens the manual form
with the query as title. A failed cover download SHALL save the entry without image and say "Cover could not be
downloaded".

#### Scenario: Search shows results with cover, title, creator and year
- **WHEN** "Blonde" is typed on `/add/album`
- **THEN** a result shows a cover image, "Blonde", "Frank Ocean" and "2016"
- **proof:** e2e

#### Scenario: Typing is debounced
- **WHEN** "Blonde" is typed one character at a time with 50 ms between keys on `/add/album`
- **THEN** exactly one request to `/add/album/search` is made, with `q=Blonde`
- **proof:** e2e

#### Scenario: Picking a result prefills the form
- **WHEN** the "Blonde" result is picked
- **THEN** the form shows title "Blonde", artist "Frank Ocean", year 2016, type Album, 17 tracks, "Add artist" ticked, and every field is editable
- **proof:** e2e

#### Scenario: Saved cover is stored locally
- **WHEN** the picked "Blonde" is saved
- **THEN** the detail page's cover `src` is `/images/<id>` and that URL answers `image/webp`
- **proof:** e2e

#### Scenario: Anime search prefills episodes
- **WHEN** "Frieren" is searched on `/add/anime`, picked and saved
- **THEN** the detail page shows alt title "Sousou no Frieren", 2023 and the progress "0 / 28"
- **proof:** e2e

#### Scenario: Ongoing manga autofill leaves totals empty
- **WHEN** "Vagabond" is searched on `/add/manga`, picked and saved
- **THEN** the form's chapter and volume totals were empty and the detail page shows "0 / ?" for both
- **proof:** e2e

#### Scenario: Original-script author stays editable
- **WHEN** "Norwegian" is searched on `/add/book` and picked
- **THEN** the authors field shows "村上春樹" and can be changed to "Haruki Murakami" before saving
- **proof:** e2e

#### Scenario: Existing entry shows Already in your archive
- **WHEN** an album with provider deezer and external id `fake-al-1` is seeded and "Blonde" is searched
- **THEN** that result shows "Already in your archive" linking to the seeded entry and cannot be picked
- **proof:** e2e

#### Scenario: Provider error offers Add manually with the query
- **WHEN** "error" is searched on `/add/book`
- **THEN** "Search is unavailable right now" and "Add manually" show, and "Add manually" opens the manual form with title "error"
- **proof:** e2e

#### Scenario: Provider timeout offers Add manually with the query
- **WHEN** "timeout" is searched on `/add/anime`
- **THEN** "Search is unavailable right now" and "Add manually" show, and "Add manually" opens the manual form with title "timeout"
- **proof:** e2e

#### Scenario: No results offers Add manually with the query
- **WHEN** "zzzz" is searched on `/add/album`
- **THEN** "No results" and "Add manually" show, and "Add manually" opens the manual form with title "zzzz"
- **proof:** e2e

#### Scenario: Cover download failure saves without cover
- **WHEN** the "Norwegian" result without a cover is picked and saved, and separately the "Broken" book result (cover the fake remote cannot serve) is picked and saved
- **THEN** both entries are saved without an image, the second detail page says "Cover could not be downloaded" and shows the placeholder
- **proof:** e2e

#### Scenario: Server refuses a duplicate provider id on save
- **WHEN** `createEntry` gets an album with the provider id of an existing album
- **THEN** it throws `DuplicateError` carrying the existing id and no second row is stored
- **proof:** unit

