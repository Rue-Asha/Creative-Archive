import type { Domain } from '#lib/domains.ts';
import type { EntryDetails, EntryType, ListQuery, ProgressKey, ProviderId } from '#lib/types.ts';

export type FieldInput = 'text' | 'textarea' | 'int' | 'url' | 'select' | 'list' | 'handles';
// title, artist, status, rating, progress, tags, note and image are generic and not listed here
export interface FieldDef {
	key: keyof EntryDetails | 'kind';
	label: string;
	input: FieldInput;
	options?: readonly { value: string; label: string }[];
	store: 'details' | 'column';
}
export interface TypeConfig {
	type: EntryType;
	domain: Domain;
	label: string;
	plural: string;
	slug: string;
	titleLabel: 'Title' | 'Name';
	fields: readonly FieldDef[];
	artist: boolean;
	status: 'media' | 'piece' | null;
	ratable: boolean;
	progress: readonly ProgressKey[];
	provider: ProviderId | null;
	preview: boolean;
}

const year: FieldDef = { key: 'year', label: 'Year', input: 'int', store: 'details' };
const altTitle: FieldDef = { key: 'altTitle', label: 'Alternative title', input: 'text', store: 'details' };
const url: FieldDef = { key: 'url', label: 'URL', input: 'url', store: 'details' };
const siteFields: readonly FieldDef[] = [
	{
		key: 'kind',
		label: 'Kind',
		input: 'select',
		options: [
			{ value: 'brand', label: 'Brand' },
			{ value: 'shop', label: 'Shop' },
			{ value: 'site', label: 'Site' }
		],
		store: 'column'
	},
	url,
	{ key: 'description', label: 'Description', input: 'textarea', store: 'details' }
];

const media = { status: 'media', ratable: true, preview: false } as const;
const plain = { artist: false, status: null, ratable: false, progress: [], provider: null } as const;

export const TYPES: Record<EntryType, TypeConfig> = {
	album: {
		...media,
		type: 'album',
		domain: 'music',
		label: 'Album',
		plural: 'Albums',
		slug: 'albums',
		titleLabel: 'Title',
		fields: [
			year,
			{
				key: 'recordType',
				label: 'Type',
				input: 'select',
				options: [
					{ value: 'album', label: 'Album' },
					{ value: 'ep', label: 'EP' }
				],
				store: 'details'
			},
			{ key: 'trackCount', label: 'Tracks', input: 'int', store: 'details' }
		],
		artist: true,
		progress: [],
		provider: 'deezer'
	},
	artist: {
		...media,
		type: 'artist',
		domain: 'music',
		label: 'Artist',
		plural: 'Artists',
		slug: 'artists',
		titleLabel: 'Name',
		fields: [],
		artist: false,
		progress: [],
		provider: 'deezer'
	},
	song: {
		...media,
		type: 'song',
		domain: 'music',
		label: 'Song',
		plural: 'Songs',
		slug: 'songs',
		titleLabel: 'Title',
		fields: [{ key: 'albumTitle', label: 'Album', input: 'text', store: 'details' }, year],
		artist: true,
		progress: [],
		provider: 'deezer'
	},
	anime: {
		...media,
		type: 'anime',
		domain: 'animanga',
		label: 'Anime',
		plural: 'Anime',
		slug: 'anime',
		titleLabel: 'Title',
		fields: [altTitle, year],
		artist: false,
		progress: ['episodes'],
		provider: 'anilist'
	},
	manga: {
		...media,
		type: 'manga',
		domain: 'animanga',
		label: 'Manga',
		plural: 'Manga',
		slug: 'manga',
		titleLabel: 'Title',
		fields: [altTitle, year],
		artist: false,
		progress: ['chapters', 'volumes'],
		provider: 'anilist'
	},
	book: {
		...media,
		type: 'book',
		domain: 'books',
		label: 'Book',
		plural: 'Books',
		slug: 'books',
		titleLabel: 'Title',
		fields: [{ key: 'authors', label: 'Authors', input: 'list', store: 'details' }, year],
		artist: false,
		progress: [],
		provider: 'openlibrary'
	},
	brand: {
		...plain,
		type: 'brand',
		domain: 'fashion',
		label: 'Brand',
		plural: 'Brands',
		slug: 'brands',
		titleLabel: 'Name',
		fields: siteFields,
		preview: true
	},
	site: {
		...plain,
		type: 'site',
		domain: 'fashion',
		label: 'Shop/Site',
		plural: 'Shops',
		slug: 'shops',
		titleLabel: 'Name',
		fields: siteFields,
		preview: true
	},
	influencer: {
		...plain,
		type: 'influencer',
		domain: 'fashion',
		label: 'Influencer',
		plural: 'Influencers',
		slug: 'influencers',
		titleLabel: 'Name',
		fields: [{ key: 'handles', label: 'Handles', input: 'handles', store: 'details' }],
		preview: true
	},
	magazine: {
		...plain,
		type: 'magazine',
		domain: 'fashion',
		label: 'Magazine',
		plural: 'Magazines',
		slug: 'magazines',
		titleLabel: 'Name',
		fields: [{ key: 'handles', label: 'Handles', input: 'handles', store: 'details' }],
		preview: true
	},
	piece: {
		...plain,
		type: 'piece',
		domain: 'fashion',
		label: 'Piece',
		plural: 'Pieces',
		slug: 'pieces',
		titleLabel: 'Name',
		fields: [
			{ key: 'brand', label: 'Brand', input: 'text', store: 'details' },
			url,
			{ key: 'price', label: 'Price', input: 'text', store: 'details' }
		],
		status: 'piece',
		preview: true
	},
	look: {
		...plain,
		type: 'look',
		domain: 'fashion',
		label: 'Look',
		plural: 'Looks',
		slug: 'looks',
		titleLabel: 'Title',
		fields: [{ key: 'sourceUrl', label: 'Source URL', input: 'url', store: 'details' }],
		preview: false
	}
};

