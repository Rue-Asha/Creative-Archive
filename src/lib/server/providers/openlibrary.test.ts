import { describe, expect, it } from 'vitest';
import searchFixture from './fixtures/openlibrary-search.json' with { type: 'json' };
import { createOpenLibrary } from './openlibrary.ts';
import type { FetchJson } from './types.ts';

const signal = new AbortController().signal;

function answering(payload: unknown) {
	const urls: string[] = [];
	const fetchJson: FetchJson = async (url) => {
		urls.push(url);
		return payload;
	};
	return { fetchJson, urls };
}

describe('createOpenLibrary', () => {
	it('Scenario: Open Library keeps the author in original script', async () => {
		const { fetchJson, urls } = answering(searchFixture);

		const results = await createOpenLibrary(fetchJson).search('book', 'Norwegian Wood', signal);

		expect(results[0]).toEqual({
			provider: 'openlibrary',
			externalId: 'OL2625457W',
			type: 'book',
			title: 'Norwegian Wood',
			creator: '村上春樹',
			year: 1987,
			coverUrl: 'https://covers.openlibrary.org/b/id/12345-L.jpg',
			details: { authors: ['村上春樹'], year: 1987 }
		});
		expect(urls[0]).toBe(
			'https://openlibrary.org/search.json?q=Norwegian%20Wood&limit=10&fields=key,title,author_name,first_publish_year,cover_i'
		);
	});

	it('Scenario: Open Library result without cover has no cover', async () => {
		const { fetchJson } = answering(searchFixture);

		const results = await createOpenLibrary(fetchJson).search('book', 'Norwegian Wood', signal);

		expect(results[1].coverUrl).toBeNull();
		expect(results[1].title).toBe('Norwegian Wood');
	});

	it('joins several authors and leaves out missing ones', async () => {
		const { fetchJson } = answering({
			docs: [
				{ key: '/works/OL1W', title: 'Two Authors', author_name: ['A. One', 'B. Two'] },
				{ key: '/works/OL2W', title: 'Nobody' }
			]
		});

		const results = await createOpenLibrary(fetchJson).search('book', 'x', signal);

		expect(results[0]).toMatchObject({ creator: 'A. One, B. Two', year: null, details: { authors: ['A. One', 'B. Two'] } });
		expect(results[1]).toMatchObject({ creator: null, year: null, details: {} });
	});
});
