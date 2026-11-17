// Gate 5 hi-fi data for the list, Select, add, entry and edit screens: the twelve lists with their defs, entries drawn from the shared fixtures.
import { photo, type Domain, type Kind, type MockData, type MockEntry } from '../../fixtures.ts';
import { DOMAIN_LABEL, kindLabel, stress } from '../shell/data.ts';

export type ListSlug = 'albums' | 'artists' | 'songs' | 'anime' | 'manga' | 'books' | 'brands-shops' | 'influencers' | 'magazines' | 'pieces' | 'wardrobe' | 'looks';

export interface ListDef {
	slug: ListSlug;
	name: string;
	domain: Domain;
	kinds: Kind[];
	one: string;
	many: string;
	lede: string;
	media: boolean;
	piece: boolean;
	statuses: string[];
	ratio: string;
	addType: string;
}

const MUSIC = ['Want to listen', 'Listening', 'Listened', 'Dropped'];
const WATCH = ['Plan to watch', 'Watching', 'Watched', 'Dropped'];
const READ = ['Want to read', 'Reading', 'Read', 'Dropped'];
export const PIECE = ['Wishlist', 'Owned', 'Gone'];

const def = (slug: ListSlug, name: string, domain: Domain, kinds: Kind[], one: string, many: string, lede: string, statuses: string[], ratio: string, addType: string, extra: Partial<ListDef> = {}): ListDef => ({
	slug, name, domain, kinds, one, many, lede, media: statuses.length > 0 && statuses !== PIECE, piece: statuses === PIECE, statuses, ratio, addType, ...extra
});

export const LISTS: Record<ListSlug, ListDef> = {
	albums: def('albums', 'Albums', 'music', ['album'], 'album', 'albums', 'Music · rated from 0 to 10', MUSIC, '1 / 1', 'album'),
	artists: def('artists', 'Artists', 'music', ['artist'], 'artist', 'artists', 'Music · the people behind the records', MUSIC, '1 / 1', 'artist'),
	songs: def('songs', 'Songs', 'music', ['song'], 'song', 'songs', 'Music · single tracks worth keeping', MUSIC, '1 / 1', 'song'),
	anime: def('anime', 'Anime', 'animanga', ['anime'], 'anime', 'anime', 'Animanga · episode by episode', WATCH, '3 / 4', 'anime'),
	manga: def('manga', 'Manga', 'animanga', ['manga'], 'manga', 'manga', 'Animanga · chapter by chapter', READ, '3 / 4', 'manga'),
	books: def('books', 'Books', 'books', ['book'], 'book', 'books', 'Books · the shelf you are in, and the one waiting', READ, '3 / 4', 'book'),
	'brands-shops': def('brands-shops', 'Brands & shops', 'fashion', ['brand', 'site'], 'entry', 'entries', 'Fashion · brands, shops and sites in one list', [], '1 / 1', 'brand'),
	influencers: def('influencers', 'Influencers', 'fashion', ['influencer'], 'influencer', 'influencers', 'Fashion · voices whose taste you follow', [], '1 / 1', 'influencer'),
	magazines: def('magazines', 'Magazines', 'fashion', ['magazine'], 'magazine', 'magazines', 'Fashion · magazines worth keeping', [], '3 / 4', 'magazine'),
	pieces: def('pieces', 'Pieces', 'fashion', ['piece'], 'piece', 'pieces', 'Fashion · everything you own or want', PIECE, '3 / 4', 'piece'),
	wardrobe: def('wardrobe', 'Wardrobe', 'fashion', ['piece'], 'piece', 'pieces', 'Fashion · every piece you own', [], '3 / 4', 'piece'),
	looks: def('looks', 'Looks', 'fashion', ['look'], 'look', 'looks', 'Fashion · outfits to come back to', [], '3 / 4', 'look')
};

export const asList = (value: string | null, fallback: ListSlug = 'albums'): ListSlug => (value && value in LISTS ? (value as ListSlug) : fallback);

