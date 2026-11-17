// Fixture data for the redesign mockups at /__mockups/redesign/*. Self-contained on purpose: the old /__mockups fixtures go
// in the cleanup. `?data=worst` swaps in the worst-case set (DESIGN-reference.md worst-case list plus every scope edge).

export type PhotoWorld = 'home' | 'music' | 'animanga' | 'books' | 'fashion';
export type Domain = Exclude<PhotoWorld, 'home'>;
export type Section = PhotoWorld | 'collections';

// U2 downloads world-<world>.jpg; the layout load falls back to today's files until they exist
export const worldPhotoName = (mood: boolean): Record<PhotoWorld, string> =>
	mood
		? { home: 'world-home', music: 'world-music', animanga: 'world-animanga', books: 'world-books', fashion: 'world-fashion' }
		: { home: 'reading', music: 'music-hero', animanga: 'neon', books: 'books-hero', fashion: 'fashion-hero' };

export const photo = (name: string) => `/__mockups/photo/${name}.jpg`;

export type Status = 'want' | 'doing' | 'done' | 'dropped' | null;
export type PieceStatus = 'wishlist' | 'owned' | 'gone';
export type Kind = 'album' | 'artist' | 'song' | 'anime' | 'manga' | 'book' | 'magazine' | 'brand' | 'site' | 'influencer' | 'piece' | 'look';

export interface MockEntry {
	id: number;
	kind: Kind;
	domain: Domain;
	title: string;
	by: string | null;
	cover: string | null;
	status: Status | PieceStatus;
	rating: number | null;
	progress: { done: number; total: number | null; unit: string } | null;
	tags: string[];
	year: number | null;
}

export interface MockEntryFull extends MockEntry {
	notes: string | null;
	sourceUrl: string | null;
	works: MockEntry[];
	collections: string[];
}

export interface MockWorld {
	id: PhotoWorld;
	label: string;
	photo: string;
	count: number;
}

export interface MockCollection {
	id: number;
	name: string;
	description: string | null;
	count: number;
	covers: string[];
}

export interface MockTag {
	name: string;
	count: number;
}

export interface MockData {
	worst: boolean;
	worlds: MockWorld[];
	home: { inProgress: MockEntry[]; recent: Record<Domain, MockEntry[]>; collections: MockCollection[] };
	domain: Record<Domain, { subTypes: { label: string; count: number }[]; shelves: { label: string; entries: MockEntry[] }[] }>;
	list: MockEntry[];
	entry: Record<'album' | 'anime' | 'book' | 'piece' | 'magazine' | 'artist', MockEntryFull>;
	collections: MockCollection[];
	collection: { id: number; name: string; description: string | null; entries: MockEntry[]; order: number[] };
	heroes: Record<PhotoWorld, string | null>;
	tags: MockTag[];
	empty: { entries: MockEntry[]; collections: MockCollection[]; tags: MockTag[]; heroes: Record<PhotoWorld, null> };
	rating: { values: (number | null)[]; rejected: number };
}

const covers = ['cover-ember', 'cover-dusk', 'cover-violet', 'cover-moss'];
const cover = (i: number) => photo(covers[i % covers.length]);
const repeat = (s: string, n: number) => s.repeat(Math.ceil(n / s.length)).slice(0, n);

const normalTitles: [Kind, Domain, string, string | null][] = [
	['album', 'music', 'Blue Hour Sessions', 'Marlene Okafor'],
	['album', 'music', 'Paper Lanterns', 'The Quiet Orchard'],
	['song', 'music', 'Low Tide', 'Ines Varga'],
	['artist', 'music', 'Juno Ashby', null],
	['anime', 'animanga', 'Harbour Lights', 'Studio Kitsune'],
	['manga', 'animanga', 'The Salt Clockmaker', 'Haruka Mori'],
	['anime', 'animanga', 'Night Train to Aomori', 'Studio Tsuki'],
	['book', 'books', 'A Field Guide to Winter', 'Odile Brandt'],
	['book', 'books', 'The Cartographer’s Daughter', 'Pablo Iriarte'],
	['magazine', 'fashion', 'Kinfolk Issue 52', 'Kinfolk'],
	['piece', 'fashion', 'Wool overshirt', 'Studio Nicholson'],
	['brand', 'fashion', 'Margaret Howell', null],
	['look', 'fashion', 'Autumn layers', null],
	['influencer', 'fashion', 'Mina Sato', null]
];

const worstNames = [
	'東京の夜に流れる静かな歌 〜 完全版 〜',
	'كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح',
	'A',
	repeat('The Extraordinarily Long Title That Never Quite Ends And Keeps Going ', 180)
];

