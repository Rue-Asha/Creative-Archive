ALTER TABLE collection_entries ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
UPDATE collection_entries SET position = (
  SELECT n FROM (
    SELECT rowid AS rid, ROW_NUMBER() OVER (PARTITION BY collection_id ORDER BY added_at, rowid) AS n FROM collection_entries
  ) WHERE rid = collection_entries.rowid);
CREATE INDEX collection_entries_position ON collection_entries(collection_id, position);
