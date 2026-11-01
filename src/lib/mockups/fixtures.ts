// Fixture data for the static mockups at /__mockups/*. Shapes follow design.md → Contracts loosely (U3 owns the
// real types); nothing here is read by feature code.
import type { World } from '#lib/domains.ts';
import type { AccentName } from '#lib/styles/worlds.ts';

export const photo = (name: string) => `/__mockups/photo/${name}.jpg`;

export type Shape = 'square' | 'portrait' | 'tall';

export interface MockEntry {
	id: number;
	title: string;
	creator: string;
	chip: string;
	image: string | null;
	rating: number | null;
	shape: Shape;
	tint: AccentName | null;
	status?: string;
	progress?: { label: string; current: number; total: number | null };
}

export interface MockShelf {
	title: string;
	accent?: string;
	count: number;
	entries: MockEntry[];
}

export interface MockDetail {
	entry: MockEntry;
	eyebrow: string[];
	statusOptions: { value: string; label: string }[];
	status: string;
	facts: [label: string, value: string][];
	tags: string[];
	note: string;
}

export interface MockDomain {
	world: Exclude<World, 'home'>;
	label: string;
	hero: string;
	headline: [before: string, accent: string, after: string];
	intro: string;
	tabs: string[];
	shelves: MockShelf[];
	listTitle: string;
	list: MockEntry[];
	detail: MockDetail;
}

let next = 1;
const e = (
	title: string,
	creator: string,
	chip: string,
	image: string | null,
	shape: Shape,
	extra: Partial<MockEntry> = {}
): MockEntry => ({ id: next++, title, creator, chip, image, shape, rating: null, tint: null, ...extra });

const mediaStatus = (want: string, progress: string, done: string) => [
	{ value: 'none', label: 'No status' },
	{ value: 'want', label: want },
	{ value: 'progress', label: progress },
	{ value: 'done', label: done },
	{ value: 'dropped', label: 'Dropped' }
];

const music = {
	blonde: e('Blonde', 'Frank Ocean', 'Album', photo('cover-ember'), 'square', { rating: 4.5, status: 'Listened' }),
	sos: e('SOS', 'SZA', 'Album', photo('cover-dusk'), 'square', { rating: 4, status: 'Listening' }),
	ctrl: e('Ctrl', 'SZA', 'Album', photo('cover-violet'), 'square', { status: 'Want to listen' }),
	melodrama: e('Melodrama', 'Lorde', 'Album', null, 'square', { tint: 'ember', rating: 5 }),
	frank: e('Frank Ocean', '2 albums · 3 songs', 'Artist', photo('music-hero'), 'square'),
	nikes: e('Nikes', 'Frank Ocean · Blonde', 'Song', photo('cover-violet'), 'square', { rating: 4.5 }),
	pink: e('Pink + White', 'Frank Ocean · Blonde', 'Song', null, 'square', { tint: 'violet' }),
	kids: e('Kids See Ghosts', 'Kids See Ghosts', 'EP', photo('cover-moss'), 'square', { rating: 3.5 }),
	punisher: e('Punisher', 'Phoebe Bridgers', 'Album', photo('music-hero'), 'square', { status: 'Want to listen' }),
	channel: e('channel ORANGE', 'Frank Ocean', 'Album', photo('cover-dusk'), 'square', { rating: 5 })
};

const animanga = {
	frieren: e("Frieren: Beyond Journey's End", 'Sousou no Frieren · 2023', 'Anime', photo('neon'), 'tall', {
		rating: 5,
		progress: { label: 'Episodes', current: 12, total: 28 }
	}),
	vagabond: e('Vagabond', 'Takehiko Inoue · 1998', 'Manga', photo('neon'), 'tall', {
		progress: { label: 'Chapters', current: 214, total: null }
	}),
	mononoke: e('Mononoke', 'Toei · 2007', 'Anime', photo('cover-violet'), 'tall', { rating: 4.5 }),
	nana: e('NANA', 'Ai Yazawa · 2000', 'Manga', null, 'tall', { tint: 'neon', rating: 4 }),
	mushishi: e('Mushishi', 'Artland · 2005', 'Anime', photo('cover-moss'), 'tall', { rating: 5 }),
	pluto: e('Pluto', 'Naoki Urasawa · 2003', 'Manga', photo('cover-ember'), 'tall'),
	dandadan: e('Dandadan', 'Science SARU · 2024', 'Anime', photo('cover-dusk'), 'tall', {
		progress: { label: 'Episodes', current: 3, total: 12 }
	}),
	monster: e('Monster', 'Naoki Urasawa · 1994', 'Manga', null, 'tall', { tint: 'electric', rating: 4.5 })
};

