import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

export interface Migration {
	name: string;
	sql: string;
}

let instance: DatabaseSync | null = null;

export function openDb(path: string): DatabaseSync {
	mkdirSync(dirname(resolve(path)), { recursive: true });
	const db = new DatabaseSync(path);
	// a no-op inside a transaction, so it is set here, before migrate() opens any
	db.exec('PRAGMA foreign_keys = ON');
	db.exec('PRAGMA journal_mode = WAL');
	return db;
}

// this module runs from src/ in dev and tests and from a bundled chunk under build/ in production, so the
// package root is found by walking up rather than by a fixed relative path or the cwd
function packageRoot(): string {
	let dir = dirname(fileURLToPath(import.meta.url));
	while (!existsSync(join(dir, 'package.json')) && dirname(dir) !== dir) dir = dirname(dir);
	return dir;
}

export function loadMigrations(dir = join(packageRoot(), 'migrations')): Migration[] {
	return readdirSync(dir)
		.filter((f) => f.endsWith('.sql'))
		.sort()
		.map((name) => ({ name, sql: readFileSync(join(dir, name), 'utf8') }));
}

export function migrate(db: DatabaseSync, migrations: Migration[] = loadMigrations()): void {
	db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT)');
	const done = new Set(
		db
			.prepare('SELECT name FROM schema_migrations')
			.all()
			.map((r) => String(r.name))
	);
	const record = db.prepare(
		"INSERT INTO schema_migrations (name, applied_at) VALUES (?, datetime('now'))"
	);
	for (const m of migrations) {
		if (done.has(m.name)) continue;
		db.exec('BEGIN');
		try {
			db.exec(m.sql);
			record.run(m.name);
			db.exec('COMMIT');
		} catch (e) {
			db.exec('ROLLBACK');
			throw new Error(`Migration ${m.name} failed: ${(e as Error).message}`, { cause: e });
		}
	}
}

export function getDb(): DatabaseSync {
	if (!instance) {
		const db = openDb(process.env.DATABASE_PATH ?? './data/creative-archive.db');
		migrate(db);
		instance = db;
	}
	return instance;
}

export function closeDb(): void {
	if (instance?.isOpen) instance.close();
	instance = null;
}

// every table but the migration record, so a table a later migration adds is emptied too
export function dataTables(db: DatabaseSync = getDb()): string[] {
	return db
		.prepare(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> 'schema_migrations' ORDER BY name"
		)
		.all()
		.map((r) => String(r.name));
}

export function resetDb(): void {
	const db = getDb();
	db.exec('BEGIN');
	for (const table of dataTables(db)) db.exec(`DELETE FROM ${table}`);
	db.exec('COMMIT');
}
