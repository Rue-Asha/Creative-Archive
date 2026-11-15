import { TYPES } from '#lib/entries/config.ts';
import { isValidRating, ratingToX100 } from '#lib/entries/derive.ts';
import { clampProgress } from '#lib/entries/progress.ts';
import { ValidationError } from '#lib/errors.ts';
import type { Entry, EntryType, Id, ProgressKey, Status, StatusEvent } from '#lib/types.ts';
import { getDb } from './db.ts';
import { loadTags, rowToEntry } from './rows.ts';

const MEDIA_STATUSES: readonly Status[] = ['none', 'want', 'progress', 'done', 'dropped'];
const PIECE_STATUSES: readonly Status[] = ['wishlist', 'owned', 'gone'];

function lookup(id: Id): { type: EntryType; status: Status | null } {
	const row = getDb().prepare('SELECT type, status FROM entries WHERE id = ?').get(id);
	if (!row) throw new Error(`Entry ${id} not found`);
	return { type: row.type as EntryType, status: row.status as Status | null };
}

function load(id: Id): Entry {
	const row = getDb().prepare('SELECT * FROM entries WHERE id = ?').get(id);
	if (!row) throw new Error(`Entry ${id} not found`);
	return rowToEntry(row, loadTags([id]).get(id) ?? []);
}

export function setStatus(id: Id, status: Status): boolean {
	const entry = lookup(id);
	const kind = TYPES[entry.type].status;
	const allowed = kind === 'media' ? MEDIA_STATUSES : kind === 'piece' ? PIECE_STATUSES : [];
	if (!allowed.includes(status)) throw new ValidationError({ status: `Invalid status for ${entry.type}` });
	if (entry.status === status) return false;
	const db = getDb();
	const now = new Date().toISOString();
	db.prepare('UPDATE entries SET status = ?, updated_at = ? WHERE id = ?').run(status, now, id);
	if (kind === 'media')
		db.prepare('INSERT INTO status_events (entry_id, status, at) VALUES (?, ?, ?)').run(id, status, now);
	return true;
}

export function setProgress(id: Id, key: ProgressKey, current: number): Entry {
	const entry = lookup(id);
	if (!TYPES[entry.type].progress.includes(key)) throw new ValidationError({ [key]: `${entry.type} has no ${key}` });
	if (!Number.isInteger(current)) throw new ValidationError({ [key]: 'Enter a whole number' });
	const db = getDb();
	const row = db.prepare(`SELECT ${key}_total AS total FROM entries WHERE id = ?`).get(id);
	const value = clampProgress(current, (row?.total as number | null) ?? null);
	const now = new Date().toISOString();
	db.prepare(`UPDATE entries SET ${key} = ?, updated_at = ? WHERE id = ?`).run(value, now, id);
	if (value > 0 && entry.status === 'want') {
		db.prepare("UPDATE entries SET status = 'progress' WHERE id = ?").run(id);
		db.prepare("INSERT INTO status_events (entry_id, status, at) VALUES (?, 'progress', ?)").run(id, now);
	}
	return load(id);
}

export function stepProgress(id: Id, key: ProgressKey, delta: 1 | -1): Entry {
	const entry = load(id);
	const p = entry.progress[key];
	if (!p) throw new ValidationError({ [key]: `${entry.type} has no ${key}` });
	return setProgress(id, key, p.current + delta);
}

export function setRating(id: Id, rating: number | null): void {
	const entry = lookup(id);
	if (!TYPES[entry.type].ratable) throw new ValidationError({ rating: `${entry.type} has no rating` });
	if (rating !== null && !isValidRating(rating))
		throw new ValidationError({ rating: 'Rating must be between 0 and 10 with up to two decimals' });
	getDb()
		.prepare('UPDATE entries SET rating_x100 = ?, updated_at = ? WHERE id = ?')
		.run(ratingToX100(rating), new Date().toISOString(), id);
}

export function statusEvents(id: Id): StatusEvent[] {
	return getDb()
		.prepare('SELECT id, entry_id, status, at FROM status_events WHERE entry_id = ? ORDER BY at, id')
		.all(id)
		.map((r) => ({ id: Number(r.id), entryId: Number(r.entry_id), status: r.status as Status, at: String(r.at) }));
}
