import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ValidationError } from '#lib/errors.ts';
import { closeDb } from './db.ts';
import {
	addToCollection,
	collectionsOf,
	createCollection,
	deleteCollection,
	getCollection,
	listCollections,
	removeFromCollection,
	removeManyFromCollection,
	renameCollection,
	reorderCollection
} from './collections.ts';
import { getEntry } from './entries.ts';
import { insertEntryRow, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

describe('collections', () => {
	it('Scenario: Collection requires a name', () => {
		let error: unknown;
		try {
			createCollection('  ');
		} catch (e) {
			error = e;
		}
		expect(error).toBeInstanceOf(ValidationError);
		expect((error as ValidationError).fields).toEqual({ name: 'Name is required' });
		expect(listCollections()).toEqual([]);
	});

	it('Scenario: Magazine joins a collection', () => {
		const magazine = insertEntryRow({ type: 'magazine', title: 'Vestoj', details: { handles: { instagram: 'vestoj' } } });
		const id = createCollection('Reading');

		addToCollection(id, magazine);

		expect(getCollection(id)!.entries.map((e) => e.id)).toEqual([magazine]);
		expect(getCollection(id)!.entries[0].type).toBe('magazine');
	});

	it('Scenario: Same entry added twice is kept once', () => {
		const album = insertEntryRow({ type: 'album', title: 'Twice' });
		const id = createCollection('Moodboard');
		addToCollection(id, album);
		addToCollection(id, album);
		expect(getCollection(id)!.count).toBe(1);
		expect(getCollection(id)!.entries).toHaveLength(1);
		expect(listCollections()[0].count).toBe(1);
	});

	it('Scenario: Collage uses the first three images in collection order', () => {
		const plain = insertEntryRow({ type: 'album', title: 'No image' });
		const withImage = [1, 2, 3, 4].map((n) => insertEntryRow({ type: 'manga', title: `Image ${n}`, image: true }));
		const id = createCollection('Mixed');
		for (const entry of [plain, ...withImage]) addToCollection(id, entry);

		const collection = getCollection(id)!;
		const expected = withImage.slice(0, 3).map((entry) => getEntry(entry)!.imageId);
		expect(collection.collage).toEqual(expected);
		expect(collection.collage).toHaveLength(3);
		expect(collection.count).toBe(5);
		expect(collection.entries.map((e) => e.id)).toEqual([plain, ...withImage]);
		expect(listCollections()[0].collage).toEqual(expected);
	});

	it('Scenario: Deleting a collection keeps its entries', () => {
		const a = insertEntryRow({ type: 'album', title: 'A' });
		const b = insertEntryRow({ type: 'book', title: 'B' });
		const id = createCollection('Gone soon');
		addToCollection(id, a);
		addToCollection(id, b);
		deleteCollection(id);
		expect(getCollection(id)).toBeNull();
		expect(getEntry(a)).not.toBeNull();
		expect(getEntry(b)).not.toBeNull();
	});

	it('Scenario: Rename a collection', () => {
		const id = createCollection('Old', 'first');
		renameCollection(id, 'Autumn', 'Leaves and cardigans');
		expect(getCollection(id)).toMatchObject({ name: 'Autumn', description: 'Leaves and cardigans' });
	});
	it('Scenario: Reordering changes the order and the collage', () => {
		const withImage = [1, 2, 3, 4].map((n) => insertEntryRow({ type: 'manga', title: `Image ${n}`, image: true }));
		const id = createCollection('Mixed');
		for (const entry of withImage) addToCollection(id, entry);

		reorderCollection(id, [withImage[3], ...withImage.slice(0, 3)]);

		const collection = getCollection(id)!;
		expect(collection.entries[0].id).toBe(withImage[3]);
		expect(collection.collage[0]).toBe(getEntry(withImage[3])!.imageId);
		expect(collection.count).toBe(4);
	});
});

describe('collection order', () => {
	function three() {
		const [a, b, c] = ['A', 'B', 'C'].map((title) => insertEntryRow({ type: 'album', title }));
		const id = createCollection('Ordered');
		addToCollection(id, a);
		addToCollection(id, b);
		return { a, b, c, id };
	}
	const order = (id: number) => getCollection(id)!.entries.map((e) => e.id);

	it('Scenario: New entry goes to the end', () => {
		const { a, b, c, id } = three();
		addToCollection(id, c);
		expect(order(id)).toEqual([a, b, c]);
	});

	it('Scenario: Removing keeps the order of the rest', () => {
		const { a, b, c, id } = three();
		addToCollection(id, c);
		const d = insertEntryRow({ type: 'album', title: 'D' });
		removeFromCollection(id, b);
		addToCollection(id, d);
		expect(order(id)).toEqual([a, c, d]);
	});

	it('Scenario: Reorder sets the given order', () => {
		closeDb();
		process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'archive-order-')), 'o.db');
		const { a, b, c, id } = three();
		addToCollection(id, c);
		reorderCollection(id, [c, a, b]);
		expect(order(id)).toEqual([c, a, b]);
		closeDb();
		expect(order(id)).toEqual([c, a, b]);
	});

	it('Scenario: Reorder with a wrong id set is rejected', () => {
		const { a, b, c, id } = three();
		addToCollection(id, c);
		const x = insertEntryRow({ type: 'album', title: 'X' });
		for (const ids of [[a, b], [a, b, c, x], [a, a, b]]) expect(() => reorderCollection(id, ids)).toThrow(ValidationError);
		expect(order(id)).toEqual([a, b, c]);
	});
});

describe('collection membership', () => {
	it('removes an entry and lists the collections holding one', () => {
		const album = insertEntryRow({ type: 'album', title: 'Member' });
		const a = createCollection('A');
		const b = createCollection('B');
		addToCollection(a, album);
		addToCollection(b, album);
		expect(collectionsOf(album)).toEqual([a, b]);
		removeFromCollection(a, album);
		expect(collectionsOf(album)).toEqual([b]);
		expect(getCollection(a)!.count).toBe(0);
		expect(getEntry(album)).not.toBeNull();
	});

	it('keeps the description when rename omits it and lists newest first', () => {
		const first = createCollection('First', 'kept');
		const second = createCollection('Second');
		renameCollection(first, 'Renamed');
		expect(getCollection(first)!.description).toBe('kept');
		expect(listCollections().map((c) => c.id)).toEqual([second, first]);
		expect(() => renameCollection(first, ' ')).toThrow(ValidationError);
	});
});

describe('removeManyFromCollection', () => {
	it('Scenario: Remove several keeps the rest in order', () => {
		const [a, b, c, d, e] = ['A', 'B', 'C', 'D', 'E'].map((title) => insertEntryRow({ type: 'album', title }));
		const id = createCollection('Many');
		for (const entry of [a, b, c, d, e]) addToCollection(id, entry);
		const order = () => getCollection(id)!.entries.map((x) => x.id);

		expect(removeManyFromCollection(id, [b, d])).toBe(2);
		expect(order()).toEqual([a, c, e]);
		expect(getEntry(b)).not.toBeNull();
		expect(getEntry(d)).not.toBeNull();

		expect(() => removeManyFromCollection(id, [a, 999999])).toThrow(ValidationError);
		expect(order()).toEqual([a, c, e]);
	});
});
