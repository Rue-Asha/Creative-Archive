import { TYPES } from '#lib/entries/config.ts';
import { ratingFromX2, ratingToX2 } from '#lib/entries/derive.ts';
import { fold } from '#lib/text.ts';
import type { Entry, EntryInput, EntryType, Id, Progress, ProviderId, SiteKind, Status, Tag } from '#lib/types.ts';
import { getDb } from './db.ts';

const nullable = <T>(v: unknown) => (v === null || v === undefined ? null : (v as T));

export function rowToEntry(row: Record<string, unknown>, tags: Tag[]): Entry {
	const type = row.type as EntryType;
	const progress: Entry['progress'] = {};
	for (const key of TYPES[type].progress)
		progress[key] = { current: Number(row[key] ?? 0), total: nullable<number>(row[`${key}_total`]) };
	return {
		id: Number(row.id),
		type,
		title: String(row.title),
		status: nullable<Status>(row.status),
		rating: ratingFromX2(nullable<number>(row.rating_x2)),
		progress,
		kind: nullable<SiteKind>(row.kind),
		artistId: nullable<Id>(row.artist_id),
		artistName: nullable<string>(row.artist_name),
		provider: nullable<ProviderId>(row.provider),
		externalId: nullable<string>(row.external_id),
		imageId: nullable<Id>(row.image_id),
		details: JSON.parse(String(row.details)),
		tags,
		note: String(row.note),
		createdAt: String(row.created_at),
		updatedAt: String(row.updated_at)
	};
}

// Only the fields the input mentions become columns, so an UPDATE built from it keeps the rest and an INSERT
// falls back to the column defaults. Tags and timestamps are the caller's.
export function entryColumns(input: EntryInput): Record<string, unknown> {
	const title = input.title.trim();
	const cols: Record<string, unknown> = { type: input.type, title, title_key: fold(title) };
	if (input.status !== undefined) cols.status = input.status;
	if (input.rating !== undefined) cols.rating_x2 = ratingToX2(input.rating);
	for (const [key, p] of Object.entries(input.progress ?? {}) as [string, Progress][]) {
		cols[key] = p.current;
		cols[`${key}_total`] = p.total;
	}
	if (input.kind !== undefined) cols.kind = input.kind;
	if (input.artist !== undefined) {
		cols.artist_id = input.artist?.id ?? null;
		cols.artist_name = input.artist?.name ?? null;
	}
	if (input.provider !== undefined) cols.provider = input.provider;
	if (input.externalId !== undefined) cols.external_id = input.externalId;
	if (input.imageId !== undefined) cols.image_id = input.imageId;
	if (input.details !== undefined) cols.details = JSON.stringify(input.details);
	if (input.note !== undefined) cols.note = input.note;
	return cols;
}

export function loadTags(entryIds: Id[]): Map<Id, Tag[]> {
	const out = new Map<Id, Tag[]>(entryIds.map((id) => [id, []]));
	if (entryIds.length === 0) return out;
	const rows = getDb()
		.prepare(
			`SELECT et.entry_id, t.id, t.name, (SELECT count(*) FROM entry_tags u WHERE u.tag_id = t.id) AS count
			 FROM entry_tags et JOIN tags t ON t.id = et.tag_id
			 WHERE et.entry_id IN (SELECT value FROM json_each(?))
			 ORDER BY t.name_key`
		)
		.all(JSON.stringify(entryIds));
	for (const r of rows)
		out.get(Number(r.entry_id))?.push({ id: Number(r.id), name: String(r.name), count: Number(r.count) });
	return out;
}
