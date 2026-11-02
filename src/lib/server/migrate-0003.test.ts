import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { dataTables, loadMigrations, migrate, openDb } from './db.ts';

const NOW = '2026-10-31T08:00:00.000Z';
const TYPES = ['album', 'artist', 'song', 'anime', 'manga', 'book', 'brand', 'site', 'influencer', 'piece', 'look'];
const STATUS: Record<string, string> = { album: 'done', artist: 'none', song: 'want', anime: 'progress', manga: 'dropped', book: 'done', piece: 'owned' };

let dir: string;
let db: DatabaseSync;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'archive-0003-'));
	db = openDb(join(dir, 'old.db'));
	migrate(
		db,
		loadMigrations().filter((m) => m.name < '0003')
	);
	seed(db);
});

afterEach(() => {
	db.close();
});

function seed(d: DatabaseSync) {
	d.exec(`INSERT INTO images (id, mime, width, height, bytes, created_at) VALUES (1, 'image/webp', 2, 3, x'0102', '${NOW}')`);
	const ins = d.prepare(
		`INSERT INTO entries (id, type, title, title_key, status, rating_x2, episodes, episodes_total, kind, artist_id, artist_name,
			image_id, details, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);
	TYPES.forEach((type, i) => {
		const id = i + 1;
		ins.run(
			id,
			type,
			`Title ${type}`,
			`title ${type}`,
			STATUS[type] ?? null,
			type === 'book' ? 9 : null,
			type === 'anime' ? 4 : null,
			type === 'anime' ? 12 : null,
			type === 'brand' || type === 'site' ? type : null,
			null,
			type === 'album' ? 'Title artist' : null,
			type === 'look' ? 1 : null,
			type === 'brand' || type === 'site' ? '{"url":"https://x.example"}' : '{}',
			type === 'site' ? 'a note' : '',
			NOW,
			NOW
		);
	});
	d.exec('UPDATE entries SET artist_id = 2 WHERE id = 1');
	d.exec(`
		INSERT INTO tags (id, name, name_key) VALUES (1, 'Summer', 'summer'), (2, 'Ästhetik', 'ästhetik');
		INSERT INTO entry_tags (entry_id, tag_id) VALUES (1, 1), (3, 1), (7, 2), (10, 2);
		INSERT INTO status_events (entry_id, status, at) VALUES (1, 'done', '${NOW}'), (4, 'progress', '${NOW}'), (10, 'owned', '${NOW}');
		INSERT INTO collections (id, name, created_at, updated_at) VALUES (1, 'Moodboard', '${NOW}', '${NOW}'), (2, 'Wishes', '${NOW}', '${NOW}');
		INSERT INTO collection_entries (collection_id, entry_id, added_at) VALUES (1, 1, '${NOW}'), (1, 7, '${NOW}'), (2, 10, '${NOW}'), (2, 11, '${NOW}');
		INSERT INTO heroes (world, image_id) VALUES ('home', 1);
	`);
}

function snapshot(d: DatabaseSync): Record<string, unknown[]> {
	return Object.fromEntries(dataTables(d).map((t) => [t, d.prepare(`SELECT * FROM ${t} ORDER BY rowid`).all()]));
}

function count(sql: string): number {
	return Number(db.prepare(sql).get()?.n);
}

describe('migration 0003', () => {
	it('Scenario: Existing database migrates without loss', () => {
		const before = snapshot(db);

		migrate(db);

		expect(snapshot(db)).toEqual(before);
		expect(db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
		expect(db.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
	});

	it('Scenario: Foreign keys still bind after the rebuild', () => {
		migrate(db);

		db.prepare('DELETE FROM entries WHERE id IN (2, 4)').run();

		expect(db.prepare('SELECT artist_id, artist_name FROM entries WHERE id = 1').get()).toEqual({
			artist_id: null,
			artist_name: 'Title artist'
		});
		expect(db.prepare('SELECT entry_id, tag_id FROM entry_tags ORDER BY entry_id').all()).toEqual([
			{ entry_id: 1, tag_id: 1 },
			{ entry_id: 3, tag_id: 1 },
			{ entry_id: 7, tag_id: 2 },
			{ entry_id: 10, tag_id: 2 }
		]);
		expect(count('SELECT count(*) AS n FROM status_events WHERE entry_id = 4')).toBe(0);
		expect(db.prepare('SELECT entry_id FROM status_events ORDER BY entry_id').all()).toEqual([{ entry_id: 1 }, { entry_id: 10 }]);
		expect(db.prepare('SELECT collection_id, entry_id FROM collection_entries ORDER BY entry_id').all()).toEqual([
			{ collection_id: 1, entry_id: 1 },
			{ collection_id: 1, entry_id: 7 },
			{ collection_id: 2, entry_id: 10 },
			{ collection_id: 2, entry_id: 11 }
		]);
	});

	it('Scenario: Migration 0003 runs once', () => {
		migrate(db);
		const after = snapshot(db);

		migrate(db);

		expect(
			db.prepare("SELECT count(*) AS n FROM schema_migrations WHERE name = '0003_magazine.sql'").get()?.n
		).toBe(1);
		expect(snapshot(db)).toEqual(after);
	});

	it('Scenario: Fresh and migrated databases share one schema', () => {
		const fresh = openDb(join(dir, 'fresh.db'));
		migrate(fresh);
		migrate(db);
		const schema = (d: DatabaseSync) =>
			d.prepare("SELECT type, name, sql FROM sqlite_master WHERE name <> 'schema_migrations' ORDER BY type, name").all();

		expect(schema(db)).toEqual(schema(fresh));
		expect(schema(db).filter((r) => r.type === 'index' && String(r.name).startsWith('entries_'))).toHaveLength(3);
		fresh.close();
	});
});
