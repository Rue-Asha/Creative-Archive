import { ValidationError } from '#lib/errors.ts';
import { fold } from '#lib/text.ts';
import type { Id, Status } from '#lib/types.ts';
import { getDb } from './db.ts';
import { atomic, pruneTags } from './tags.ts';
import { setStatus } from './tracking.ts';

function requireKnown(ids: Id[]): Id[] {
	const find = getDb().prepare('SELECT 1 FROM entries WHERE id = ?');
	const known: Id[] = [];
	const unknown: Id[] = [];
	for (const id of new Set(ids)) {
		const row = find.get(id);
		if (row) known.push(id);
		else unknown.push(id);
	}
	if (unknown.length) throw new ValidationError({ ids: `Unknown entries: ${unknown.join(', ')}` });
	return known;
}

export function bulkSetStatus(ids: Id[], status: Status): number {
	if (ids.length === 0) return 0;
	return atomic(() => {
		let changed = 0;
		for (const id of requireKnown(ids)) if (setStatus(id, status)) changed++;
		return changed;
	});
}

export function bulkTag(ids: Id[], name: string, op: 'add' | 'remove'): number {
	if (ids.length === 0) return 0;
	const key = fold(name);
	if (!key) throw new ValidationError({ tag: 'Tag is required' });
	const db = getDb();
	return atomic(() => {
		const unique = requireKnown(ids);
		const existing = db.prepare('SELECT id FROM tags WHERE name_key = ?').get(key)?.id as number | undefined;
		let changed = 0;
		if (op === 'add') {
			const tagId =
				existing ??
				Number(
					db
						.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)')
						.run(name.normalize('NFC').trim().replace(/\s+/g, ' '), key).lastInsertRowid
				);
			const link = db.prepare('INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)');
			for (const id of unique) changed += Number(link.run(id, tagId).changes);
		} else if (existing !== undefined) {
			const unlink = db.prepare('DELETE FROM entry_tags WHERE entry_id = ? AND tag_id = ?');
			for (const id of unique) changed += Number(unlink.run(id, existing).changes);
			pruneTags();
		}
		return changed;
	});
}
