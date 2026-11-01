import { ProviderError } from '#lib/errors.ts';
import { fold } from '#lib/text.ts';
import type { MediaType, ProviderId } from '#lib/types.ts';
import type { Provider, SearchResult } from './types.ts';

const FRANK = { externalId: 'fake-ar-1', name: 'Frank Ocean', imageUrl: '/__test/image/frank-ocean.png' };

// [type, word the folded query must contain, results]
const CANNED: [MediaType, string, SearchResult[]][] = [
	[
		'album',
		'blonde',
		[
			{
				provider: 'deezer',
				externalId: 'fake-al-1',
				type: 'album',
				title: 'Blonde',
				creator: 'Frank Ocean',
				year: 2016,
				coverUrl: '/__test/image/blonde.png',
				details: { year: 2016, recordType: 'album', trackCount: 17 },
				artist: FRANK
			}
		]
	],
	[
		'artist',
		'frank',
		[
			{
				provider: 'deezer',
				externalId: FRANK.externalId,
				type: 'artist',
				title: FRANK.name,
				creator: null,
				year: null,
				coverUrl: FRANK.imageUrl,
				details: {}
			}
		]
	],
	[
		'song',
		'nikes',
		[
			{
				provider: 'deezer',
				externalId: 'fake-tr-1',
				type: 'song',
				title: 'Nikes',
				creator: 'Frank Ocean',
				year: 2016,
				coverUrl: '/__test/image/blonde.png',
				details: { albumTitle: 'Blonde', year: 2016 },
				artist: FRANK
			}
		]
	],
	[
		'anime',
		'frieren',
		[
			{
				provider: 'anilist',
				externalId: 'fake-an-1',
				type: 'anime',
				title: "Frieren: Beyond Journey's End",
				creator: null,
				year: 2023,
				coverUrl: '/__test/image/frieren.png',
				details: { altTitle: 'Sousou no Frieren', year: 2023 },
				progressTotals: { episodes: 28 }
			}
		]
	],
	[
		'manga',
		'vagabond',
		[
			{
				provider: 'anilist',
				externalId: 'fake-ma-1',
				type: 'manga',
				title: 'Vagabond',
				creator: null,
				year: 1998,
				coverUrl: '/__test/image/vagabond.png',
				details: { year: 1998 },
				progressTotals: { chapters: null, volumes: null }
			}
		]
	],
	[
		'book',
		'norwegian',
		[
			{
				provider: 'openlibrary',
				externalId: 'fake-bk-1',
				type: 'book',
				title: 'Norwegian Wood',
				creator: '村上春樹',
				year: 1987,
				coverUrl: '/__test/image/norwegian-wood.png',
				details: { authors: ['村上春樹'], year: 1987 }
			},
			{
				provider: 'openlibrary',
				externalId: 'fake-bk-2',
				type: 'book',
				title: 'Norwegian Wood (Vintage)',
				creator: 'Murakami Haruki',
				year: 2000,
				coverUrl: null,
				details: { authors: ['Murakami Haruki'], year: 2000 }
			}
		]
	],
	[
		'book',
		'broken',
		[
			{
				provider: 'openlibrary',
				externalId: 'fake-bk-3',
				type: 'book',
				title: 'Broken',
				creator: 'Ada Example',
				year: 2010,
				coverUrl: '/__test/missing/broken.png',
				details: { authors: ['Ada Example'], year: 2010 }
			}
		]
	]
];

function fakeProvider(id: ProviderId): Provider {
	return {
		id,
		async search(type, query) {
			const q = fold(query);
			if (q === 'timeout') throw new ProviderError('timeout');
			if (q === 'error') throw new ProviderError('failed');
			const hit = CANNED.find(([t, word]) => t === type && q.includes(word));
			return hit ? structuredClone(hit[2]) : [];
		}
	};
}

export const fakeProviders: Record<ProviderId, Provider> = {
	deezer: fakeProvider('deezer'),
	anilist: fakeProvider('anilist'),
	openlibrary: fakeProvider('openlibrary')
};
