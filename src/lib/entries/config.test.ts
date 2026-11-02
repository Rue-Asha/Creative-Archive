import { describe, expect, it } from 'vitest';
import { DOMAINS } from '#lib/domains.ts';
import type { EntryType } from '#lib/types.ts';
import { LIST_GROUPS, LISTS, TYPES, TYPES_BY_DOMAIN, typeBySlug } from './config.ts';

const ALL: EntryType[] = ['album', 'artist', 'song', 'anime', 'manga', 'book', 'brand', 'site', 'influencer', 'magazine', 'piece', 'look'];
const MEDIA: EntryType[] = ['album', 'artist', 'song', 'anime', 'manga', 'book'];

describe('type config', () => {
	it('Scenario: Every type has a complete config', () => {
		expect(Object.keys(TYPES).sort()).toEqual([...ALL].sort());
		for (const type of ALL) expect(TYPES[type].type).toBe(type);
		for (const type of MEDIA) {
			expect(TYPES[type].status, type).toBe('media');
			expect(TYPES[type].ratable, type).toBe(true);
		}
		expect(TYPES.piece.status).toBe('piece');
		expect(TYPES.piece.ratable).toBe(false);
		for (const type of ['brand', 'site', 'influencer', 'magazine', 'look'] as const) {
			expect(TYPES[type].status, type).toBeNull();
			expect(TYPES[type].ratable, type).toBe(false);
		}
		expect(TYPES.anime.progress).toEqual(['episodes']);
		expect(TYPES.manga.progress).toEqual(['chapters', 'volumes']);
		for (const type of ALL.filter((t) => t !== 'anime' && t !== 'manga'))
			expect(TYPES[type].progress, type).toEqual([]);
		expect(ALL.filter((t) => TYPES[t].artist)).toEqual(['album', 'song']);
		expect(ALL.filter((t) => TYPES[t].preview)).toEqual(['brand', 'site', 'influencer', 'magazine', 'piece']);
		const { magazine } = TYPES;
		expect([magazine.domain, magazine.label, magazine.plural, magazine.slug, magazine.titleLabel, magazine.provider]).toEqual(['fashion', 'Magazine', 'Magazines', 'magazines', 'Name', null]);
	});

	it('Scenario: Each list slug resolves to its type', () => {
		for (const domain of DOMAINS)
			for (const list of LISTS[domain]) {
				const config = typeBySlug(domain, list.slug);
				expect(config?.type, `${domain}/${list.slug}`).toBe(list.query.types[0]);
			}
		for (const type of ALL) expect(typeBySlug(TYPES[type].domain, TYPES[type].slug)?.type).toBe(type);
		expect(typeBySlug('fashion', 'magazines')?.type).toBe('magazine');
		expect(typeBySlug('fashion', 'wardrobe')?.type).toBe('piece');
		expect(LISTS.fashion.find((l) => l.slug === 'wardrobe')?.query).toEqual({ types: ['piece'], status: 'owned' });
		expect(typeBySlug('music', 'nope')).toBeNull();
		expect(typeBySlug('music', 'anime')).toBeNull();
	});

	it('gives each domain its tabs in scope order', () => {
		expect(TYPES_BY_DOMAIN).toEqual({
			music: ['album', 'artist', 'song'],
			animanga: ['anime', 'manga'],
			books: ['book'],
			fashion: ['brand', 'site', 'influencer', 'magazine', 'piece', 'look']
		});
		expect(Object.fromEntries(DOMAINS.map((d) => [d, LISTS[d].map((l) => l.label)]))).toEqual({
			music: ['Albums', 'Artists', 'Songs'],
			animanga: ['Anime', 'Manga'],
			books: ['Books'],
			fashion: ['Wardrobe', 'Pieces', 'Looks', 'Brands', 'Shops', 'Influencers', 'Magazines']
		});
	});

	it('Scenario: Fashion list config declares the groups', () => {
		const slugsOf = (domain: (typeof DOMAINS)[number]) => LIST_GROUPS[domain].map((g) => [g.label, g.lists.map((l) => l.slug)]);

		expect(slugsOf('fashion')).toEqual([
			['My things', ['wardrobe', 'pieces', 'looks']],
			['Discover', ['brands', 'shops', 'influencers', 'magazines']]
		]);
		for (const domain of ['music', 'animanga', 'books'] as const) {
			expect(LIST_GROUPS[domain], domain).toHaveLength(1);
			expect(LIST_GROUPS[domain][0].label, domain).toBeNull();
		}
		for (const domain of DOMAINS) expect(LISTS[domain], domain).toEqual(LIST_GROUPS[domain].flatMap((g) => g.lists));
	});

	it('lists the fields of each type in form order', () => {
		const keys = (type: EntryType) => TYPES[type].fields.map((f) => f.key);

		expect(keys('album')).toEqual(['year', 'recordType', 'trackCount']);
		expect(keys('artist')).toEqual([]);
		expect(keys('song')).toEqual(['albumTitle', 'year']);
		expect(keys('anime')).toEqual(['altTitle', 'year']);
		expect(keys('manga')).toEqual(['altTitle', 'year']);
		expect(keys('book')).toEqual(['authors', 'year']);
		expect(keys('brand')).toEqual(['kind', 'url', 'description']);
		expect(keys('site')).toEqual(['kind', 'url', 'description']);
		expect(keys('influencer')).toEqual(['handles']);
		expect(keys('magazine')).toEqual(['handles']);
		expect(keys('piece')).toEqual(['brand', 'url', 'price']);
		expect(keys('look')).toEqual(['sourceUrl']);
	});

	it('stores only kind in a column', () => {
		for (const type of ALL)
			for (const field of TYPES[type].fields) expect(field.store, `${type}.${field.key}`).toBe(field.key === 'kind' ? 'column' : 'details');
	});

	it('names brands, shops, influencers, magazines and pieces, titles the rest', () => {
		expect(ALL.filter((t) => TYPES[t].titleLabel === 'Name')).toEqual(['artist', 'brand', 'site', 'influencer', 'magazine', 'piece']);
	});

	it('maps media types to their provider', () => {
		expect(Object.fromEntries(ALL.map((t) => [t, TYPES[t].provider]))).toEqual({
			album: 'deezer',
			artist: 'deezer',
			song: 'deezer',
			anime: 'anilist',
			manga: 'anilist',
			book: 'openlibrary',
			brand: null,
			site: null,
			influencer: null,
			magazine: null,
			piece: null,
			look: null
		});
	});

	it('offers album and EP, and brand, shop and site as select options', () => {
		const options = (type: EntryType, key: string) => TYPES[type].fields.find((f) => f.key === key)?.options;

		expect(options('album', 'recordType')).toEqual([
			{ value: 'album', label: 'Album' },
			{ value: 'ep', label: 'EP' }
		]);
		expect(options('site', 'kind')).toEqual([
			{ value: 'brand', label: 'Brand' },
			{ value: 'shop', label: 'Shop' },
			{ value: 'site', label: 'Site' }
		]);
	});
});
