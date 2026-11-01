import { fold } from '#lib/text.ts';
import type { Id, Tag } from '#lib/types.ts';
import { getDb } from './db.ts';

// savepoints nest, so a function that runs its own transaction can also run inside another one
export function atomic<T>(fn: () => T): T {
	const db = getDb();
	db.exec('SAVEPOINT atomic');
	try {
		const result = fn();
		db.exec('RELEASE atomic');
		return result;
	} catch (e) {
		db.exec('ROLLBACK TO atomic');
		db.exec('RELEASE atomic');
		throw e;
	}
}

const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

export function pruneTags(): void {
	getDb().exec('DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM entry_tags)');
}

// the first spelling seen wins, whether it is already stored or earlier in the same list
export function setEntryTags(entryId: Id, names: string[]): void {
	const db = getDb();
	const wanted = new Map<string, string>();
	for (const name of names) {
		const key = fold(name);
		if (key && !wanted.has(key)) wanted.set(key, name.normalize('NFC').trim().replace(/\s+/g, ' '));
	}
	atomic(() => {
		db.prepare('DELETE FROM entry_tags WHERE entry_id = ?').run(entryId);
		const find = db.prepare('SELECT id FROM tags WHERE name_key = ?');
		const create = db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)');
		const link = db.prepare('INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, ?)');
		for (const [key, name] of wanted) {
			const tagId = (find.get(key)?.id as number | undefined) ?? Number(create.run(name, key).lastInsertRowid);
			link.run(entryId, tagId);
		}
		pruneTags();
	});
}

export function listTags(): Tag[] {
	return getDb()
		.prepare(
			`SELECT t.id, t.name, count(*) AS count FROM tags t JOIN entry_tags et ON et.tag_id = t.id GROUP BY t.id`
		)
		.all()
		.map((r) => ({ id: Number(r.id), name: String(r.name), count: Number(r.count) }))
		.sort((a, b) => collator.compare(a.name, b.name) || a.id - b.id);
}
