import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadMigrations, migrate, openDb } from './db.ts';

const T1 = '2026-10-01T08:00:00.000Z';
const T2 = '2026-10-02T08:00:00.000Z';
const T3 = '2026-10-03T08:00:00.000Z';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(join(mkdtempSync(join(tmpdir(), 'archive-0005-')), 'old.db'));
	migrate(
		db,
		loadMigrations().filter((m) => m.name <= '0004_rating_x100.sql')
	);
	const ins = db.prepare('INSERT INTO entries (id, type, title, title_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
	for (const id of [1, 2, 3, 4]) ins.run(id, 'album', `E${id}`, `e${id}`, T1, T1);
	db.exec(`INSERT INTO collections (id, name, created_at, updated_at) VALUES (1, 'A', '${T1}', '${T1}'), (2, 'B', '${T1}', '${T1}')`);
	db.exec(`INSERT INTO collection_entries (collection_id, entry_id, added_at) VALUES
		(1, 3, '${T3}'), (1, 1, '${T1}'), (1, 2, '${T2}'), (2, 4, '${T2}'), (2, 2, '${T1}')`);
});

afterEach(() => {
	db.close();
});

describe('migration 0005', () => {
	it('Scenario: Migration preserves the existing order', () => {
		migrate(db, loadMigrations().filter((m) => m.name <= '0005_collection_position.sql'));

		const order = (c: number) =>
			db
				.prepare('SELECT entry_id, position FROM collection_entries WHERE collection_id = ? ORDER BY position')
				.all(c);
		expect(order(1)).toEqual([
			{ entry_id: 1, position: 1 },
			{ entry_id: 2, position: 2 },
			{ entry_id: 3, position: 3 }
		]);
		expect(order(2)).toEqual([
			{ entry_id: 2, position: 1 },
			{ entry_id: 4, position: 2 }
		]);
		expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
		expect(db.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
	});
});

describe('head schema', () => {
	const schema = (d: DatabaseSync) =>
		d
			.prepare("SELECT type, name, tbl_name, sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name")
			.all()
			.map((r) => ({ ...r, sql: String(r.sql ?? '').replace(/\s+/g, ' ').replace(/"/g, '') }));

	it('Scenario: A migrated database matches a fresh one at head', () => {
		migrate(db, loadMigrations());
		const fresh = openDb(join(mkdtempSync(join(tmpdir(), 'archive-head-')), 'fresh.db'));
		migrate(fresh, loadMigrations());

		expect(schema(db)).toEqual(schema(fresh));
		for (const d of [db, fresh]) {
			expect(d.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
			expect(d.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
		}
		fresh.close();
	});
});
