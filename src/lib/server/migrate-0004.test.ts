import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadMigrations, migrate, openDb } from './db.ts';
import { ratingFromX100 } from '#lib/entries/derive.ts';

const NOW = '2026-10-31T08:00:00.000Z';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(join(mkdtempSync(join(tmpdir(), 'archive-0004-')), 'old.db'));
	migrate(
		db,
		loadMigrations().filter((m) => m.name <= '0003_magazine.sql')
	);
	const ins = db.prepare(
		'INSERT INTO entries (id, type, title, title_key, status, rating_x2, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
	);
	ins.run(1, 'album', 'Blonde', 'blonde', 'done', 9, NOW, NOW);
	ins.run(2, 'book', 'Half', 'half', 'done', 1, NOW, NOW);
	ins.run(3, 'song', 'Unrated', 'unrated', 'want', null, NOW, NOW);
});

afterEach(() => {
	db.close();
});

describe('migration 0004', () => {
	it('Scenario: Migration converts star ratings', () => {
		migrate(db, loadMigrations().filter((m) => m.name <= '0004_rating_x100.sql'));

		const rows = db.prepare('SELECT id, rating_x100 FROM entries ORDER BY id').all();
		expect(rows.map((r) => ratingFromX100(r.rating_x100 as number | null))).toEqual([9, 1, null]);
		expect(rows.map((r) => r.rating_x100)).toEqual([900, 100, null]);
		expect(db.prepare('PRAGMA table_info(entries)').all().map((c) => c.name)).not.toContain('rating_x2');
		expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
		expect(db.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
	});
});
