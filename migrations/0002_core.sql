CREATE TABLE entries (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('album','artist','song','anime','manga','book','brand','site','influencer','piece','look')),
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  title_key TEXT NOT NULL,
  status TEXT CHECK (
    (type IN ('album','artist','song','anime','manga','book') AND status IN ('none','want','progress','done','dropped')) OR
    (type = 'piece' AND status IN ('wishlist','owned','gone')) OR
    (type IN ('brand','site','influencer','look') AND status IS NULL)),
  rating_x2 INTEGER CHECK (rating_x2 BETWEEN 1 AND 10),
  episodes INTEGER CHECK (episodes >= 0), episodes_total INTEGER CHECK (episodes_total >= 0),
  chapters INTEGER CHECK (chapters >= 0), chapters_total INTEGER CHECK (chapters_total >= 0),
  volumes INTEGER CHECK (volumes >= 0), volumes_total INTEGER CHECK (volumes_total >= 0),
  kind TEXT CHECK (kind IN ('brand','shop','site')),
  artist_id INTEGER REFERENCES entries(id) ON DELETE SET NULL,
  artist_name TEXT,
  provider TEXT CHECK (provider IN ('deezer','anilist','openlibrary')),
  external_id TEXT,
  image_id INTEGER REFERENCES images(id) ON DELETE SET NULL,
  details TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(details)),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX entries_external ON entries(type, provider, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX entries_type_created ON entries(type, created_at);
CREATE INDEX entries_updated ON entries(updated_at);
CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, name_key TEXT NOT NULL UNIQUE);
CREATE TABLE entry_tags (
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id));
CREATE TABLE status_events (
  id INTEGER PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  status TEXT NOT NULL, at TEXT NOT NULL);
CREATE INDEX status_events_entry ON status_events(entry_id, at);
CREATE TABLE collections (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL CHECK (trim(name) <> ''), description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE collection_entries (
  collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  added_at TEXT NOT NULL,
  PRIMARY KEY (collection_id, entry_id));
CREATE TABLE heroes (
  world TEXT PRIMARY KEY CHECK (world IN ('home','music','animanga','books','fashion')),
  image_id INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE);
