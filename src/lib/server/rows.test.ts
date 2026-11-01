import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { entryColumns, loadTags, rowToEntry } from './rows.ts';
import { insertEntryRow, testImage, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const T = '2026-10-31T08:00:00.000Z';

function row(id: number): Record<string, unknown> {
	return getDb().prepare('SELECT * FROM entries WHERE id = ?').get(id) as Record<string, unknown>;
}

describe('rowToEntry', () => {
	it('maps a stored album to the read model', () => {
		const artist = insertEntryRow({ type: 'artist', title: 'Frank Ocean' }, T);
		const id = insertEntryRow(
			{
				type: 'album',
				title: 'Blonde',
				status: 'done',
				rating: 4.5,
				artist,
				provider: 'deezer',
				externalId: 'fake-al-1',
				details: { year: 2016, recordType: 'album', trackCount: 17 },
				note: 'Summer',
				image: true,
				createdAt: '2026-10-01T00:00:00.000Z'
			},
			T
		);
		const tags = [{ id: 1, name: 'R&B', count: 1 }];

		const entry = rowToEntry(row(id), tags);

		expect(entry).toEqual({
			id,
			type: 'album',
			title: 'Blonde',
			status: 'done',
			rating: 4.5,
			progress: {},
			kind: null,
			artistId: artist,
			artistName: 'Frank Ocean',
			provider: 'deezer',
			externalId: 'fake-al-1',
			imageId: expect.any(Number),
			details: { year: 2016, recordType: 'album', trackCount: 17 },
			tags,
			note: 'Summer',
			createdAt: '2026-10-01T00:00:00.000Z',
			updatedAt: '2026-10-01T00:00:00.000Z'
		});
	});

	it('gives anime and manga their progress keys, unknown totals as null', () => {
		const anime = insertEntryRow({ type: 'anime', title: 'Frieren', progress: { episodes: { current: 0, total: 28 } } });
		const manga = insertEntryRow({ type: 'manga', title: 'Vagabond', progress: { chapters: { current: 120, total: null } } });

		expect(rowToEntry(row(anime), []).progress).toEqual({ episodes: { current: 0, total: 28 } });
		expect(rowToEntry(row(manga), []).progress).toEqual({
			chapters: { current: 120, total: null },
			volumes: { current: 0, total: null }
		});
	});

	it('maps an unrated, unlinked shop', () => {
		const id = insertEntryRow({ type: 'site', title: 'Shop', kind: 'shop', details: { url: 'https://shop.example/' } });

		expect(rowToEntry(row(id), [])).toMatchObject({
			status: null,
			rating: null,
			kind: 'shop',
			artistId: null,
			artistName: null,
			imageId: null,
			details: { url: 'https://shop.example/' },
			note: ''
		});
	});
});

describe('entryColumns', () => {
	it('turns an entry input into column values', () => {
		expect(
			entryColumns({
				type: 'manga',
				title: '  Vagabond ',
				status: 'progress',
				rating: 3.5,
				progress: { chapters: { current: 12, total: null }, volumes: { current: 2, total: 37 } },
				provider: 'anilist',
				externalId: '656',
				imageId: null,
				details: { altTitle: 'バガボンド', year: 1998 },
				tags: ['Samurai'],
				note: 'Reread'
			})
		).toEqual({
			type: 'manga',
			title: 'Vagabond',
			title_key: 'vagabond',
			status: 'progress',
			rating_x2: 7,
			chapters: 12,
			chapters_total: null,
			volumes: 2,
			volumes_total: 37,
			provider: 'anilist',
			external_id: '656',
			image_id: null,
			details: '{"altTitle":"バガボンド","year":1998}',
			note: 'Reread'
		});
	});

	it('leaves out what the input does not mention, so an update keeps it', () => {
		expect(entryColumns({ type: 'look', title: 'Layers' })).toEqual({ type: 'look', title: 'Layers', title_key: 'layers' });
	});

	it('writes the artist link, kind and a cleared rating', () => {
		expect(
			entryColumns({ type: 'song', title: 'Nikes', artist: { id: 4, name: 'Frank Ocean' }, rating: null })
		).toMatchObject({ artist_id: 4, artist_name: 'Frank Ocean', rating_x2: null });
		expect(entryColumns({ type: 'song', title: 'Nikes', artist: null })).toMatchObject({ artist_id: null, artist_name: null });
		expect(entryColumns({ type: 'brand', title: 'Maison', kind: 'brand' })).toMatchObject({ kind: 'brand' });
	});
});

describe('loadTags', () => {
	it('returns each entry its tags in name order with use counts, and none for untagged entries', () => {
		const a = insertEntryRow({ type: 'album', title: 'Blonde', tags: ['Summer', 'Ästhetik'] });
		const b = insertEntryRow({ type: 'book', title: 'Norwegian Wood', tags: ['ästhetik'] });
		const c = insertEntryRow({ type: 'look', title: 'Layers' });

		const tags = loadTags([a, b, c]);

		const key = (n: string) => getDb().prepare('SELECT id FROM tags WHERE name = ?').get(n)?.id;
		expect(tags.get(a)).toEqual([
			{ id: key('Summer'), name: 'Summer', count: 1 },
			{ id: key('Ästhetik'), name: 'Ästhetik', count: 2 }
		]);
		expect(tags.get(b)).toEqual([{ id: key('Ästhetik'), name: 'Ästhetik', count: 2 }]);
		expect(tags.get(c)).toEqual([]);
	});

	it('returns an empty map for no ids', () => {
		expect(loadTags([]).size).toBe(0);
	});
});

describe('test database helpers', () => {
	it('useTestDb gives a fresh migrated database each time', () => {
		insertEntryRow({ type: 'look', title: 'Layers' });

		useTestDb();

		expect(getDb().prepare('SELECT count(*) AS n FROM entries').get()?.n).toBe(0);
		expect(getDb().prepare("SELECT 1 FROM sqlite_master WHERE name = 'heroes'").get()).toBeDefined();
	});

	it('insertEntryRow fills defaults the way the app would', () => {
		const album = insertEntryRow({ type: 'album', title: 'Blonde' }, T);
		const piece = insertEntryRow({ type: 'piece', title: 'Wool Coat' }, T);
		const brand = insertEntryRow({ type: 'brand', title: 'Maison' }, T);

		expect(row(album)).toMatchObject({ status: 'none', title_key: 'blonde', created_at: T, updated_at: T, image_id: null });
		expect(row(piece).status).toBe('wishlist');
		expect(row(brand).status).toBeNull();
	});

	it('insertEntryRow keeps explicit timestamps and stores a plain artist name', () => {
		const id = insertEntryRow({
			type: 'song',
			title: 'Unknown',
			artist: 'Unknown Band',
			createdAt: '2026-01-01T00:00:00.000Z',
			updatedAt: '2026-02-01T00:00:00.000Z'
		});

		expect(row(id)).toMatchObject({
			artist_id: null,
			artist_name: 'Unknown Band',
			created_at: '2026-01-01T00:00:00.000Z',
			updated_at: '2026-02-01T00:00:00.000Z'
		});
	});

	it('insertEntryRow dedupes tags by fold and ignores blank ones', () => {
		const id = insertEntryRow({ type: 'album', title: 'Blonde', tags: ['Ästhetik', ' ästhetik ', '  ', 'Summer'] });

		expect(getDb().prepare('SELECT name FROM tags ORDER BY name').all().map((r) => r.name)).toEqual(['Summer', 'Ästhetik']);
		expect(getDb().prepare('SELECT count(*) AS n FROM entry_tags WHERE entry_id = ?').get(id)?.n).toBe(2);
	});

	it('insertEntryRow stores a generated image', () => {
		const id = insertEntryRow({ type: 'look', title: 'Layers', image: true });

		const image = getDb().prepare('SELECT mime, bytes FROM images WHERE id = ?').get(row(id).image_id as number);
		expect(image?.mime).toBe('image/png');
		expect((image?.bytes as Uint8Array).length).toBeGreaterThan(0);
	});

	it('testImage is a PNG whose colour varies by index', () => {
		const png = testImage(0);

		expect([...png.slice(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
		expect(Buffer.from(testImage(1)).equals(Buffer.from(png))).toBe(false);
		expect(Buffer.from(testImage(0)).equals(Buffer.from(png))).toBe(true);
	});
});
