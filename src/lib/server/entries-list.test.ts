import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { BRANDS_SHOPS } from '#lib/entries/config.ts';
import { createEntry, listEntries, updateEntry } from './entries.ts';
import { listTags } from './tags.ts';
import { insertEntryRow, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const titles = (entries: { title: string }[]) => entries.map((e) => e.title);

describe('listEntries', () => {
	it('Scenario: Combined brands-and-shops query spans both stored types', () => {
		insertEntryRow({ type: 'brand', title: 'Brand', kind: 'brand' });
		insertEntryRow({ type: 'site', title: 'Shop', kind: 'shop' });
		insertEntryRow({ type: 'site', title: 'Site', kind: 'site' });
		insertEntryRow({ type: 'look', title: 'A look' });

		expect(titles(listEntries(BRANDS_SHOPS.query)).sort()).toEqual(['Brand', 'Shop', 'Site']);
		expect(titles(listEntries({ ...BRANDS_SHOPS.query, kind: 'shop' }))).toEqual(['Shop']);
	});

	it('Scenario: Changing the kind keeps the entry in the combined list', () => {
		const id = createEntry({ type: 'brand', title: 'Maison', kind: 'brand' });
		updateEntry(id, { type: 'brand', title: 'Maison', kind: 'shop' });

		const found = listEntries(BRANDS_SHOPS.query);
		expect(titles(found)).toEqual(['Maison']);
		expect(found[0].kind).toBe('shop');
	});

	it('Scenario: List query filters by status, kind, tag and minimum rating', () => {
		insertEntryRow({ type: 'album', title: 'Done 10', status: 'done', rating: 10, tags: ['Summer'], createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Done 7', status: 'done', rating: 7, createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Want 8', status: 'want', rating: 8, tags: ['Summer'], createdAt: '2026-01-03T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Unrated', status: 'done', createdAt: '2026-01-04T00:00:00.000Z' });
		insertEntryRow({ type: 'song', title: 'A song', status: 'done', rating: 10, createdAt: '2026-01-05T00:00:00.000Z' });
		insertEntryRow({ type: 'site', title: 'Shop', kind: 'shop' });
		insertEntryRow({ type: 'site', title: 'Site', kind: 'site' });
		insertEntryRow({ type: 'brand', title: 'Brand', kind: 'brand' });
		insertEntryRow({ type: 'piece', title: 'Owned coat', status: 'owned', createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'piece', title: 'Wish scarf', status: 'wishlist', createdAt: '2026-01-02T00:00:00.000Z' });
		const summer = listTags().find((t) => t.name === 'Summer')!.id;

		expect(titles(listEntries({ types: ['album'], status: 'done' }))).toEqual(['Unrated', 'Done 7', 'Done 10']);
		expect(titles(listEntries({ types: ['site', 'brand'], kind: 'site' }))).toEqual(['Site']);
		expect(titles(listEntries({ types: ['album'], tag: summer }))).toEqual(['Want 8', 'Done 10']);
		expect(titles(listEntries({ types: ['album'], minRating: 8 }))).toEqual(['Want 8', 'Done 10']);
		expect(titles(listEntries({ types: ['album'], minRating: 7 }))).toEqual(['Want 8', 'Done 7', 'Done 10']);
		expect(titles(listEntries({ types: ['album'], status: 'done', minRating: 8, tag: summer }))).toEqual(['Done 10']);
		expect(titles(listEntries({ types: ['piece'], status: 'owned' }))).toEqual(['Owned coat']);
		expect(titles(listEntries({ types: ['album', 'song'] })).sort()).toEqual(
			['A song', 'Done 7', 'Done 10', 'Unrated', 'Want 8'].sort()
		);
		expect(listEntries({ types: ['look'] })).toEqual([]);
		expect(listEntries({ types: [] })).toEqual([]);
	});

	it('Scenario: Minimum rating uses the 0 to 10 scale', () => {
		insertEntryRow({ type: 'album', title: 'Seven', rating: 7, createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Seven and a half', rating: 7.5, createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Nine', rating: 9.25, createdAt: '2026-01-03T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Unrated', createdAt: '2026-01-04T00:00:00.000Z' });

		expect(titles(listEntries({ types: ['album'], minRating: 7.5 }))).toEqual(['Nine', 'Seven and a half']);
	});

	it('Scenario: List query sorts by added, rating and title', () => {
		insertEntryRow({ type: 'album', title: 'Zeta', rating: 6, createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Ästhetik', createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'alpha', rating: 10, createdAt: '2026-01-03T00:00:00.000Z' });

		expect(titles(listEntries({ types: ['album'] }))).toEqual(['alpha', 'Ästhetik', 'Zeta']);
		expect(titles(listEntries({ types: ['album'], sort: 'added' }))).toEqual(['alpha', 'Ästhetik', 'Zeta']);
		expect(titles(listEntries({ types: ['album'], sort: 'rating' }))).toEqual(['alpha', 'Zeta', 'Ästhetik']);
		expect(titles(listEntries({ types: ['album'], sort: 'title' }))).toEqual(['alpha', 'Ästhetik', 'Zeta']);
	});

	it('returns tags with counts on every entry', () => {
		insertEntryRow({ type: 'album', title: 'A', tags: ['Summer', 'Jazz'] });
		insertEntryRow({ type: 'album', title: 'B', tags: ['summer'] });

		const [b, a] = listEntries({ types: ['album'] });

		expect(a.tags.map((t) => [t.name, t.count])).toEqual([['Jazz', 1], ['Summer', 2]]);
		expect(b.tags.map((t) => [t.name, t.count])).toEqual([['Summer', 2]]);
	});

	it('breaks ties by newest added', () => {
		insertEntryRow({ type: 'album', title: 'Same', rating: 8, createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'same', rating: 8, createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Other', rating: 8, createdAt: '2026-01-03T00:00:00.000Z' });

		expect(titles(listEntries({ types: ['album'], sort: 'rating' }))).toEqual(['Other', 'same', 'Same']);
		expect(titles(listEntries({ types: ['album'], sort: 'title' }))).toEqual(['Other', 'same', 'Same']);
	});
});