function entry(i: number, worst: boolean): MockEntry {
	const [kind, domain, title, by] = normalTitles[i % normalTitles.length];
	const statuses: Status[] = ['doing', 'want', 'done', 'dropped', null];
	const piece = kind === 'piece';
	const media = !['brand', 'site', 'influencer', 'look', 'piece', 'artist', 'magazine'].includes(kind);
	const w = worst && i % 7 === 0 ? worstNames[(i / 7) % worstNames.length | 0] : null;
	return {
		id: i + 1,
		kind,
		domain,
		title: w ?? title,
		by: worst && i % 5 === 0 ? '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット' : by,
		cover: worst && i % 9 === 0 ? null : cover(i),
		status: piece ? (['wishlist', 'owned', 'gone'] as PieceStatus[])[i % 3] : media ? statuses[i % statuses.length] : null,
		rating: media && i % 4 !== 3 ? [8.75, 9, 7.5, 0, 6][i % 5] : null,
		progress: kind === 'anime' || kind === 'manga' || kind === 'book' ? { done: worst && i % 3 === 0 ? 30 : i % 12, total: worst && i % 3 === 0 ? 12 : 24, unit: kind === 'anime' ? 'episodes' : kind === 'manga' ? 'chapters' : 'pages' } : null,
		tags: worst ? Array.from({ length: i % 6 === 0 ? 40 : 3 }, (_, t) => repeat(`tag-${t}-`, 30)) : ['favourite', 'autumn', 'quiet'].slice(0, 1 + (i % 3)),
		year: 2000 + (i % 25)
	};
}

function entries(n: number, worst: boolean) {
	return Array.from({ length: n }, (_, i) => entry(i, worst));
}

const worldMeta: Record<PhotoWorld, string> = { home: 'Home', music: 'Music', animanga: 'Animanga', books: 'Books', fashion: 'Fashion' };

function collection(i: number, worst: boolean): MockCollection {
	return {
		id: i + 1,
		name: worst && i === 0 ? repeat('A collection with a very long name ', 120) : ['Autumn listening', 'Rainy day reads', 'Tokyo nights', 'Wardrobe wishlist'][i % 4],
		description: worst && i === 0 ? repeat('Everything that belongs together because of a feeling. ', 600) : i % 2 ? null : 'Things I want to come back to.',
		count: worst ? 100 : 4 + i * 3,
		covers: worst && i === 3 ? [] : [0, 1, 2, 3].map((c) => cover(c + i))
	};
}

const subTypes: Record<Domain, string[]> = {
	music: ['Albums', 'Artists', 'Songs'],
	animanga: ['Anime', 'Manga'],
	books: ['Books'],
	fashion: ['Brands & shops', 'Influencers', 'Magazines', 'Wardrobe', 'Looks']
};

export function mockData(url: URL): MockData {
	const worst = url.searchParams.get('data') === 'worst';
	const list = entries(worst ? 500 : 24, worst);
	const domains = ['music', 'animanga', 'books', 'fashion'] as Domain[];
	const some = (d: Domain) => list.filter((e) => e.domain === d);
	const full = (kind: Kind, extra: Partial<MockEntryFull> = {}): MockEntryFull => {
		const base = list.find((e) => e.kind === kind) ?? entry(0, worst);
		return {
			...base,
			notes: worst ? repeat('Long notes about why this is worth keeping. ', 600) : 'Found it through a friend; keep for a quiet evening.',
			sourceUrl: worst ? `https://example.com/${repeat('a', 400)}` : null,
			works: [],
			collections: worst ? Array.from({ length: 12 }, (_, i) => collection(i, true).name) : ['Autumn listening'],
			...extra
		};
	};
	const collections = worst ? Array.from({ length: 12 }, (_, i) => collection(i, true)) : [0, 1, 2, 3].map((i) => collection(i, false));
	const colEntries = worst ? entries(100, true) : list.slice(0, 8);
	return {
		worst,
		worlds: (Object.keys(worldMeta) as PhotoWorld[]).map((id) => ({
			id,
			label: worldMeta[id],
			photo: worldPhotoName(false)[id],
			count: id === 'home' ? list.length : some(id).length
		})),
		home: {
			inProgress: list.filter((e) => e.status === 'doing'),
			recent: Object.fromEntries(domains.map((d) => [d, some(d).slice(0, 8)])) as Record<Domain, MockEntry[]>,
			collections: collections.slice(0, 4)
		},
		domain: Object.fromEntries(
			domains.map((d) => [
				d,
				{
					subTypes: subTypes[d].map((label, i) => ({ label, count: Math.max(1, some(d).length - i) })),
					shelves: subTypes[d].map((label) => ({ label, entries: some(d).slice(0, 10) }))
				}
			])
		) as MockData['domain'],
		list,
		entry: {
			album: full('album'),
			anime: full('anime'),
			book: full('book'),
			piece: full('piece'),
			magazine: full('magazine'),
			artist: full('artist', { works: worst ? [] : list.filter((e) => e.kind === 'album').slice(0, 3) })
		},
		collections,
		collection: {
			id: 1,
			name: collections[0].name,
			description: collections[0].description,
			entries: colEntries,
			order: colEntries.map((e) => e.id)
		},
		heroes: { home: worst ? null : photo('reading'), music: photo('music-hero'), animanga: worst ? null : photo('neon'), books: photo('books-hero'), fashion: worst ? null : photo('fashion-hero') },
		tags: worst ? [{ name: repeat('long-tag-', 60), count: 999 }, ...Array.from({ length: 39 }, (_, i) => ({ name: repeat(`tag-${i}-`, 30), count: i + 1 }))] : [
			{ name: 'favourite', count: 9 },
			{ name: 'autumn', count: 6 },
			{ name: 'quiet', count: 5 }
		],
		empty: { entries: [], collections: [], tags: [], heroes: { home: null, music: null, animanga: null, books: null, fashion: null } },
		rating: { values: [null, 0, 8.75, 10], rejected: 8.755 }
	};
}
