import { existsSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb, loadMigrations, migrate, openDb } from './db.ts';

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), 'archive-db-'));
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function applied(db: DatabaseSync): string[] {
	return db
		.prepare('SELECT name FROM schema_migrations ORDER BY name')
		.all()
		.map((r) => String(r.name));
}

function tables(db: DatabaseSync): string[] {
	return db
		.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
		.all()
		.map((r) => String(r.name));
}

describe('db', () => {
	it('Scenario: Fresh database gets the schema', () => {
		const db = openDb(join(dir, 'fresh.db'));

		migrate(db);

		expect(applied(db)).toEqual(loadMigrations().map((m) => m.name));
		expect(applied(db)).toContain('0001_images.sql');
		expect(tables(db)).toContain('images');
		db.close();
	});

	it('Scenario: Only new migrations run on an existing database', () => {
		const db = openDb(join(dir, 'existing.db'));
		const [first] = loadMigrations();
		migrate(db, [first]);
		db.exec(
			"INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/webp', 1, 1, x'00', 'now')"
		);

		migrate(db, [first, { name: '9999_extra.sql', sql: 'CREATE TABLE extra (id INTEGER)' }]);
		migrate(db, [first, { name: '9999_extra.sql', sql: 'CREATE TABLE extra (id INTEGER)' }]);

		expect(applied(db)).toEqual([first.name, '9999_extra.sql']);
		expect(db.prepare('SELECT count(*) AS n FROM images').get()?.n).toBe(1);
		db.close();
	});

	it('creates a missing database directory', () => {
		const path = join(dir, 'does', 'not', 'exist', 'archive.db');
		process.env.DATABASE_PATH = path;

		const db = getDb();

		expect(existsSync(path)).toBe(true);
		expect(applied(db)).toEqual(loadMigrations().map((m) => m.name));
	});

	it('opens with WAL and foreign keys', () => {
		const db = openDb(join(dir, 'pragmas.db'));

		expect(db.prepare('PRAGMA journal_mode').get()?.journal_mode).toBe('wal');
		expect(db.prepare('PRAGMA foreign_keys').get()?.foreign_keys).toBe(1);
		db.close();
	});

	it('a failing migration is rolled back, not recorded and named in the error', () => {
		const db = openDb(join(dir, 'rollback.db'));
		const run = () =>
			migrate(db, [
				{ name: '0001_ok.sql', sql: 'CREATE TABLE ok (id INTEGER)' },
				{ name: '0002_bad.sql', sql: 'CREATE TABLE half (id INTEGER); CREATE TABL nope' }
			]);

		expect(run).toThrow(/0002_bad\.sql/);
		expect(applied(db)).toEqual(['0001_ok.sql']);
		expect(db.prepare("SELECT 1 FROM sqlite_master WHERE name = 'half'").get()).toBeUndefined();
		db.close();
	});

	it('loads migrations in name order from the package root', () => {
		const names = loadMigrations().map((m) => m.name);

		expect(names).toEqual([...names].sort());
		expect(names[0]).toBe('0001_images.sql');
	});
});
