import { describe, expect, it } from 'vitest';
import album from './fixtures/deezer-album.json' with { type: 'json' };
import searchAlbum from './fixtures/deezer-search-album.json' with { type: 'json' };
import searchArtist from './fixtures/deezer-search-artist.json' with { type: 'json' };
import searchTrack from './fixtures/deezer-search-track.json' with { type: 'json' };
import { createDeezer } from './deezer.ts';
import type { FetchJson } from './types.ts';

const signal = new AbortController().signal;

function answers(search: unknown, failing: string[] = []) {
	const urls: string[] = [];
	const fetchJson: FetchJson = async (url) => {
		urls.push(url);
		if (url.includes('/album/')) {
			if (failing.some((id) => url.endsWith(`/album/${id}`))) throw new Error('album lookup failed');
			return album;
		}
		return search;
	};
	return { fetchJson, urls };
}

describe('createDeezer', () => {
	it('Scenario: Deezer album results map to drafts', async () => {
		const { fetchJson } = answers(searchAlbum);

		const results = await createDeezer(fetchJson).search('album', 'Blonde', signal);

		expect(results).toHaveLength(2);
		expect(results[0]).toEqual({
			provider: 'deezer',
			externalId: '344137457',
			type: 'album',
			title: 'Blonde',
			creator: 'Frank Ocean',
			year: 2016,
			coverUrl: searchAlbum.data[0].cover_xl,
			details: { year: 2016, recordType: 'album', trackCount: 17 },
			artist: { externalId: '1350335', name: 'Frank Ocean', imageUrl: searchAlbum.data[0].artist.picture_xl }
		});
	});

	it('Scenario: EP record type maps to EP', async () => {
		const { fetchJson } = answers(searchAlbum);

		const results = await createDeezer(fetchJson).search('album', 'Swim', signal);

		expect(results[1].details.recordType).toBe('ep');
		expect(results[1].details.trackCount).toBe(5);
	});

	it('Scenario: Failed album enrichment leaves the year empty', async () => {
		const { fetchJson } = answers(searchAlbum, ['417333917']);

		const results = await createDeezer(fetchJson).search('album', 'Blonde', signal);

		expect(results[1].year).toBeNull();
		expect(results[1].details).not.toHaveProperty('year');
		expect(results[0].year).toBe(2016);
	});

	it('Scenario: Deezer artist results carry the photo', async () => {
		const { fetchJson } = answers(searchArtist);

		const results = await createDeezer(fetchJson).search('artist', 'Nova', signal);

		expect(results.map((r) => r.title)).toEqual(['Frank Ocean', 'Nova', 'Nova']);
		expect(results.map((r) => r.coverUrl)).toEqual(searchArtist.data.map((a) => a.picture_xl));
		expect(results.every((r) => r.year === null && r.type === 'artist' && r.creator === null)).toBe(true);
		expect(results[1].externalId).not.toBe(results[2].externalId);
	});

	it('Scenario: Deezer track results carry album and artist', async () => {
		const { fetchJson } = answers(searchTrack);

		const results = await createDeezer(fetchJson).search('song', 'Nikes', signal);

		expect(results).toHaveLength(1);
		expect(results[0]).toMatchObject({
			externalId: '717273842',
			type: 'song',
			title: 'Nikes',
			creator: 'Frank Ocean',
			year: 2016,
			coverUrl: searchTrack.data[0].album.cover_xl,
			details: { albumTitle: 'Blonde', year: 2016 },
			artist: { externalId: '1350335', name: 'Frank Ocean', imageUrl: searchTrack.data[0].artist.picture_xl }
		});
	});

	it('enriches only the first 8 results and looks each album up once', async () => {
		const many = { data: Array.from({ length: 10 }, (_, i) => ({ ...searchAlbum.data[0], id: 100 + i })) };
		const { fetchJson, urls } = answers(many);

		const results = await createDeezer(fetchJson).search('album', 'Blonde', signal);

		expect(urls.filter((u) => u.includes('/album/'))).toHaveLength(8);
		expect(results.map((r) => r.year)).toEqual([...Array(8).fill(2016), null, null]);

		const sameAlbum = { data: [searchTrack.data[0], { ...searchTrack.data[0], id: 2 }] };
		const second = answers(sameAlbum);
		await createDeezer(second.fetchJson).search('song', 'Nikes', signal);
		expect(second.urls.filter((u) => u.includes('/album/'))).toHaveLength(1);
	});

	it('encodes the query and rejects an error payload', async () => {
		const { fetchJson, urls } = answers({ error: { type: 'DataException', message: 'no data', code: 800 } });

		await expect(createDeezer(fetchJson).search('album', 'a&b c', signal)).rejects.toThrow();

		expect(urls[0]).toBe('https://api.deezer.com/search/album?q=a%26b%20c&limit=10');
	});
});
