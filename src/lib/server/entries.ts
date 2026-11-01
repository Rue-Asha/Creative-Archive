import { COPY } from '#lib/copy.ts';
import { TYPES } from '#lib/entries/config.ts';
import { clampProgress } from '#lib/entries/progress.ts';
import { DuplicateError, ValidationError } from '#lib/errors.ts';
import type {
	Entry,
	EntryInput,
	EntryType,
	Id,
	ListQuery,
	ProviderId,
	SiteKind,
	Status
} from '#lib/types.ts';
import { getDb } from './db.ts';
import { entryColumns, loadTags, rowToEntry } from './rows.ts';
import { atomic, pruneTags, setEntryTags } from './tags.ts';

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

const MEDIA_STATUSES: Status[] = ['none', 'want', 'progress', 'done', 'dropped'];
const PIECE_STATUSES: Status[] = ['wishlist', 'owned', 'gone'];
const KINDS: SiteKind[] = ['brand', 'shop', 'site'];

type Row = Record<string, unknown>;

function fail(fields: Record<string, string>): never {
	throw new ValidationError(fields);
}

// brand and site share kind; the kind decides which of the two types the entry is
function resolveType(type: EntryType, kind: SiteKind | undefined): EntryType {
	if (type !== 'brand' && type !== 'site') return type;
	return (kind ?? (type === 'brand' ? 'brand' : 'shop')) === 'brand' ? 'brand' : 'site';
}

// keeps only what the type has; undefined stays undefined so an update leaves those columns alone
function clean(type: EntryType, input: EntryInput, selfId: Id | null): EntryInput {
	const config = TYPES[type];
	if (input.title.trim() === '')
		fail({ title: config.titleLabel === 'Name' ? COPY.nameRequired : COPY.titleRequired });
	const out: EntryInput = { type, title: input.title };

	if (config.status && input.status !== undefined) {
		if (!(config.status === 'media' ? MEDIA_STATUSES : PIECE_STATUSES).includes(input.status))
			fail({ status: 'Invalid status' });
		out.status = input.status;
	}
	if (config.ratable && input.rating !== undefined) {
		if (input.rating !== null && !(input.rating >= 0.5 && input.rating <= 5 && input.rating * 2 === Math.round(input.rating * 2)))
			fail({ rating: 'Rating must be 0.5 to 5 in half steps' });
		out.rating = input.rating;
	}
	if (input.progress) {
		out.progress = {};
		for (const key of config.progress) {
			const p = input.progress[key];
			if (p) out.progress[key] = { current: clampProgress(p.current, p.total), total: p.total };
		}
	}
	if (type === 'brand' || type === 'site') {
		if (input.kind !== undefined) {
			if (!KINDS.includes(input.kind)) fail({ kind: 'Invalid kind' });
			out.kind = input.kind;
		}
	}
	if (config.artist && input.artist !== undefined) out.artist = input.artist;
	if (input.imageId !== undefined) out.imageId = input.imageId;
	if (input.note !== undefined) out.note = input.note;
	if (input.details !== undefined) {
		const allowed = new Set<string>(config.fields.filter((f) => f.store === 'details').map((f) => f.key));
		out.details = Object.fromEntries(Object.entries(input.details).filter(([k]) => allowed.has(k)));
	}
	if (input.provider !== undefined || input.externalId !== undefined) {
		const pair = config.provider !== null && input.provider && input.externalId;
		out.provider = pair ? input.provider : null;
		out.externalId = pair ? input.externalId : null;
		if (pair) {
			const existing = findByExternal(type, input.provider!, input.externalId!);
			if (existing !== null && existing !== selfId) throw new DuplicateError(existing);
		}
	}
	return out;
}

function insert(cols: Row): Id {
	const names = Object.keys(cols);
	return Number(
		getDb()
			.prepare(`INSERT INTO entries (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')})`)
			.run(...(Object.values(cols) as (string | number | null)[])).lastInsertRowid
	);
}

function addEvent(entryId: Id, status: string, at: string): void {
	getDb().prepare('INSERT INTO status_events (entry_id, status, at) VALUES (?, ?, ?)').run(entryId, status, at);
}

export function createEntry(input: EntryInput): Id {
	const type = resolveType(input.type, input.kind);
	const config = TYPES[type];
	const prepared = clean(type, input, null);
	if (config.status === 'media') prepared.status ??= 'none';
	if (config.status === 'piece') prepared.status ??= 'wishlist';
	if (type === 'brand' || type === 'site') prepared.kind ??= type === 'brand' ? 'brand' : 'shop';
	const now = new Date().toISOString();
	return atomic(() => {
		const id = insert({ ...entryColumns(prepared), created_at: now, updated_at: now });
		if (config.status === 'media' && prepared.status !== 'none') addEvent(id, prepared.status!, now);
		if (input.tags) setEntryTags(id, input.tags);
		return id;
	});
}