const books = {
	wood: e('Norwegian Wood', '村上春樹 · 1987', 'Book', photo('cover-moss'), 'tall', { rating: 4.5 }),
	stoner: e('Stoner', 'John Williams · 1965', 'Book', photo('reading'), 'tall', { rating: 5 }),
	piranesi: e('Piranesi', 'Susanna Clarke · 2020', 'Book', photo('cover-dusk'), 'tall', { status: 'Reading' }),
	secret: e('The Secret History', 'Donna Tartt · 1992', 'Book', null, 'tall', { tint: 'oxblood', rating: 4 }),
	klara: e('Klara and the Sun', 'Kazuo Ishiguro · 2021', 'Book', photo('cover-ember'), 'tall'),
	kitchen: e('Kitchen', 'Banana Yoshimoto · 1988', 'Book', photo('books-hero'), 'tall', { rating: 4 }),
	hours: e('The Hours', 'Michael Cunningham · 1998', 'Book', null, 'tall', { tint: 'moss' }),
	bluets: e('Bluets', 'Maggie Nelson · 2009', 'Book', photo('cover-violet'), 'tall', { rating: 4.5 })
};

const fashion = {
	lemaire: e('Lemaire', 'lemaire.fr', 'Brand', photo('fashion-hero'), 'portrait'),
	coat: e('Wool twill coat', 'Lemaire · €1,290', 'Wishlist', photo('fashion-portrait'), 'portrait'),
	ssense: e('SSENSE', 'ssense.com', 'Shop', photo('fashion-look'), 'portrait'),
	look1: e('Grey layers, Paris', 'Look · pinterest.com', 'Look', photo('fashion-look'), 'portrait'),
	toteme: e('Totême', 'toteme-studio.com', 'Brand', null, 'portrait', { tint: 'clay' }),
	aimee: e('Aimee Song', '@aimeesong', 'Influencer', photo('fashion-portrait'), 'portrait'),
	loafers: e('Leather loafers', 'Owned · Carmina', 'Wardrobe', photo('cover-ember'), 'portrait'),
	look2: e('Camel & cream', 'Look · instagram.com', 'Look', photo('cover-dusk'), 'portrait'),
	knit: e('Mohair cardigan', 'Our Legacy · €340', 'Wishlist', null, 'portrait', { tint: 'noir' })
};

export const domains: Record<Exclude<World, 'home'>, MockDomain> = {
	music: {
		world: 'music',
		label: 'Music',
		hero: photo('music-hero'),
		headline: ['What you', 'hear', 'on repeat'],
		intro: 'Albums, artists and the single songs worth keeping, from first listen to all-time favourites.',
		tabs: ['Albums', 'Artists', 'Songs'],
		shelves: [
			{ title: 'Listening', count: 4, entries: [music.sos, music.ctrl, music.punisher, music.kids, music.melodrama, music.channel] },
			{ title: 'Recently added', count: 12, entries: [music.nikes, music.frank, music.blonde, music.pink, music.channel, music.sos] }
		],
		listTitle: 'Albums',
		list: [music.blonde, music.sos, music.melodrama, music.ctrl, music.kids, music.channel, music.punisher, music.pink, music.nikes, music.frank],
		detail: {
			entry: music.blonde,
			eyebrow: ['Album', '2016', '17 tracks'],
			statusOptions: mediaStatus('Want to listen', 'Listening', 'Listened'),
			status: 'done',
			facts: [
				['Artist', 'Frank Ocean'],
				['Year', '2016'],
				['Type', 'Album'],
				['Tracks', '17']
			],
			tags: ['Late night', 'R&B', 'Summer'],
			note: 'Self Control at 2am, windows down. The record I come back to every August.'
		}
	},
	animanga: {
		world: 'animanga',
		label: 'Animanga',
		hero: photo('neon'),
		headline: ['Worlds you', 'watch', 'and read'],
		intro: 'Anime by the episode, manga by the chapter, and the stories still running.',
		tabs: ['Anime', 'Manga'],
		shelves: [
			{ title: 'Watching', count: 3, entries: [animanga.frieren, animanga.dandadan, animanga.mononoke, animanga.mushishi, animanga.nana, animanga.pluto] },
			{ title: 'Reading', count: 5, entries: [animanga.vagabond, animanga.monster, animanga.nana, animanga.pluto, animanga.mushishi, animanga.frieren] }
		],
		listTitle: 'Anime',
		list: [animanga.frieren, animanga.dandadan, animanga.mononoke, animanga.mushishi, animanga.nana, animanga.vagabond, animanga.monster, animanga.pluto],
		detail: {
			entry: animanga.frieren,
			eyebrow: ['Anime', '2023', 'Madhouse'],
			statusOptions: mediaStatus('Plan to watch', 'Watching', 'Watched'),
			status: 'progress',
			facts: [
				['Alt title', 'Sousou no Frieren'],
				['Year', '2023'],
				['Episodes', '28']
			],
			tags: ['Fantasy', 'Slow', 'Comfort'],
			note: 'Watch one episode a night, no bingeing. The flashbacks land harder that way.'
		}
	},
	books: {
		world: 'books',
		label: 'Books',
		hero: photo('books-hero'),
		headline: ['Pages', 'worth', 'returning to'],
		intro: 'The shelf you have, the one you want, and the notes in the margins.',
		tabs: ['Books'],
		shelves: [
			{ title: 'Reading', count: 2, entries: [books.piranesi, books.wood, books.bluets, books.klara, books.hours, books.kitchen] },
			{ title: 'Want to read', count: 9, entries: [books.klara, books.secret, books.hours, books.stoner, books.kitchen, books.bluets] }
		],
		listTitle: 'Books',
		list: [books.wood, books.stoner, books.piranesi, books.secret, books.klara, books.kitchen, books.hours, books.bluets],
		detail: {
			entry: books.wood,
			eyebrow: ['Book', '1987', 'Kodansha'],
			statusOptions: mediaStatus('Want to read', 'Reading', 'Read'),
			status: 'done',
			facts: [
				['Author', '村上春樹'],
				['Year', '1987']
			],
			tags: ['Japan', 'Melancholy', 'Reread'],
			note: 'Read it in one weekend in winter. The Beatles song has been stuck in my head ever since.'
		}
	},
	fashion: {
		world: 'fashion',
		label: 'Fashion',
		hero: photo('fashion-hero'),
		headline: ['Things', 'worth', 'wearing'],
		intro: 'Brands and shops to revisit, people with taste, the wishlist and the wardrobe.',
		tabs: ['Brands', 'Shops', 'Influencers', 'Pieces', 'Wardrobe', 'Looks'],
		shelves: [
			{ title: 'Wishlist', count: 7, entries: [fashion.coat, fashion.knit, fashion.loafers, fashion.look2, fashion.look1, fashion.toteme] },
			{ title: 'Brands & shops', count: 14, entries: [fashion.lemaire, fashion.ssense, fashion.toteme, fashion.aimee, fashion.look1, fashion.coat] }
		],
		listTitle: 'Looks',
		list: [fashion.look1, fashion.look2, fashion.coat, fashion.lemaire, fashion.ssense, fashion.toteme, fashion.aimee, fashion.knit, fashion.loafers],
		detail: {
			entry: fashion.coat,
			eyebrow: ['Piece', 'Lemaire'],
			statusOptions: [
				{ value: 'wishlist', label: 'Wishlist' },
				{ value: 'owned', label: 'Owned' },
				{ value: 'gone', label: 'Gone' }
			],
			status: 'wishlist',
			facts: [
				['Brand', 'Lemaire'],
				['Price', '€1,290'],
				['URL', 'lemaire.fr']
			],
			tags: ['Outerwear', 'Neutral', 'Investment'],
			note: 'Wait for the archive sale in January. Size 36, the dark navy not the black.'
		}
	}
};

