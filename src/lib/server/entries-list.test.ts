import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { listEntries } from './entries.ts';
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
	it('Scenario: List query filters by status, kind, tag and minimum rating', () => {
		insertEntryRow({ type: 'album', title: 'Done 5', status: 'done', rating: 5, tags: ['Summer'], createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Done 3.5', status: 'done', rating: 3.5, createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Want 4', status: 'want', rating: 4, tags: ['Summer'], createdAt: '2026-01-03T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Unrated', status: 'done', createdAt: '2026-01-04T00:00:00.000Z' });
		insertEntryRow({ type: 'song', title: 'A song', status: 'done', rating: 5, createdAt: '2026-01-05T00:00:00.000Z' });
		insertEntryRow({ type: 'site', title: 'Shop', kind: 'shop' });
		insertEntryRow({ type: 'site', title: 'Site', kind: 'site' });
		insertEntryRow({ type: 'brand', title: 'Brand', kind: 'brand' });
		insertEntryRow({ type: 'piece', title: 'Owned coat', status: 'owned', createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'piece', title: 'Wish scarf', status: 'wishlist', createdAt: '2026-01-02T00:00:00.000Z' });
		const summer = listTags().find((t) => t.name === 'Summer')!.id;

		expect(titles(listEntries({ types: ['album'], status: 'done' }))).toEqual(['Unrated', 'Done 3.5', 'Done 5']);
		expect(titles(listEntries({ types: ['site', 'brand'], kind: 'site' }))).toEqual(['Site']);
		expect(titles(listEntries({ types: ['album'], tag: summer }))).toEqual(['Want 4', 'Done 5']);
		expect(titles(listEntries({ types: ['album'], minRating: 4 }))).toEqual(['Want 4', 'Done 5']);
		expect(titles(listEntries({ types: ['album'], minRating: 3.5 }))).toEqual(['Want 4', 'Done 3.5', 'Done 5']);
		expect(titles(listEntries({ types: ['album'], status: 'done', minRating: 4, tag: summer }))).toEqual(['Done 5']);
		expect(titles(listEntries({ types: ['piece'], status: 'owned' }))).toEqual(['Owned coat']);
		expect(titles(listEntries({ types: ['album', 'song'] })).sort()).toEqual(
			['A song', 'Done 3.5', 'Done 5', 'Unrated', 'Want 4'].sort()
		);
		expect(listEntries({ types: ['look'] })).toEqual([]);
		expect(listEntries({ types: [] })).toEqual([]);
	});

	it('Scenario: List query sorts by added, rating and title', () => {
		insertEntryRow({ type: 'album', title: 'Zeta', rating: 3, createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Ästhetik', createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'alpha', rating: 5, createdAt: '2026-01-03T00:00:00.000Z' });

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
		insertEntryRow({ type: 'album', title: 'Same', rating: 4, createdAt: '2026-01-01T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'same', rating: 4, createdAt: '2026-01-02T00:00:00.000Z' });
		insertEntryRow({ type: 'album', title: 'Other', rating: 4, createdAt: '2026-01-03T00:00:00.000Z' });

		expect(titles(listEntries({ types: ['album'], sort: 'rating' }))).toEqual(['Other', 'same', 'Same']);
		expect(titles(listEntries({ types: ['album'], sort: 'title' }))).toEqual(['Other', 'same', 'Same']);
	});
});