export const SUBTYPES: Record<Domain, ListSlug[]> = {
	music: ['albums', 'artists', 'songs'],
	animanga: ['anime', 'manga'],
	books: ['books'],
	fashion: ['wardrobe', 'pieces', 'looks', 'brands-shops', 'influencers', 'magazines']
};

const POOL: Record<ListSlug, [string, string | null][]> = {
	albums: [['Blue Hour Sessions', 'Marlene Okafor'], ['Paper Lanterns', 'The Quiet Orchard'], ['Low Tide', 'Ines Varga'], ['Kintsugi Summer', 'Juno Ashby'], ['Night Ferry', 'Halvard & Moe'], ['Small Rooms', 'Ada Lindqvist'], ['Glass Garden', 'The Quiet Orchard'], ['Slow Weather', 'Marlene Okafor'], ['Saltwater Radio', 'Coast Signal'], ['After the Rain Stops', 'Ines Varga'], ['Lamplight', 'Ada Lindqvist'], ['Winter Letters', 'Halvard & Moe'], ['Harbour Songs', 'Coast Signal'], ['Soft Machines', 'Juno Ashby'], ['Evening Tide', 'Marlene Okafor'], ['Porcelain', 'The Quiet Orchard']],
	artists: [['Juno Ashby', null], ['Marlene Okafor', null], ['Ines Varga', null], ['Ada Lindqvist', null], ['Coast Signal', null], ['Halvard & Moe', null]],
	songs: [['Low Tide', 'Ines Varga'], ['Lamplight', 'Ada Lindqvist'], ['Porcelain', 'The Quiet Orchard'], ['Night Ferry', 'Halvard & Moe'], ['Soft Machines', 'Juno Ashby'], ['Slow Weather', 'Marlene Okafor']],
	anime: [['Harbour Lights', 'Studio Kitsune'], ['Night Train to Aomori', 'Studio Tsuki'], ['The Lighthouse Keeper', 'Studio Kitsune'], ['Paper Moon Café', 'Studio Hoshi'], ['Small Gods of Spring', 'Studio Tsuki'], ['Rooftop Radio', 'Studio Hoshi'], ['Winter Courier', 'Studio Kitsune'], ['Tidewater', 'Studio Tsuki']],
	manga: [['The Salt Clockmaker', 'Haruka Mori'], ['Lantern Street', 'Mio Tanabe'], ['A Quiet Orbit', 'Haruka Mori'], ['Paper Cranes', 'Sora Ito'], ['Night Shift Bakery', 'Mio Tanabe'], ['Tidal Letters', 'Sora Ito']],
	books: [['A Field Guide to Winter', 'Odile Brandt'], ['The Cartographer’s Daughter', 'Pablo Iriarte'], ['Salt and Lamplight', 'Joséphine Aubry'], ['The Slow River', 'Odile Brandt'], ['Small Hours', 'Pablo Iriarte'], ['What the Tide Kept', 'Joséphine Aubry'], ['Winter Rooms', 'Odile Brandt'], ['Quiet Harbours', 'Pablo Iriarte']],
	'brands-shops': [['Margaret Howell', null], ['Studio Nicholson', null], ['Cosmos Vintage', null], ['Folk Clothing', null], ['Oak Street Tailors', null], ['The Linen Room', null], ['Atelier Hana', null], ['Wool & Thread', null]],
	influencers: [['Mina Sato', null], ['Clara Lund', null], ['Theo Marchetti', null], ['Ayo Bello', null]],
	magazines: [['Kinfolk Issue 52', 'Kinfolk'], ['Apartamento No. 31', 'Apartamento'], ['The Gentlewoman Spring', 'The Gentlewoman'], ['Cereal Volume 28', 'Cereal'], ['Drift Quarterly', 'Drift'], ['Monocle Annual', 'Monocle']],
	pieces: [['Wool overshirt', 'Studio Nicholson'], ['Linen trousers', 'Margaret Howell'], ['Chelsea boots', 'Oak Street Tailors'], ['Knit cardigan', 'Folk Clothing'], ['Canvas tote', 'Atelier Hana'], ['Raincoat', 'Northfield Outfitters'], ['Cotton shirt', 'The Linen Room'], ['Silk scarf', 'Second Hand Rose']],
	wardrobe: [['Wool overshirt', 'Studio Nicholson'], ['Linen trousers', 'Margaret Howell'], ['Chelsea boots', 'Oak Street Tailors'], ['Knit cardigan', 'Folk Clothing'], ['Canvas tote', 'Atelier Hana'], ['Raincoat', 'Northfield Outfitters']],
	looks: [['Autumn layers', null], ['Rainy Sunday', null], ['Linen and light', null], ['Evening in wool', null]]
};

