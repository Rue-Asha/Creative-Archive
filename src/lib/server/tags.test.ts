import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { createEntry, deleteEntry, getEntry, updateEntry } from './entries.ts';
import { listTags, setEntryTags } from './tags.ts';
import { insertEntryRow, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const names = (id: number) => getEntry(id)!.tags.map((t) => t.name);

describe('tags', () => {
	it('Scenario: Tags are global across types', () => {
		createEntry({ type: 'album', title: 'Blonde', tags: ['Summer'] });
		createEntry({ type: 'piece', title: 'Scarf', tags: ['Summer'] });

		expect(listTags()).toEqual([{ id: expect.any(Number), name: 'Summer', count: 2 }]);
	});

	it('Scenario: Tag names dedupe ignoring case including umlauts', () => {
		const a = createEntry({ type: 'book', title: 'A', tags: ['Ästhetik'] });
		const b = createEntry({ type: 'book', title: 'B', tags: ['ästhetik'] });
		createEntry({ type: 'book', title: 'C', tags: ['vinyl'] });
		const d = createEntry({ type: 'book', title: 'D', tags: [' VINYL '] });

		expect(listTags().map((t) => [t.name, t.count])).toEqual([
			['Ästhetik', 2],
			['vinyl', 2]
		]);
		expect(names(a)).toEqual(['Ästhetik']);
		expect(names(b)).toEqual(['Ästhetik']);
		expect(names(d)).toEqual(['vinyl']);
	});

	it('first spelling wins inside one call, and spaces collapse', () => {
		const id = createEntry({ type: 'book', title: 'A', tags: ['Lo  Fi', 'lo fi', 'LO FI'] });

		expect(names(id)).toEqual(['Lo Fi']);
	});

	it('Scenario: Empty and whitespace tags are ignored', () => {
		const id = insertEntryRow({ type: 'book', title: 'A' });

		setEntryTags(id, ['', '   ', 'Jazz']);

		expect(names(id)).toEqual(['Jazz']);
		expect(listTags().map((t) => t.name)).toEqual(['Jazz']);
	});

	it('Scenario: Unused tags are removed', () => {
		const rare = createEntry({ type: 'book', title: 'A', tags: ['Rare', 'Keep'] });
		const old = createEntry({ type: 'book', title: 'B', tags: ['Old', 'Keep'] });

		updateEntry(rare, { type: 'book', title: 'A', tags: ['Keep'] });
		deleteEntry(old);

		expect(listTags().map((t) => t.name)).toEqual(['Keep']);
		expect(listTags()[0].count).toBe(1);
	});

	it('updateEntry without tags keeps them, with an empty list clears them', () => {
		const id = createEntry({ type: 'book', title: 'A', tags: ['Jazz'] });

		updateEntry(id, { type: 'book', title: 'A2' });
		expect(names(id)).toEqual(['Jazz']);
		updateEntry(id, { type: 'book', title: 'A2', tags: [] });
		expect(names(id)).toEqual([]);
		expect(listTags()).toEqual([]);
	});

	it('lists tags in Unicode name order', () => {
		createEntry({ type: 'book', title: 'A', tags: ['zebra', 'Ästhetik', 'beta', 'Alpha'] });

		expect(listTags().map((t) => t.name)).toEqual(['Alpha', 'Ästhetik', 'beta', 'zebra']);
	});
});
