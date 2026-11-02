## MODIFIED Requirements

### Requirement: Database and migrations
The server SHALL open the SQLite database at `DATABASE_PATH` (default `./data/creative-archive.db`) with WAL and
foreign keys on, create its directory if missing, and apply every not yet applied `migrations/NNNN_*.sql` file in
name order, each in its own transaction recorded in `schema_migrations`, at startup. Each migration SHALL run with
foreign keys off, so rebuilding a table cascades nothing; before its commit `PRAGMA foreign_key_check` SHALL report no
row, otherwise the migration SHALL be rolled back, stay unrecorded and fail naming itself. Foreign keys SHALL be on
again after `migrate` returns or throws.

#### Scenario: Fresh database gets the schema
- **WHEN** the server opens a database file that does not exist
- **THEN** every migration is applied and recorded in `schema_migrations`
- **proof:** unit

#### Scenario: Only new migrations run on an existing database
- **WHEN** a database already has `0001_images.sql` recorded and a new migration file exists
- **THEN** only the new migration runs
- **proof:** unit

#### Scenario: Failing migration stops the server
- **WHEN** a migration contains invalid SQL and the built server starts
- **THEN** the server exits non-zero naming the failing migration, and the database keeps no part of that migration
- **proof:** unit

#### Scenario: Server starts from any working directory
- **WHEN** the built server is started from a directory other than the package root
- **THEN** it finds `migrations/` next to `package.json` and answers `/healthz` with 200
- **proof:** unit

#### Scenario: Migration that breaks a foreign key is rolled back
- **WHEN** `migrate` runs a migration that inserts an `entry_tags` row pointing at a missing entry
- **THEN** it throws an error naming that migration, the row is not stored and the migration is not recorded
- **proof:** unit

#### Scenario: Foreign keys are on after migrating
- **WHEN** `migrate` has applied the migrations, and when it has thrown on a failing one
- **THEN** `PRAGMA foreign_keys` reads 1 in both cases
- **proof:** unit

## ADDED Requirements

### Requirement: Entries table accepts magazines
Migration `0003_magazine.sql` SHALL rebuild `entries` so its `type` CHECK allows `magazine` and its status CHECK
requires a null status for magazines, keeping every row with its id and values, the indexes `entries_external`,
`entries_type_created` and `entries_updated`, the self-reference `artist_id` and every foreign key from `entry_tags`,
`status_events` and `collection_entries`. A fresh database and a migrated one SHALL end with the same schema.

#### Scenario: Existing database migrates without loss
- **WHEN** a database at `0002_core.sql` holds entries of all 11 earlier types (with an artist link, an image, progress, a rating, a kind, details and a note), tags on several entries, status events, two collections with entries and a hero, and `migrate` then applies `0003_magazine.sql`
- **THEN** every data table holds the same rows with the same values as before, ordered by rowid; `PRAGMA foreign_key_check` returns no row and `PRAGMA integrity_check` returns "ok"
- **proof:** unit

#### Scenario: Foreign keys still bind after the rebuild
- **WHEN** after migrating that database the artist entry and a tagged entry with events and collection links are deleted
- **THEN** the album's `artist_id` becomes null with `artist_name` kept, and the deleted entry's `entry_tags`, `status_events` and `collection_entries` rows are gone while the other entries' rows remain
- **proof:** unit

#### Scenario: Migration 0003 runs once
- **WHEN** `migrate` runs again on the migrated database
- **THEN** `schema_migrations` lists `0003_magazine.sql` exactly once and every data table is unchanged
- **proof:** unit

#### Scenario: Fresh and migrated databases share one schema
- **WHEN** the `sqlite_master` rows (type, name, sql) of a fresh database and of the migrated one are compared
- **THEN** they are equal, the three `entries` indexes among them
- **proof:** unit

#### Scenario: Database accepts a magazine only without a status
- **WHEN** a fresh database gets a magazine with a null status, one with status `done` and one with status `owned`
- **THEN** the first is stored and the other two fail the CHECK
- **proof:** unit