const COVERS = ['cover-ember', 'cover-dusk', 'cover-violet', 'cover-moss'];
const STATUS_ORDER = ['doing', 'want', 'done', 'dropped', null, 'done', 'want', 'doing'] as const;
const TAGS = [['favourite'], ['favourite', 'autumn'], ['quiet'], [], ['favourite', 'autumn', 'quiet']];

export interface ListEntry extends MockEntry {
	kindText: string | null;
}

export const norm = (def: ListDef) => def.media;

// the normal set holds up to sixteen; the worst set names 500 and draws the first 24 under the true count
export function listEntries(def: ListDef, data: MockData): { entries: ListEntry[]; total: number } {
	const pool = POOL[def.slug];
	const n = data.worst ? 24 : pool.length;
	const raw = Array.from({ length: n }, (_, i): ListEntry => {
		const [title, by] = pool[i % pool.length];
		const kind = def.slug === 'brands-shops' ? (['brand', 'site', 'brand'][i % 3] as Kind) : def.kinds[0];
		const rated = def.media && def.slug !== 'artists' && i % 4 !== 3;
		return {
			id: i + 1, kind, domain: def.domain, title, by,
			cover: i % 9 === 4 ? null : photo(COVERS[i % COVERS.length]),
			status: def.media ? STATUS_ORDER[i % STATUS_ORDER.length] : def.slug === 'wardrobe' ? 'owned' : def.piece ? (['owned', 'wishlist', 'owned', 'gone'] as const)[i % 4] : null,
			rating: rated ? [8.75, 9, 7.5, 0, 6, 10][i % 6] : null,
			progress: kind === 'anime' || kind === 'manga' ? { done: [7, 0, 24, 12][i % 4], total: 24, unit: kind === 'anime' ? 'episodes' : 'chapters' } : null,
			tags: TAGS[i % TAGS.length], year: 1998 + ((i * 3) % 27),
			kindText: def.slug === 'brands-shops' ? kindLabel(kind) === 'Brand or shop' ? (['Brand', 'Shop', 'Site'][i % 3]) : null : null
		};
	});
	const entries = stress(raw, data.worst) as ListEntry[];
	return { entries, total: data.worst ? 500 : n };
}

export const domainName = (d: Domain) => DOMAIN_LABEL[d];

export const RATINGS = ['Any rating', '9 and up', '8 and up', '7 and up', '6 and up', '5 and up'];
export const SORTS = (media: boolean) => (media ? ['Recently added', 'Rating', 'Title'] : ['Recently added', 'Title']);

// status as text plus a small shape, never colour alone
export const shape = (status: string | null): 'want' | 'doing' | 'done' | 'dropped' | 'wishlist' | 'owned' | 'gone' | null => (status ? (status as 'want') : null);

// a nested hi-fi page (list/shelves, add/url): shell's href only knows top-level slugs
export const nested = (path: string, worst: boolean, extra = '') => {
	const query = [worst ? 'data=worst' : '', extra].filter(Boolean).join('&');
	return `/__mockups/redesign/hifi/${path}${query ? `?${query}` : ''}`;
};

// the status set a bulk "Set status" offers: all media, or all pieces (Wardrobe holds pieces); null when the types have none
export const statusSet = (def: ListDef): string[] | null => (def.media ? ['No status', ...def.statuses] : def.piece || def.slug === 'wardrobe' ? PIECE : null);
