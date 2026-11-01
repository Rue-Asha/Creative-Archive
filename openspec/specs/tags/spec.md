# tags Specification

## Purpose
TBD - created by archiving change build-creative-archive. Update Purpose after archive.
## Requirements
### Requirement: Global tags with Unicode-aware dedupe
Tags SHALL be free labels shared by all entry types. A tag name SHALL match an existing tag when both fold to the same
key (NFC, trimmed, whitespace collapsed, lower-cased with full Unicode case mapping — not SQLite NOCASE, which folds
ASCII only), in which case the existing tag and its spelling are reused. Empty and whitespace-only names SHALL be
ignored. A tag with no entries left SHALL be removed, so it no longer appears in autocomplete.

#### Scenario: Tags are global across types
- **WHEN** an album and a piece are both tagged "Summer"
- **THEN** one tag "Summer" exists with count 2
- **proof:** unit

#### Scenario: Tag names dedupe ignoring case including umlauts
- **WHEN** an entry is tagged "Ästhetik" and another "ästhetik", and a third " VINYL " after one tagged "vinyl"
- **THEN** one tag "Ästhetik" with count 2 and one tag "vinyl" with count 2 exist
- **proof:** unit

#### Scenario: Empty and whitespace tags are ignored
- **WHEN** `setEntryTags` gets `['', '   ', 'Jazz']`
- **THEN** the entry has only the tag "Jazz"
- **proof:** unit

#### Scenario: Unused tags are removed
- **WHEN** the only entry tagged "Rare" loses the tag, and the only entry tagged "Old" is deleted
- **THEN** `listTags` contains neither "Rare" nor "Old"
- **proof:** unit

### Requirement: Tag input
The entry form SHALL let Rue add tags with autocomplete from existing (used) tags, matching case-insensitively
including non-ASCII, create new tags by typing a new name, and remove a tag before saving.

#### Scenario: Add a tag with autocomplete
- **WHEN** a seeded entry carries "Ästhetik" and "äst" is typed into the tag input of another entry's form
- **THEN** "Ästhetik" is suggested, choosing it adds the chip, and after Save the reopened edit form shows the chip "Ästhetik"
- **proof:** e2e

#### Scenario: Typing an existing tag in other case reuses it
- **WHEN** a seeded entry carries "Ästhetik", and "ÄSTHETIK" is typed and confirmed with Enter in another entry's tag input and saved
- **THEN** the reopened edit form shows the chip "Ästhetik" and `GET /__test/counts` reports one tag
- **proof:** e2e

#### Scenario: Remove a tag
- **WHEN** a tag chip's remove button is pressed in the edit form and the entry saved
- **THEN** the reopened edit form no longer shows that tag
- **proof:** e2e

