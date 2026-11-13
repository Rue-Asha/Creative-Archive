## MODIFIED Requirements

### Requirement: Rating
Media entries (albums, artists, songs, anime, manga, books) SHALL be ratable with a number from 0 to 10 inclusive with
at most two decimal places (stored as whole hundredths), or unrated, clearable, shown on cards and on the detail page;
unrated entries SHALL show no rating on cards. A rating of 0 is a rating, distinct from unrated. Values outside 0 to
10, with more than two decimals or not finite SHALL be rejected with "Rating must be between 0 and 10 with up to two
decimals" and leave the stored value unchanged. Fashion entries SHALL have no rating. Until the redesign the existing
star control SHALL keep working as an adapter: it shows the value as stars (value / 2, in half steps) and writes
star value times 2.

#### Scenario: Rating accepts 0 to 10 with two decimals
- **WHEN** `setRating` is called with 8.75, then with 0, 10, 8.755, -0.01, 10.01 and NaN
- **THEN** 8.75, 0 and 10 are each stored, and the other three throw a ValidationError leaving 10
- **proof:** unit

#### Scenario: Rating is stored in whole hundredths
- **WHEN** `setRating` is called with 8.75 and with 0.1 + 0.2
- **THEN** the stored integers are 875 and 30 and `getEntry` returns 8.75 and 0.3
- **proof:** unit

#### Scenario: Clearing keeps 0 distinct from unrated
- **WHEN** an entry is rated 0 and `setRating(id, null)` is then called
- **THEN** `getEntry` returns 0 first and null after
- **proof:** unit

#### Scenario: Rate in half stars through the adapter
- **WHEN** the left half of the fifth star is chosen on a seeded album's detail page
- **THEN** the control reads 4.5 stars, the stored rating is 9, and after a reload it still reads 4.5 stars
- **proof:** e2e

#### Scenario: Clear the rating
- **WHEN** "Clear rating" is chosen on a rated album
- **THEN** no star is filled and after a reload the album is unrated
- **proof:** e2e

#### Scenario: Keyboard rates with arrow keys through the adapter
- **WHEN** the rating control of an unrated book is focused and ArrowRight is pressed three times, then ArrowLeft once
- **THEN** the control reads 1 star and `aria-valuenow` is 1
- **proof:** e2e

#### Scenario: Home and End move the cursor in the rating field
- **WHEN** the typed rating field holds 8.75 and Home, then End is pressed
- **THEN** the text cursor moves to the start, then the end, of the field and the stored rating stays 8.75 (Home and End do not set 0 or 10; confirmed by Rue on 2026-11-13, gate 1 / task 2.5)
- **proof:** e2e (built with the redesign's rating field)

#### Scenario: Rated entries show their rating on cards
- **WHEN** a list holds an album whose stored rating is 7
- **THEN** its card shows the star display with accessible name "3.5 of 5"
- **proof:** e2e

#### Scenario: Unrated entries show no stars on cards
- **WHEN** a list holds an unrated album
- **THEN** its card has no star display
- **proof:** e2e
