import type { EntryDetails, MediaType } from '#lib/types.ts';
import type { FetchJson, Provider, SearchResult } from './types.ts';

const API = 'https://api.deezer.com';
// search payloads carry no release date, so the first results are enriched from /album/{id}
const ENRICH_LIMIT = 8;

interface DzArtist {
	id: number;
	name: string;
	picture_xl?: string;
}
interface DzAlbum {
	id: number;
	title: string;
	cover_xl?: string;
	nb_tracks?: number;
	record_type?: string;
	release_date?: string;
	artist: DzArtist;
}
interface DzTrack {
	id: number;
	title: string;
	artist: DzArtist;
	album: { id: number; title: string; cover_xl?: string };
}

function yearOf(date: unknown): number | null {
	const year = typeof date === 'string' ? Number(/^(\d{4})/.exec(date)?.[1]) : 0;
	return year > 0 ? year : null;
}

function artistOf(a: DzArtist): NonNullable<SearchResult['artist']> {
	return { externalId: String(a.id), name: a.name, imageUrl: a.picture_xl ?? null };
}

export function createDeezer(fetchJson: FetchJson): Provider {
	async function list<T>(kind: string, query: string, signal: AbortSignal): Promise<T[]> {
		const url = `${API}/search/${kind}?q=${encodeURIComponent(query)}&limit=10`;
		const body = (await fetchJson(url, { signal })) as { data?: T[] };
		if (!Array.isArray(body.data)) throw new Error('deezer: no data in answer');
		return body.data;
	}

	// one lookup per album id, a failed lookup is a missing year
	function years(signal: AbortSignal) {
		const seen = new Map<number, Promise<number | null>>();
		return (albumId: number, index: number): Promise<number | null> => {
			if (index >= ENRICH_LIMIT) return Promise.resolve(null);
			let year = seen.get(albumId);
			if (!year) {
				year = fetchJson(`${API}/album/${albumId}`, { signal }).then(
					(a) => yearOf((a as DzAlbum).release_date),
					() => null
				);
				seen.set(albumId, year);
			}
			return year;
		};
	}

	return {
		id: 'deezer',
		async search(type: MediaType, query: string, signal: AbortSignal): Promise<SearchResult[]> {
			if (type === 'artist') {
				return (await list<DzArtist>('artist', query, signal)).map((a) => ({
					provider: 'deezer',
					externalId: String(a.id),
					type,
					title: a.name,
					creator: null,
					year: null,
					coverUrl: a.picture_xl ?? null,
					details: {}
				}));
			}
			const yearFor = years(signal);
			if (type === 'song') {
				const tracks = await list<DzTrack>('track', query, signal);
				return Promise.all(
					tracks.map(async (t, i) => {
						const year = await yearFor(t.album.id, i);
						const details: EntryDetails = { albumTitle: t.album.title, ...(year !== null && { year }) };
						return {
							provider: 'deezer',
							externalId: String(t.id),
							type,
							title: t.title,
							creator: t.artist.name,
							year,
							coverUrl: t.album.cover_xl ?? null,
							details,
							artist: artistOf(t.artist)
						};
					})
				);
			}
			const albums = await list<DzAlbum>('album', query, signal);
			return Promise.all(
				albums.map(async (a, i) => {
					const year = await yearFor(a.id, i);
					const details: EntryDetails = {
						...(year !== null && { year }),
						recordType: a.record_type === 'ep' ? 'ep' : 'album',
						...(typeof a.nb_tracks === 'number' && { trackCount: a.nb_tracks })
					};
					return {
						provider: 'deezer',
						externalId: String(a.id),
						type,
						title: a.title,
						creator: a.artist.name,
						year,
						coverUrl: a.cover_xl ?? null,
						details,
						artist: artistOf(a.artist)
					};
				})
			);
		}
	};
}
