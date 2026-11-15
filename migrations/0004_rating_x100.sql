ALTER TABLE entries ADD COLUMN rating_x100 INTEGER CHECK (rating_x100 BETWEEN 0 AND 1000);
UPDATE entries SET rating_x100 = rating_x2 * 100 WHERE rating_x2 IS NOT NULL;
ALTER TABLE entries DROP COLUMN rating_x2;