export const TYPES_BY_DOMAIN: Record<Domain, EntryType[]> = {
	music: ['album', 'artist', 'song'],
	animanga: ['anime', 'manga'],
	books: ['book'],
	fashion: ['brand', 'site', 'influencer', 'magazine', 'piece', 'look']
};

type ListDef = { slug: string; label: string; query: Omit<ListQuery, 'sort'> };
export interface ListGroup {
	label: string | null;
	lists: ListDef[];
}

const listOf = (type: EntryType): ListDef => ({
	slug: TYPES[type].slug,
	label: TYPES[type].plural,
	query: { types: [type] }
});

const flat = (domain: Domain): ListGroup[] => [{ label: null, lists: TYPES_BY_DOMAIN[domain].map(listOf) }];

export const LIST_GROUPS: Record<Domain, ListGroup[]> = {
	music: flat('music'),
	animanga: flat('animanga'),
	books: flat('books'),
	fashion: [
		{
			label: 'My things',
			lists: [
				{ slug: 'wardrobe', label: 'Wardrobe', query: { types: ['piece'], status: 'owned' } },
				listOf('piece'),
				listOf('look')
			]
		},
		{ label: 'Discover', lists: [listOf('brand'), listOf('site'), listOf('influencer'), listOf('magazine')] }
	]
};

export const LISTS: Record<Domain, ListDef[]> = {
	music: LIST_GROUPS.music.flatMap((g) => g.lists),
	animanga: LIST_GROUPS.animanga.flatMap((g) => g.lists),
	books: LIST_GROUPS.books.flatMap((g) => g.lists),
	fashion: LIST_GROUPS.fashion.flatMap((g) => g.lists)
};

export function typeBySlug(domain: Domain, slug: string): TypeConfig | null {
	const list = LISTS[domain].find((l) => l.slug === slug);
	return list ? TYPES[list.query.types[0]] : null;
}
