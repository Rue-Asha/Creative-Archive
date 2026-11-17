import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValidationError } from '#lib/errors.ts';
import type { Id } from '#lib/types.ts';
import { bulkSetStatus, bulkTag } from './bulk.ts';
import { closeDb, getDb } from './db.ts';
import { listTags } from './tags.ts';
import { insertEntryRow, useTestDb } from './testing.ts';
import { statusEvents } from './tracking.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const statusOf = (id: Id) => getDb().prepare('SELECT status FROM entries WHERE id = ?').get(id)?.status;
const tagsOf = (id: Id) =>
	getDb()
		.prepare('SELECT t.name FROM entry_tags et JOIN tags t ON t.id = et.tag_id WHERE et.entry_id = ? ORDER BY t.name')
		.all(id)
		.map((r) => String(r.name));

describe('bulkSetStatus', () => {
	it('Scenario: Bulk status sets every entry and records events', () => {
		const [a, b, c] = ['A', 'B', 'C'].map((title, i) => insertEntryRow({ type: 'album', title, status: i === 2 ? 'done' : 'want' }));
		const before = statusEvents(c).length;

		expect(bulkSetStatus([a, b, c], 'done')).toBe(2);

		expect([a, b, c].map(statusOf)).toEqual(['done', 'done', 'done']);
		for (const id of [a, b]) expect(statusEvents(id).filter((e) => e.status === 'done')).toHaveLength(1);
		expect(statusEvents(c)).toHaveLength(before);
	});

	it('Scenario: Unknown id changes nothing', () => {
		const a = insertEntryRow({ type: 'album', title: 'A', status: 'want', tags: ['Keep'] });

		expect(() => bulkSetStatus([a, 999999], 'done')).toThrow(ValidationError);
		expect(() => bulkSetStatus([a, 999999], 'done')).toThrow(/999999/);
		expect(() => bulkTag([a, 999999], 'Summer', 'add')).toThrow(ValidationError);
		expect(() => bulkTag([a, 999999], 'Summer', 'add')).toThrow(/999999/);

		expect(statusOf(a)).toBe('want');
		expect(tagsOf(a)).toEqual(['Keep']);
		expect(listTags().map((t) => t.name)).toEqual(['Keep']);
	});

	it('Scenario: Invalid status for a type is rejected', () => {
		const album = insertEntryRow({ type: 'album', title: 'A', status: 'want' });
		const piece = insertEntryRow({ type: 'piece', title: 'P', status: 'wishlist' });

		expect(() => bulkSetStatus([album, piece], 'owned')).toThrow(ValidationError);
		expect(() => bulkSetStatus([album, piece], 'owned')).toThrow(/album/);

		expect(statusOf(album)).toBe('want');
		expect(statusOf(piece)).toBe('wishlist');
		expect(statusEvents(album).filter((e) => e.status === 'owned')).toHaveLength(0);
	});

	it('Scenario: Empty id list is a no-op', () => {
		const a = insertEntryRow({ type: 'album', title: 'A', status: 'want' });

		expect(bulkSetStatus([], 'done')).toBe(0);
		expect(bulkTag([], 'Summer', 'add')).toBe(0);

		expect(statusOf(a)).toBe('want');
		expect(listTags()).toEqual([]);
	});
});

describe('bulkTag', () => {
	it('Scenario: Bulk tag reuses and prunes tags', () => {
		const [a, b] = ['A', 'B'].map((title) => insertEntryRow({ type: 'album', title }));
		getDb().prepare("INSERT INTO tags (name, name_key) VALUES ('Summer', 'summer')").run();

		expect(bulkTag([a, b], 'summer', 'add')).toBe(2);
		expect(tagsOf(a)).toEqual(['Summer']);
		expect(tagsOf(b)).toEqual(['Summer']);
		expect(listTags()).toHaveLength(1);

		expect(bulkTag([a, b], 'Summer', 'remove')).toBe(2);
		expect(listTags()).toEqual([]);
	});
});
