import { describe, expect, it } from 'vitest';
import { ProviderError } from '#lib/errors.ts';
import { createAniList } from './anilist.ts';
import anime from './fixtures/anilist-anime-frieren.json' with { type: 'json' };
import failure from './fixtures/anilist-error.json' with { type: 'json' };
import manga from './fixtures/anilist-manga-vagabond.json' with { type: 'json' };
import { search } from './index.ts';
import type { FetchJson } from './types.ts';

const signal = new AbortController().signal;

function answering(payload: unknown) {
	const calls: { url: string; init: Parameters<FetchJson>[1] }[] = [];
	const fetchJson: FetchJson = async (url, init) => {
		calls.push({ url, init });
		return payload;
	};
	return { fetchJson, calls };
}

describe('createAniList', () => {
	it('Scenario: AniList anime maps episodes and year', async () => {
		const { fetchJson, calls } = answering(anime);

		const results = await createAniList(fetchJson).search('anime', 'Frieren', signal);

		expect(results).toEqual([
			{
				provider: 'anilist',
				externalId: '154587',
				type: 'anime',
				title: "Frieren: Beyond Journey's End",
				creator: null,
				year: 2023,
				coverUrl: anime.data.Page.media[0].coverImage.extraLarge,
				details: { altTitle: 'Sousou no Frieren', year: 2023 },
				progressTotals: { episodes: 28 }
			}
		]);
		expect(calls[0].url).toBe('https://graphql.anilist.co');
		expect(calls[0].init.method).toBe('POST');
		expect(JSON.parse(calls[0].init.body!).variables).toEqual({ search: 'Frieren', type: 'ANIME' });
	});

	it('Scenario: AniList null totals stay empty', async () => {
		const { fetchJson, calls } = answering(manga);

		const results = await createAniList(fetchJson).search('manga', 'Vagabond', signal);

		expect(results[0].progressTotals).toEqual({ chapters: null, volumes: null });
		expect(results[0].year).toBe(1998);
		expect(results[0].details).toEqual({ year: 1998 });
		expect(JSON.parse(calls[0].init.body!).variables.type).toBe('MANGA');
	});

	it('keeps a known chapter total and falls back to the romaji title', async () => {
		const { fetchJson } = answering(manga);

		const results = await createAniList(fetchJson).search('manga', 'Vagabond', signal);

		expect(results[1].title).toBe('Sensai Vagabond');
		expect(results[1].details).toEqual({ year: 2020 });
		expect(results[1].progressTotals).toEqual({ chapters: 1, volumes: null });
	});

	it('Scenario: AniList errors become a provider error', async () => {
		const { fetchJson, calls } = answering(failure);

		const caught = await search('anime', 'Frieren', createAniList(fetchJson)).catch((e) => e);

		expect(calls).toHaveLength(1);
		expect(caught).toBeInstanceOf(ProviderError);
		expect(caught.code).toBe('failed');
	});
});