export function updateEntry(id: Id, input: EntryInput): void {
	const old = getDb().prepare('SELECT * FROM entries WHERE id = ?').get(id);
	if (!old) throw new Error(`No entry ${id}`);
	const type = resolveType(old.type as EntryType, input.kind ?? (old.kind as SiteKind | null) ?? undefined);
	const prepared = clean(type, input, id);
	const now = new Date().toISOString();
	atomic(() => {
		const cols = { ...entryColumns(prepared), updated_at: now };
		getDb()
			.prepare(`UPDATE entries SET ${Object.keys(cols).map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
			.run(...(Object.values(cols) as (string | number | null)[]), id);
		if (TYPES[type].status === 'media' && prepared.status !== undefined && prepared.status !== old.status)
			addEvent(id, prepared.status, now);
		if (prepared.imageId !== undefined && prepared.imageId !== old.image_id) dropImage(old.image_id as number | null);
		if (input.tags) setEntryTags(id, input.tags);
	});
}

export function getEntry(id: Id): Entry | null {
	const row = getDb().prepare('SELECT * FROM entries WHERE id = ?').get(id);
	return row ? rowToEntry(row, loadTags([id]).get(id) ?? []) : null;
}

// images are not shared between entries, so an image row goes with its entry
function dropImage(imageId: number | null): void {
	if (imageId !== null) getDb().prepare('DELETE FROM images WHERE id = ?').run(imageId);
}

export function deleteEntry(id: Id): void {
	const db = getDb();
	atomic(() => {
		const old = db.prepare('SELECT image_id FROM entries WHERE id = ?').get(id);
		if (!old) return;
		db.prepare('DELETE FROM entries WHERE id = ?').run(id);
		dropImage(old.image_id as number | null);
		pruneTags();
	});
}

export function listEntries(q: ListQuery): Entry[] {
	const where = ['type IN (SELECT value FROM json_each(?))'];
	const args: (string | number)[] = [JSON.stringify(q.types)];
	if (q.status) {
		where.push('status = ?');
		args.push(q.status);
	}
	if (q.kind) {
		where.push('kind = ?');
		args.push(q.kind);
	}
	if (q.tag !== undefined) {
		where.push('id IN (SELECT entry_id FROM entry_tags WHERE tag_id = ?)');
		args.push(q.tag);
	}
	if (q.minRating !== undefined) {
		where.push('rating_x2 >= ?');
		args.push(Math.round(q.minRating * 2));
	}
	const order = q.sort === 'rating' ? 'rating_x2 IS NULL, rating_x2 DESC, ' : '';
	const rows = getDb()
		.prepare(`SELECT * FROM entries WHERE ${where.join(' AND ')} ORDER BY ${order}created_at DESC, id DESC`)
		.all(...args);
	if (q.sort === 'title')
		return hydrate(rows).sort((a, b) => collator.compare(a.title, b.title));
	return hydrate(rows);
}

export function findByExternal(type: EntryType, provider: ProviderId, externalId: string): Id | null {
	const row = getDb()
		.prepare('SELECT id FROM entries WHERE type = ? AND provider = ? AND external_id = ?')
		.get(type, provider, externalId);
	return row ? Number(row.id) : null;
}

export function ensureArtist(a: {
	provider: 'deezer';
	externalId: string;
	name: string;
	imageId?: Id | null;
}): { id: Id; created: boolean } {
	const existing = findByExternal('artist', a.provider, a.externalId);
	if (existing !== null) return { id: existing, created: false };
	const id = createEntry({
		type: 'artist',
		title: a.name,
		provider: a.provider,
		externalId: a.externalId,
		imageId: a.imageId
	});
	return { id, created: true };
}

function hydrate(rows: Row[]): Entry[] {
	const tags = loadTags(rows.map((r) => Number(r.id)));
	return rows.map((r) => rowToEntry(r, tags.get(Number(r.id)) ?? []));
}

export function artistWorks(artistId: Id): Entry[] {
	return hydrate(
		getDb()
			.prepare(
				"SELECT * FROM entries WHERE artist_id = ? AND type IN ('album', 'song') ORDER BY type = 'song', created_at DESC, id DESC"
			)
			.all(artistId)
	);
}

export function listArtists(): { id: Id; title: string }[] {
	return getDb()
		.prepare("SELECT id, title FROM entries WHERE type = 'artist'")
		.all()
		.map((r) => ({ id: Number(r.id), title: String(r.title) }))
		.sort((a, b) => collator.compare(a.title, b.title) || a.id - b.id);
}
