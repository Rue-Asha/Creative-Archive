import type { EntryDetails, MediaType } from '#lib/types.ts';
import type { FetchJson, Provider, SearchResult } from './types.ts';

const ENDPOINT = 'https://graphql.anilist.co';

const QUERY = `query ($search: String, $type: MediaType) {
  Page(perPage: 10) {
    media(type: $type, search: $search) {
      id
      title { romaji english }
      seasonYear
      startDate { year }
      episodes
      chapters
      volumes
      coverImage { extraLarge }
    }
  }
}`;

interface AlMedia {
	id: number;
	title: { romaji: string | null; english: string | null };
	seasonYear: number | null;
	startDate: { year: number | null } | null;
	episodes: number | null;
	chapters: number | null;
	volumes: number | null;
	coverImage: { extraLarge: string | null } | null;
}

export function createAniList(fetchJson: FetchJson): Provider {
	return {
		id: 'anilist',
		async search(type: MediaType, query: string, signal: AbortSignal): Promise<SearchResult[]> {
			const body = (await fetchJson(ENDPOINT, {
				method: 'POST',
				body: JSON.stringify({
					query: QUERY,
					variables: { search: query, type: type === 'anime' ? 'ANIME' : 'MANGA' }
				}),
				signal
			})) as { data?: { Page?: { media?: AlMedia[] } } | null; errors?: unknown };
			const media = body.data?.Page?.media;
			if (body.errors || !Array.isArray(media)) throw new Error('anilist: error answer');
			return media.map((m) => {
				const title = m.title.english ?? m.title.romaji ?? '';
				const year = m.startDate?.year ?? m.seasonYear ?? null;
				const details: EntryDetails = {
					...(m.title.romaji && m.title.romaji !== title && { altTitle: m.title.romaji }),
					...(year !== null && { year })
				};
				return {
					provider: 'anilist',
					externalId: String(m.id),
					type,
					title,
					creator: null,
					year,
					coverUrl: m.coverImage?.extraLarge ?? null,
					details,
					progressTotals: type === 'anime' ? { episodes: m.episodes } : { chapters: m.chapters, volumes: m.volumes }
				};
			});
		}
	};
}
