import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DuplicateError, ValidationError } from '#lib/errors.ts';
import type { EntryInput, EntryType } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import {
	artistWorks,
	createEntry,
	deleteEntry,
	ensureArtist,
	findByExternal,
	getEntry,
	listArtists,
	updateEntry
} from './entries.ts';
import { insertEntryRow, insertTestImage, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

describe('createEntry', () => {
	it('Scenario: Create an entry of each type', () => {
		const inputs: EntryInput[] = [
			{
				type: 'album',
				title: 'Blonde',
				details: { year: 2016, recordType: 'album', trackCount: 17 },
				artist: { id: null, name: 'Frank Ocean' }
			},
			{ type: 'artist', title: 'Frank Ocean' },
			{
				type: 'song',
				title: 'Nikes',
				details: { year: 2016, albumTitle: 'Blonde' },
				artist: { id: null, name: 'Frank Ocean' }
			},
			{
				type: 'anime',
				title: 'Frieren',
				details: { altTitle: 'Sousou no Frieren', year: 2023 },
				progress: { episodes: { current: 0, total: 28 } }
			},
			{
				type: 'manga',
				title: 'Vagabond',
				details: { altTitle: 'Baganbondo', year: 1998 },
				progress: { chapters: { current: 0, total: null }, volumes: { current: 0, total: 37 } }
			},
			{ type: 'book', title: 'Norwegian Wood', details: { authors: ['Haruki Murakami'], year: 1987 } },
			{
				type: 'brand',
				title: 'Maison Example',
				kind: 'brand',
				details: { url: 'https://brand.example/', description: 'Coats' }
			},
			{
				type: 'site',
				title: 'Shop Example',
				kind: 'shop',
				details: { url: 'https://shop.example/', description: 'Shoes' }
			},
			{
				type: 'influencer',
				title: 'Someone',
				details: { handles: { instagram: 'someone', tiktok: 'someone', youtube: 'someone', website: 'https://someone.example/' } }
			},
			{
				type: 'piece',
				title: 'Wool Coat',
				details: { brand: 'Maison Example', url: 'https://piece.example/coat', price: '240 EUR' }
			},
			{ type: 'look', title: 'Autumn', details: { sourceUrl: 'https://look.example/autumn' } }
		];
		const defaults: Record<EntryType, string | null> = {
			album: 'none', artist: 'none', song: 'none', anime: 'none', manga: 'none', book: 'none',
			brand: null, site: null, influencer: null, piece: 'wishlist', look: null
		};

		for (const input of inputs) {
			const entry = getEntry(createEntry(input))!;
			expect(entry.type).toBe(input.type);
			expect(entry.title).toBe(input.title);
			expect(entry.details).toEqual(input.details ?? {});
			expect(entry.status).toBe(defaults[input.type]);
			expect(entry.createdAt).toBe(entry.updatedAt);
			if (input.artist) expect([entry.artistId, entry.artistName]).toEqual([null, input.artist.name]);
			if (input.progress) expect(entry.progress).toEqual(input.progress);
			if (input.kind) expect(entry.kind).toBe(input.kind);
		}
		expect(count('entries')).toBe(inputs.length);
	});

	it('defaults a piece to wishlist', () => {
		const entry = getEntry(createEntry({ type: 'piece', title: 'Scarf' }))!;
		expect(entry.status).toBe('wishlist');
	});

	it('Scenario: Server rejects a blank title', () => {
		const rejected = (type: EntryType) => {
			try {
				createEntry({ type, title: '   ' });
			} catch (e) {
				return e;
			}
		};
		const book = rejected('book');
		const brand = rejected('brand');

		expect(book).toBeInstanceOf(ValidationError);
		expect((book as ValidationError).fields).toEqual({ title: 'Title is required' });
		expect(brand).toBeInstanceOf(ValidationError);
		expect((brand as ValidationError).fields).toEqual({ title: 'Name is required' });
		expect(count('entries')).toBe(0);
	});

	it('Scenario: Fields of another type are ignored', () => {
		const id = createEntry({
			type: 'book',
			title: 'Norwegian Wood',
			details: { year: 1987, trackCount: 12, albumTitle: 'x' },
			progress: { episodes: { current: 3, total: 10 } },
			artist: { id: null, name: 'Nobody' },
			kind: 'shop',
			rating: 4
		});
		const book = getEntry(id)!;

		expect(book.details).toEqual({ year: 1987 });
		expect(book.progress).toEqual({});
		expect(book.artistName).toBeNull();
		expect(book.kind).toBeNull();
		expect(book.rating).toBe(4);
		const brand = getEntry(createEntry({ type: 'brand', title: 'B', rating: 5, status: 'done' }))!;
		expect([brand.rating, brand.status]).toEqual([null, null]);
	});

	it('Scenario: Kind decides the brand or site type', () => {
		const first = getEntry(createEntry({ type: 'site', title: 'Maison', kind: 'brand' }))!;
		const second = getEntry(createEntry({ type: 'brand', title: 'Corner Shop', kind: 'shop' }))!;

		expect([first.type, first.kind]).toEqual(['brand', 'brand']);
		expect([second.type, second.kind]).toEqual(['site', 'shop']);
	});

	it('Scenario: New entry with a status stores its first event', () => {
		const want = createEntry({ type: 'anime', title: 'Frieren', status: 'want' });
		const none = createEntry({ type: 'anime', title: 'Vinland Saga', status: 'none' });
		const events = (id: number) =>
			getDb().prepare('SELECT status FROM status_events WHERE entry_id = ?').all(id).map((r) => r.status);

		expect(events(want)).toEqual(['want']);
		expect(events(none)).toEqual([]);
	});

	it('Scenario: Server refuses a duplicate provider id on save', () => {
		const first = createEntry({ type: 'album', title: 'Blonde', provider: 'deezer', externalId: 'fake-al-1' });
		let error: unknown;
		try {
			createEntry({ type: 'album', title: 'Blonde again', provider: 'deezer', externalId: 'fake-al-1' });
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(DuplicateError);
		expect((error as DuplicateError).existingId).toBe(first);
		expect(count('entries')).toBe(1);
	});
});

describe('updateEntry', () => {
	it('Scenario: Update bumps the updated timestamp', () => {
		const id = insertEntryRow({ type: 'book', title: 'Old', note: 'before' }, '2026-01-01T00:00:00.000Z');
		const before = getEntry(id)!;

		updateEntry(id, { type: 'book', title: 'Old', note: 'after' });
		const after = getEntry(id)!;

		expect(after.note).toBe('after');
		expect(after.updatedAt > before.updatedAt).toBe(true);
		expect(after.createdAt).toBe(before.createdAt);
	});

	it('Scenario: Editing the kind moves the entry between brand and site', () => {
		const id = createEntry({ type: 'brand', title: 'Maison', kind: 'brand' });

		updateEntry(id, { type: 'brand', title: 'Maison', kind: 'shop' });

		const entry = getEntry(id)!;
		expect([entry.type, entry.kind]).toEqual(['site', 'shop']);
	});
});

describe('deleteEntry', () => {
	it('Scenario: Deleted entry leaves every collection', () => {
		const db = getDb();
		const id = insertEntryRow({ type: 'album', title: 'Blonde', image: true });
		const other = insertEntryRow({ type: 'album', title: 'Ctrl' });
		const imageId = getEntry(id)!.imageId!;
		db.prepare("INSERT INTO status_events (entry_id, status, at) VALUES (?, 'done', '2026-10-01T00:00:00.000Z')").run(id);
		for (const name of ['Summer', 'Night']) {
			const c = Number(
				db.prepare("INSERT INTO collections (name, created_at, updated_at) VALUES (?, 'x', 'x')").run(name).lastInsertRowid
			);
			for (const entry of [id, other])
				db.prepare("INSERT INTO collection_entries (collection_id, entry_id, added_at) VALUES (?, ?, 'x')").run(c, entry);
		}

		deleteEntry(id);

		expect(getEntry(id)).toBeNull();
		expect(count('collections')).toBe(2);
		expect(count('collection_entries')).toBe(2);
		expect(db.prepare('SELECT entry_id FROM collection_entries').all().map((r) => r.entry_id)).toEqual([other, other]);
		expect(count('status_events')).toBe(0);
		expect(db.prepare('SELECT id FROM images WHERE id = ?').get(imageId)).toBeUndefined();
	});

	it('Scenario: Deleting an artist keeps the name text', () => {
		const artist = insertEntryRow({ type: 'artist', title: 'Frank Ocean', image: true });
		const album = insertEntryRow({ type: 'album', title: 'Blonde', artist });
		const song = insertEntryRow({ type: 'song', title: 'Nikes', artist });

		deleteEntry(artist);

		for (const id of [album, song]) {
			const entry = getEntry(id)!;
			expect([entry.artistName, entry.artistId]).toEqual(['Frank Ocean', null]);
		}
		expect(count('images')).toBe(0);
	});
});

describe('image replacement', () => {
	it('Scenario: Replacing an image removes the old row', () => {
		const first = insertEntryRow({ type: 'look', title: 'Autumn', image: true });
		const second = insertEntryRow({ type: 'look', title: 'Winter', image: true });
		const oldFirst = getEntry(first)!.imageId!;
		const oldSecond = getEntry(second)!.imageId!;
		const fresh = insertTestImage(9);

		updateEntry(first, { type: 'look', title: 'Autumn', imageId: fresh });
		updateEntry(second, { type: 'look', title: 'Winter', imageId: null });

		expect(getEntry(first)!.imageId).toBe(fresh);
		expect(getEntry(second)!.imageId).toBeNull();
		const rows = getDb().prepare('SELECT id FROM images').all().map((r) => r.id);
		expect(rows).toEqual([fresh]);
		expect(rows).not.toContain(oldFirst);
		expect(rows).not.toContain(oldSecond);
	});

	it('keeps the image when the update leaves imageId alone or sets the same one', () => {
		const id = insertEntryRow({ type: 'look', title: 'Autumn', image: true });
		const imageId = getEntry(id)!.imageId!;

		updateEntry(id, { type: 'look', title: 'Autumn 2' });
		updateEntry(id, { type: 'look', title: 'Autumn 3', imageId });

		expect(getEntry(id)!.imageId).toBe(imageId);
		expect(count('images')).toBe(1);
	});
});

describe('artists', () => {
	it('Scenario: Ensure artist reuses the same Deezer id', () => {
		const imageId = insertTestImage(1);
		const first = ensureArtist({ provider: 'deezer', externalId: '100', name: 'Frank Ocean', imageId });
		const second = ensureArtist({ provider: 'deezer', externalId: '100', name: 'Frank Ocean' });

		expect(first.created).toBe(true);
		expect(second).toEqual({ id: first.id, created: false });
		expect(count('entries')).toBe(1);
		const artist = getEntry(first.id)!;
		expect([artist.type, artist.status, artist.imageId, artist.provider, artist.externalId]).toEqual([
			'artist',
			'none',
			imageId,
			'deezer',
			'100'
		]);
		expect(count('status_events')).toBe(0);
	});

	it('Scenario: Same name with different Deezer ids stays separate', () => {
		const a = ensureArtist({ provider: 'deezer', externalId: '201', name: 'Nova' });
		const b = ensureArtist({ provider: 'deezer', externalId: '202', name: 'Nova' });

		expect(a.id).not.toBe(b.id);
		expect(listArtists().map((x) => x.title)).toEqual(['Nova', 'Nova']);
	});

	it('findByExternal matches type, provider and external id', () => {
		const id = createEntry({ type: 'album', title: 'Blonde', provider: 'deezer', externalId: '7' });

		expect(findByExternal('album', 'deezer', '7')).toBe(id);
		expect(findByExternal('artist', 'deezer', '7')).toBeNull();
		expect(findByExternal('album', 'deezer', '8')).toBeNull();
	});

	it('artistWorks lists linked albums then songs, newest first', () => {
		const artist = insertEntryRow({ type: 'artist', title: 'Frank Ocean' });
		const other = insertEntryRow({ type: 'artist', title: 'SZA' });
		const old = insertEntryRow({ type: 'album', title: 'Old', artist, createdAt: '2026-01-01T00:00:00.000Z' });
		const fresh = insertEntryRow({ type: 'album', title: 'Fresh', artist, createdAt: '2026-03-01T00:00:00.000Z' });
		const song = insertEntryRow({ type: 'song', title: 'Nikes', artist, createdAt: '2026-04-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Theirs', artist: other });
		insertEntryRow({ type: 'album', title: 'Text only', artist: 'Frank Ocean' });

		expect(artistWorks(artist).map((e) => e.id)).toEqual([fresh, old, song]);
		expect(artistWorks(other)).toHaveLength(1);
	});

	it('listArtists is in Unicode title order', () => {
		for (const title of ['zaz', 'Ärzte', 'beck', 'Alpha']) insertEntryRow({ type: 'artist', title });
		insertEntryRow({ type: 'album', title: 'Not an artist' });

		expect(listArtists().map((a) => a.title)).toEqual(['Alpha', 'Ärzte', 'beck', 'zaz']);
	});
});
