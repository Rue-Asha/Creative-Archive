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
	renameCollection
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

	it('Scenario: Same entry added twice is kept once', () => {
		const album = insertEntryRow({ type: 'album', title: 'Twice' });
		const id = createCollection('Moodboard');
		addToCollection(id, album);
		addToCollection(id, album);
		expect(getCollection(id)!.count).toBe(1);
		expect(getCollection(id)!.entries).toHaveLength(1);
		expect(listCollections()[0].count).toBe(1);
	});

	it('Scenario: Collage uses the first three images in added order', () => {
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