export const home = {
	hero: photo('reading'),
	headline: ['Everything you', 'love', ', kept close'] as [string, string, string],
	intro: 'Music, anime and manga, books and fashion: what you want next, what you are in the middle of, and what stayed.',
	coverflow: [
		music.blonde,
		animanga.frieren,
		books.wood,
		fashion.coat,
		music.sos,
		animanga.vagabond,
		books.stoner,
		fashion.look1,
		music.kids,
		animanga.mushishi
	],
	stats: [
		{ label: 'Albums', value: 128 },
		{ label: 'Anime & manga', value: 64 },
		{ label: 'Books', value: 87 },
		{ label: 'Pieces & brands', value: 52 }
	],
	shelves: [
		{ title: 'In progress', count: 9, entries: [animanga.frieren, music.sos, books.piranesi, animanga.vagabond, animanga.dandadan, music.ctrl] },
		{ title: 'Recently added', accent: 'Music', count: 12, entries: [music.nikes, music.frank, music.blonde, music.pink, music.channel, music.kids] },
		{ title: 'Recently added', accent: 'Books', count: 8, entries: [books.bluets, books.secret, books.klara, books.hours, books.kitchen, books.stoner] }
	] as MockShelf[],
	collections: [
		{ id: 1, name: 'Winter evenings', description: 'Slow records, long books, warm coats.', count: 18, images: [1, 2, 3] },
		{ id: 2, name: 'Tokyo, someday', description: '', count: 11, images: [4, 5, 6] },
		{ id: 3, name: 'Rainy Sunday', description: '', count: 7, images: [7, 8] },
		{ id: 4, name: 'Gift ideas', description: '', count: 4, images: [9] },
		{ id: 5, name: 'New collection', description: '', count: 0, images: [] }
	]
};

// Collage ids → photos (the real app serves /images/<id>)
const collagePhotos = [
	'cover-ember',
	'reading',
	'fashion-portrait',
	'neon',
	'cover-moss',
	'music-hero',
	'cover-dusk',
	'books-hero',
	'cover-violet'
];
export const collageSrc = (id: number) => photo(collagePhotos[(id - 1) % collagePhotos.length]);
