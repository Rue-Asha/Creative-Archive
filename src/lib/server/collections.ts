import { COPY } from '#lib/copy.ts';
import { ValidationError } from '#lib/errors.ts';
import type { Collection, Entry, Id } from '#lib/types.ts';
import { getDb } from './db.ts';
import { loadTags, rowToEntry } from './rows.ts';
import { atomic } from './tags.ts';

type Row = Record<string, unknown>;

const ORDER = 'ORDER BY ce.position, ce.rowid';

function requireName(name: string): string {
	const trimmed = name.trim();
	if (trimmed === '') throw new ValidationError({ name: COPY.collectionNameRequired });
	return trimmed;
}

function collage(collectionId: Id): Id[] {
	return getDb()
		.prepare(
			`SELECT e.image_id FROM collection_entries ce JOIN entries e ON e.id = ce.entry_id
			 WHERE ce.collection_id = ? AND e.image_id IS NOT NULL ${ORDER} LIMIT 3`
		)
		.all(collectionId)
		.map((r) => Number(r.image_id));
}

function toCollection(row: Row): Collection {
	const id = Number(row.id);
	return {
		id,
		name: String(row.name),
		description: String(row.description),
		count: Number(row.count),
		collage: collage(id),
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at)
	};
}

const SELECT = `SELECT c.*, (SELECT count(*) FROM collection_entries WHERE collection_id = c.id) AS count FROM collections c`;

export function createCollection(name: string, description = ''): Id {
	const now = new Date().toISOString();
	return Number(
		getDb()
			.prepare('INSERT INTO collections (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)')
			.run(requireName(name), description, now, now).lastInsertRowid
	);
}

// an omitted description keeps the stored one
export function renameCollection(id: Id, name: string, description?: string): void {
	getDb()
		.prepare('UPDATE collections SET name = ?, description = COALESCE(?, description), updated_at = ? WHERE id = ?')
		.run(requireName(name), description ?? null, new Date().toISOString(), id);
}

export function deleteCollection(id: Id): void {
	getDb().prepare('DELETE FROM collections WHERE id = ?').run(id);
}

export function listCollections(): Collection[] {
	return getDb().prepare(`${SELECT} ORDER BY c.created_at DESC, c.id DESC`).all().map(toCollection);
}

export function getCollection(id: Id): (Collection & { entries: Entry[] }) | null {
	const row = getDb().prepare(`${SELECT} WHERE c.id = ?`).get(id);
	if (!row) return null;
	const rows = getDb()
		.prepare(
			`SELECT e.* FROM collection_entries ce JOIN entries e ON e.id = ce.entry_id
			 WHERE ce.collection_id = ? ${ORDER}`
		)
		.all(id);
	const tags = loadTags(rows.map((r) => Number(r.id)));
	return { ...toCollection(row), entries: rows.map((r) => rowToEntry(r, tags.get(Number(r.id)) ?? [])) };
}

export function addToCollection(collectionId: Id, entryId: Id): void {
	const now = new Date().toISOString();
	const { changes } = getDb()
		.prepare(
			`INSERT OR IGNORE INTO collection_entries (collection_id, entry_id, added_at, position)
			 VALUES (?, ?, ?, (SELECT COALESCE(MAX(position), 0) + 1 FROM collection_entries WHERE collection_id = ?))`
		)
		.run(collectionId, entryId, now, collectionId);
	if (changes) touch(collectionId, now);
}

export function reorderCollection(collectionId: Id, entryIds: Id[]): void {
	const db = getDb();
	const members = db
		.prepare('SELECT entry_id FROM collection_entries WHERE collection_id = ?')
		.all(collectionId)
		.map((r) => Number(r.entry_id));
	const given = new Set(entryIds);
	if (given.size !== entryIds.length || entryIds.length !== members.length || !members.every((m) => given.has(m)))
		throw new ValidationError({ ids: 'Order must list exactly the entries of the collection' });
	const set = db.prepare('UPDATE collection_entries SET position = ? WHERE collection_id = ? AND entry_id = ?');
	db.exec('BEGIN');
	try {
		entryIds.forEach((entryId, i) => set.run(i + 1, collectionId, entryId));
		db.exec('COMMIT');
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}
	touch(collectionId, new Date().toISOString());
}

export function removeFromCollection(collectionId: Id, entryId: Id): void {
	const { changes } = getDb()
		.prepare('DELETE FROM collection_entries WHERE collection_id = ? AND entry_id = ?')
		.run(collectionId, entryId);
	if (changes) touch(collectionId, new Date().toISOString());
}

export function removeManyFromCollection(collectionId: Id, entryIds: Id[]): number {
	const db = getDb();
	const ids = [...new Set(entryIds)];
	if (ids.length === 0) return 0;
	const member = db.prepare('SELECT 1 FROM collection_entries WHERE collection_id = ? AND entry_id = ?');
	const del = db.prepare('DELETE FROM collection_entries WHERE collection_id = ? AND entry_id = ?');
	atomic(() => {
		const missing = ids.filter((id) => !member.get(collectionId, id));
		if (missing.length) throw new ValidationError({ ids: `Not in the collection: ${missing.join(', ')}` });
		for (const id of ids) del.run(collectionId, id);
	});
	touch(collectionId, new Date().toISOString());
	return ids.length;
}

export function collectionsOf(entryId: Id): Id[] {
	return getDb()
		.prepare('SELECT collection_id FROM collection_entries WHERE entry_id = ? ORDER BY collection_id')
		.all(entryId)
		.map((r) => Number(r.collection_id));
}

function touch(collectionId: Id, now: string): void {
	getDb().prepare('UPDATE collections SET updated_at = ? WHERE id = ?').run(now, collectionId);
}
