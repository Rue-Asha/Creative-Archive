import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ProviderError } from '#lib/errors.ts';
import type { MediaType } from '#lib/types.ts';
import { fakeRemote } from '../fake/remote.ts';
import { getRemote, safeRemote } from '../remote.ts';
import { fakeProviders } from './fake.ts';
import { providerFor, search } from './index.ts';
import { SEARCH_TIMEOUT_MS, type Provider } from './types.ts';

const signal = new AbortController().signal;
const fake = (type: MediaType, q: string) => fakeProviders[type === 'book' ? 'openlibrary' : type === 'anime' || type === 'manga' ? 'anilist' : 'deezer'].search(type, q, signal);
const MEDIA: MediaType[] = ['album', 'artist', 'song', 'anime', 'manga', 'book'];

afterEach(() => {
	delete process.env.CREATIVE_ARCHIVE_TEST;
	vi.unstubAllGlobals();
	vi.useRealTimers();
});

describe('test mode switch', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('network in a test'))));
	});

	it('Scenario: Test mode uses the fake provider and remote', async () => {
		process.env.CREATIVE_ARCHIVE_TEST = '1';

		expect(providerFor('album')).toBe(fakeProviders.deezer);
		expect(getRemote()).toBe(fakeRemote);
		const [blonde] = await search('album', 'Blonde');
		expect(blonde).toMatchObject({ title: 'Blonde', creator: 'Frank Ocean' });
		expect(fetch).not.toHaveBeenCalled();
	});

	it('Scenario: Production mode never uses the fakes', () => {
		const ids = Object.fromEntries(MEDIA.map((t) => [t, providerFor(t).id]));

		expect(ids).toEqual({
			album: 'deezer',
			artist: 'deezer',
			song: 'deezer',
			anime: 'anilist',
			manga: 'anilist',
			book: 'openlibrary'
		});
		for (const t of MEDIA) expect(Object.values(fakeProviders), t).not.toContain(providerFor(t));
		expect(getRemote()).toBe(safeRemote);
		expect(getRemote()).not.toBe(fakeRemote);
	});

	it('gives each media type the fake of its real provider in test mode', () => {
		process.env.CREATIVE_ARCHIVE_TEST = '1';

		for (const t of MEDIA) expect(providerFor(t)).toBe(fakeProviders[providerFor(t).id]);
		expect(providerFor('book').id).toBe('openlibrary');
	});
});

describe('search', () => {
	it('times out after five seconds with a timeout error and aborts the provider', async () => {
		vi.useFakeTimers();
		let aborted = false;
		const slow: Provider = {
			id: 'deezer',
			search: (_t, _q, s) => {
				s.addEventListener('abort', () => (aborted = true));
				return new Promise(() => {});
			}
		};

		const result = search('album', 'Blonde', slow);
		const caught = result.catch((e) => e);
		await vi.advanceTimersByTimeAsync(SEARCH_TIMEOUT_MS - 1);
		expect(aborted).toBe(false);
		await vi.advanceTimersByTimeAsync(1);

		expect(await caught).toEqual(new ProviderError('timeout'));
		expect((await caught).code).toBe('timeout');
		expect(aborted).toBe(true);
	});

	it('turns any other provider failure into a failed error', async () => {
		const broken: Provider = { id: 'anilist', search: () => Promise.reject(new Error('429')) };

		await expect(search('anime', 'Frieren', broken)).rejects.toMatchObject({ name: 'ProviderError', code: 'failed' });
	});

	it('passes provider errors through', async () => {
		process.env.CREATIVE_ARCHIVE_TEST = '1';

		await expect(search('album', 'timeout')).rejects.toMatchObject({ code: 'timeout' });
		await expect(search('book', 'error')).rejects.toMatchObject({ code: 'failed' });
	});
});

describe('fake provider', () => {
	it('finds Blonde by Frank Ocean with its artist and cover', async () => {
		expect(await fake('album', 'Blonde')).toEqual([
			{
				provider: 'deezer',
				externalId: 'fake-al-1',
				type: 'album',
				title: 'Blonde',
				creator: 'Frank Ocean',
				year: 2016,
				coverUrl: '/__test/image/blonde.png',
				details: { year: 2016, recordType: 'album', trackCount: 17 },
				artist: { externalId: 'fake-ar-1', name: 'Frank Ocean', imageUrl: '/__test/image/frank-ocean.png' }
			}
		]);
	});

	it('finds the artist Frank Ocean', async () => {
		expect(await fake('artist', 'Frank')).toEqual([
			{
				provider: 'deezer',
				externalId: 'fake-ar-1',
				type: 'artist',
				title: 'Frank Ocean',
				creator: null,
				year: null,
				coverUrl: '/__test/image/frank-ocean.png',
				details: {}
			}
		]);
	});

	it('finds the track Nikes on Blonde', async () => {
		const [nikes] = await fake('song', 'Nikes');

		expect(nikes).toMatchObject({
			provider: 'deezer',
			type: 'song',
			title: 'Nikes',
			creator: 'Frank Ocean',
			year: 2016,
			details: { albumTitle: 'Blonde', year: 2016 },
			artist: { externalId: 'fake-ar-1', name: 'Frank Ocean' }
		});
	});

	it('finds Frieren with 28 episodes', async () => {
		expect(await fake('anime', 'Frieren')).toEqual([
			expect.objectContaining({
				provider: 'anilist',
				type: 'anime',
				title: "Frieren: Beyond Journey's End",
				year: 2023,
				details: { altTitle: 'Sousou no Frieren', year: 2023 },
				progressTotals: { episodes: 28 }
			})
		]);
	});

	it('finds Vagabond with unknown totals', async () => {
		const [vagabond] = await fake('manga', 'Vagabond');

		expect(vagabond).toMatchObject({ provider: 'anilist', type: 'manga', title: 'Vagabond', year: 1998 });
		expect(vagabond.progressTotals).toEqual({ chapters: null, volumes: null });
	});

	it('finds Norwegian Wood in original script, then a result without cover', async () => {
		const [first, second] = await fake('book', 'Norwegian');

		expect(first).toMatchObject({
			provider: 'openlibrary',
			type: 'book',
			title: 'Norwegian Wood',
			creator: '村上春樹',
			year: 1987,
			details: { authors: ['村上春樹'], year: 1987 }
		});
		expect(first.coverUrl).toMatch(/^\/__test\/image\//);
		expect(second.coverUrl).toBeNull();
		expect(second.externalId).not.toBe(first.externalId);
	});

	it('offers a book whose cover cannot be downloaded', async () => {
		const results = await fake('book', 'Broken');

		expect(results).toHaveLength(1);
		expect(results[0].coverUrl).toBe('/__test/missing/broken.png');
	});

	it('times out and fails on demand', async () => {
		await expect(fake('album', 'timeout')).rejects.toEqual(new ProviderError('timeout'));
		await expect(fake('manga', 'error')).rejects.toMatchObject({ code: 'failed' });
	});

	it('finds nothing else, also not across types', async () => {
		expect(await fake('album', 'Something else')).toEqual([]);
		expect(await fake('anime', 'Blonde')).toEqual([]);
		expect(await fake('book', '')).toEqual([]);
	});

	it('matches case-insensitively', async () => {
		expect(await fake('album', 'blonde')).toHaveLength(1);
	});
});
