import { describe, expect, it } from 'vitest';
import { TYPES } from './config.ts';
import type { Entry } from '#lib/types.ts';
import { fromSearchParams, statusShelves, toSearchParams } from './query.ts';

describe('list query in the URL', () => {
	it('Scenario: List query round-trips through the URL', () => {
		const full = { status: 'done', tag: 3, minRating: 3.5, sort: 'title' } as const;
		const params = toSearchParams(full);
		expect(params.toString()).toBe('status=done&tag=3&rating=3.5&sort=title');
		expect(fromSearchParams(params)).toEqual(full);

		expect(toSearchParams({}).toString()).toBe('');
		expect(fromSearchParams(new URLSearchParams())).toEqual({});
		expect(fromSearchParams('')).toEqual({});

		const shelves = { status: 'progress', view: 'shelves' } as const;
		expect(fromSearchParams(toSearchParams(shelves))).toEqual(shelves);

		const kind = { kind: 'site' } as const;
		expect(fromSearchParams(toSearchParams(kind))).toEqual(kind);
	});

	it('drops invalid values and keeps the valid ones', () => {
		const bad = 'status=bogus&tag=abc&rating=9&sort=newest&kind=zine&view=cloud';
		expect(fromSearchParams(bad)).toEqual({});
		expect(fromSearchParams('tag=0&rating=3.3&sort=title')).toEqual({ sort: 'title' });
		expect(fromSearchParams('tag=-2&rating=0&status=done')).toEqual({ status: 'done' });
		expect(fromSearchParams('rating=0.5&tag=12')).toEqual({ minRating: 0.5, tag: 12 });
	});

	it('does not write the default sort', () => {
		expect(toSearchParams({ sort: 'added' }).toString()).toBe('');
		expect(fromSearchParams('sort=added')).toEqual({});
	});

	it('drops what the list type cannot filter by', () => {
		const url = 'status=done&kind=site&rating=4&sort=rating&view=shelves';
		expect(fromSearchParams(url, TYPES.album)).toEqual({ status: 'done', minRating: 4, sort: 'rating', view: 'shelves' });
		expect(fromSearchParams(url, TYPES.site)).toEqual({ kind: 'site' });
		expect(fromSearchParams('status=owned&sort=title&rating=4', TYPES.piece)).toEqual({ status: 'owned', sort: 'title' });
		expect(fromSearchParams('status=owned', TYPES.album)).toEqual({});
		expect(fromSearchParams('kind=brand', TYPES.site)).toEqual({});
		expect(fromSearchParams('status=done&kind=shop&sort=title', TYPES.look)).toEqual({ sort: 'title' });
	});

	it('uses the first value of a repeated key', () => {
		expect(fromSearchParams('status=done&status=want')).toEqual({ status: 'done' });
	});
});

describe('status shelves', () => {
	const entry = (id: number, status: Entry['status']) => ({ id, type: 'manga', title: `M${id}`, status }) as Entry;

	it('groups by status, current first, and leaves out statuses without entries', () => {
		const shelves = statusShelves('manga', [entry(1, 'done'), entry(2, 'want'), entry(3, 'progress'), entry(4, 'want')]);
		expect(shelves.map((s) => [s.key, s.title, s.count])).toEqual([
			['progress', 'Reading', 1],
			['want', 'Want to read', 2],
			['done', 'Read', 1]
		]);
		expect(shelves[1].entries.map((e) => e.id)).toEqual([2, 4]);
		expect(shelves.every((s) => s.href === null)).toBe(true);
	});

	it('is empty without entries', () => {
		expect(statusShelves('manga', [])).toEqual([]);
	});

	it('names statuses per domain', () => {
		expect(statusShelves('album', [entry(1, 'progress')])[0].title).toBe('Listening');
		expect(statusShelves('anime', [entry(1, 'none')])[0].title).toBe('No status');
	});
});
