import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from './db.ts';
import { coverflowEntries, domainShelves, homeShelves, inProgress, recentlyAdded } from './home.ts';
import { insertEntryRow, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const at = (n: number) => new Date(Date.UTC(2026, 0, 1, 0, 0, n)).toISOString();
const titles = (entries: { title: string }[]) => entries.map((e) => e.title);

describe('home queries', () => {
	it('Scenario: Coverflow takes the 20 newest entries with images', () => {
		const types = ['album', 'manga', 'book', 'piece', 'look'] as const;
		for (let n = 1; n <= 25; n++)
			insertEntryRow({ type: types[n % types.length], title: `Image ${n}`, image: true, createdAt: at(n) });
		for (let n = 26; n <= 28; n++) insertEntryRow({ type: 'album', title: `Plain ${n}`, createdAt: at(n) });

		const entries = coverflowEntries();
		expect(entries).toHaveLength(20);
		expect(titles(entries)).toEqual(Array.from({ length: 20 }, (_, i) => `Image ${25 - i}`));
		expect(entries.every((e) => e.imageId !== null)).toBe(true);
	});

	it('Scenario: In progress orders by last update', () => {
		const A = insertEntryRow({ type: 'anime', title: 'A', status: 'progress', createdAt: at(1), updatedAt: at(1) });
		const B = insertEntryRow({ type: 'manga', title: 'B', status: 'progress', createdAt: at(2), updatedAt: at(2) });
		const C = insertEntryRow({ type: 'book', title: 'C', status: 'progress', createdAt: at(3), updatedAt: at(3) });
		insertEntryRow({ type: 'piece', title: 'Coat', status: 'owned', createdAt: at(4), updatedAt: at(9) });
		insertEntryRow({ type: 'album', title: 'Finished', status: 'done', createdAt: at(5), updatedAt: at(9) });
		// the updates happen in the order B, C, A
		const touch = getDb().prepare('UPDATE entries SET updated_at = ? WHERE id = ?');
		touch.run(at(10), B);
		touch.run(at(11), C);
		touch.run(at(12), A);

		expect(titles(inProgress())).toEqual(['A', 'C', 'B']);
	});

	it('limits recentlyAdded to the domain, newest first, 12 by default', () => {
		for (let n = 1; n <= 14; n++) insertEntryRow({ type: 'song', title: `Song ${n}`, createdAt: at(n) });
		insertEntryRow({ type: 'book', title: 'Elsewhere', createdAt: at(20) });
		expect(recentlyAdded('music')).toHaveLength(12);
		expect(recentlyAdded('music')[0].title).toBe('Song 14');
		expect(titles(recentlyAdded('music', 2))).toEqual(['Song 14', 'Song 13']);
		expect(recentlyAdded('fashion')).toEqual([]);
	});

	it('Scenario: Home shelves omit empty ones', () => {
		insertEntryRow({ type: 'book', title: 'Dune', status: 'want' });
		insertEntryRow({ type: 'book', title: 'Emma', status: 'done' });

		const shelves = homeShelves();
		expect(shelves).toHaveLength(1);
		expect(shelves[0]).toMatchObject({ key: 'recent-books', title: 'Recently added', count: 2, href: '/books' });
		expect(titles(shelves[0].entries)).toEqual(['Emma', 'Dune']);
	});

	it('puts In progress first, then a shelf per domain that has entries, counting every entry', () => {
		for (let n = 1; n <= 14; n++) insertEntryRow({ type: 'album', title: `Album ${n}`, createdAt: at(n) });
		insertEntryRow({ type: 'look', title: 'Look', createdAt: at(1) });
		insertEntryRow({ type: 'anime', title: 'Watching', status: 'progress', createdAt: at(2) });

		const shelves = homeShelves();
		expect(shelves.map((s) => s.key)).toEqual(['progress', 'recent-music', 'recent-animanga', 'recent-fashion']);
		expect(shelves[0]).toMatchObject({ title: 'In progress', count: 1, href: null });
		expect(shelves[1].count).toBe(14);
		expect(shelves[1].entries).toHaveLength(12);
	});

	it('Scenario: Domain shelves group recent entries by type', () => {
		insertEntryRow({ type: 'anime', title: 'Watching', status: 'progress', createdAt: at(1) });
		insertEntryRow({ type: 'manga', title: 'Manga one', createdAt: at(2) });
		insertEntryRow({ type: 'manga', title: 'Manga two', createdAt: at(3) });
		insertEntryRow({ type: 'album', title: 'Other domain', status: 'progress' });

		const shelves = domainShelves('animanga');
		expect(shelves.map((s) => [s.title, titles(s.entries)])).toEqual([
			['In progress', ['Watching']],
			['Anime', ['Watching']],
			['Manga', ['Manga two', 'Manga one']]
		]);
		expect(shelves.map((s) => s.count)).toEqual([1, 1, 2]);
		expect(shelves.map((s) => s.href)).toEqual([null, '/animanga/anime', '/animanga/manga']);
	});

	it('Scenario: Fashion shelves follow the type order', () => {
		for (const type of ['look', 'piece', 'magazine', 'influencer', 'site', 'brand'] as const)
			insertEntryRow({ type, title: type, kind: type === 'brand' || type === 'site' ? type : undefined });

		expect(domainShelves('fashion').map((s) => s.title)).toEqual(['Brands', 'Shops', 'Influencers', 'Magazines', 'Pieces', 'Looks']);
	});

	it('has no In progress shelf for fashion and omits types without entries', () => {
		insertEntryRow({ type: 'piece', title: 'Coat', status: 'owned' });
		insertEntryRow({ type: 'brand', title: 'Acne', kind: 'brand' });
		expect(domainShelves('fashion').map((s) => s.title)).toEqual(['Brands', 'Pieces']);
		expect(domainShelves('music')).toEqual([]);
	});
});
