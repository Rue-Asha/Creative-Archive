import { isHttpError } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from './+layout.server.ts';
import { mockData } from './fixtures.ts';

const run = () => load({} as Parameters<typeof load>[0]);

function thrown(fn: () => unknown): unknown {
	try {
		fn();
	} catch (e) {
		return e;
	}
}

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('/__mockups/redesign guard', () => {
	it('Scenario: Redesign mockups are hidden without the test flag', () => {
		for (const value of [undefined, '', '0', 'true']) {
			vi.stubEnv('CREATIVE_ARCHIVE_TEST', value);
			expect(isHttpError(thrown(run), 404), String(value)).toBe(true);
		}
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');
		expect(run).not.toThrow();
	});

	it('names a photo for every world', () => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');
		const { photos } = run() as { photos: Record<string, string> };
		expect(Object.keys(photos).sort()).toEqual(['animanga', 'books', 'fashion', 'home', 'music']);
	});
});

describe('mockData', () => {
	const normal = mockData(new URL('http://x/__mockups/redesign'));
	const worst = mockData(new URL('http://x/__mockups/redesign?data=worst'));

	it('selects the worst-case set with ?data=worst', () => {
		expect(normal.worst).toBe(false);
		expect(worst.worst).toBe(true);
		expect(worst.list).toHaveLength(500);
		expect(normal.list.length).toBeLessThan(50);
		expect(worst.list.some((e) => e.title.length === 180)).toBe(true);
		expect(worst.list.some((e) => /[぀-ヿ]/.test(e.title))).toBe(true);
		expect(normal.list.every((e) => e.title.length < 60)).toBe(true);
		expect(worst.collection.entries).toHaveLength(100);
		expect(worst.collections[0].description).toHaveLength(600);
		expect(worst.list.some((e) => e.tags.length === 40 && e.tags.every((t) => t.length === 30))).toBe(true);
		expect(worst.tags).toHaveLength(40);
		expect(worst.entry.artist.works).toHaveLength(0);
		expect(worst.list.some((e) => e.progress && e.progress.done > (e.progress.total ?? Infinity))).toBe(true);
		expect(worst.rating.rejected).toBe(8.755);
		expect(worst.collection.order).toEqual(worst.collection.entries.map((e) => e.id));
	});

	it('has the empty sets and an entry per kind in both', () => {
		expect(worst.empty).toEqual({ entries: [], collections: [], tags: [], heroes: expect.any(Object) });
		for (const d of [normal, worst]) {
			expect(Object.keys(d.entry).sort()).toEqual(['album', 'anime', 'artist', 'book', 'magazine', 'piece']);
			expect(d.worlds.map((w) => w.id)).toEqual(['home', 'music', 'animanga', 'books', 'fashion']);
		}
	});
});
