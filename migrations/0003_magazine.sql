CREATE TABLE entries_new (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('album','artist','song','anime','manga','book','brand','site','influencer','magazine','piece','look')),
  title TEXT NOT NULL CHECK (trim(title) <> ''),
  title_key TEXT NOT NULL,
  status TEXT CHECK (
    (type IN ('album','artist','song','anime','manga','book') AND status IN ('none','want','progress','done','dropped')) OR
    (type = 'piece' AND status IN ('wishlist','owned','gone')) OR
    (type IN ('brand','site','influencer','magazine','look') AND status IS NULL)),
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
INSERT INTO entries_new (id, type, title, title_key, status, rating_x2, episodes, episodes_total, chapters, chapters_total,
  volumes, volumes_total, kind, artist_id, artist_name, provider, external_id, image_id, details, note, created_at, updated_at)
SELECT id, type, title, title_key, status, rating_x2, episodes, episodes_total, chapters, chapters_total,
  volumes, volumes_total, kind, artist_id, artist_name, provider, external_id, image_id, details, note, created_at, updated_at
FROM entries;
DROP TABLE entries;
ALTER TABLE entries_new RENAME TO entries;
CREATE UNIQUE INDEX entries_external ON entries(type, provider, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX entries_type_created ON entries(type, created_at);
CREATE INDEX entries_updated ON entries(updated_at);
