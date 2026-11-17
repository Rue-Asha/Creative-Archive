// Local data for the gate 4 wireframes of the list, Select, add, entry and edit screens. It reads the shared fixtures
// (worst-case titles, authors, tags, covers, the entry set) and adds what only these screens need.
import { mockData, type Domain, type Kind, type MockData, type MockEntry, type MockEntryFull, type PieceStatus, type Status } from '../../../fixtures.ts';

export type ListSlug = 'albums' | 'anime' | 'brands-shops' | 'magazines' | 'wardrobe';
export type Tone = 'square' | 'tall' | 'portrait';

export interface ListDef {
	slug: ListSlug;
	name: string;
	domain: Domain;
	kind: Kind;
	noun: [string, string];
	lede: string;
	media: boolean;
	piece: boolean;
	statuses: string[];
	tone: Tone;
	addHref: string;
	subTypes: string[];
}

export const base = '/__mockups/redesign/wire';

const musicStatuses = ['Want to listen', 'Listening', 'Listened', 'Dropped'];
const watchStatuses = ['Plan to watch', 'Watching', 'Watched', 'Dropped'];
const readStatuses = ['Want to read', 'Reading', 'Read', 'Dropped'];
const pieceStatuses = ['Wishlist', 'Owned', 'Gone'];

export const statusLabels = (kind: Kind): string[] =>
	kind === 'album' || kind === 'artist' || kind === 'song'
		? musicStatuses
		: kind === 'anime'
			? watchStatuses
			: kind === 'manga' || kind === 'book'
				? readStatuses
				: kind === 'piece'
					? pieceStatuses
					: [];

export const subTypesOf: Record<Domain, string[]> = {
	music: ['Albums', 'Artists', 'Songs'],
	animanga: ['Anime', 'Manga'],
	books: ['Books'],
	fashion: ['Brands & shops', 'Influencers', 'Magazines', 'Wardrobe', 'Looks']
};

export const domainLabel: Record<Domain, string> = { music: 'Music', animanga: 'Animanga', books: 'Books', fashion: 'Fashion' };

export const lists: Record<ListSlug, ListDef> = {
	albums: { slug: 'albums', name: 'Albums', domain: 'music', kind: 'album', noun: ['title', 'titles'], lede: 'Music · rated from 0 to 10', media: true, piece: false, statuses: musicStatuses, tone: 'square', addHref: `${base}/add`, subTypes: subTypesOf.music },
	anime: { slug: 'anime', name: 'Anime', domain: 'animanga', kind: 'anime', noun: ['title', 'titles'], lede: 'Animanga · rated from 0 to 10', media: true, piece: false, statuses: watchStatuses, tone: 'portrait', addHref: `${base}/add/manual`, subTypes: subTypesOf.animanga },
	'brands-shops': { slug: 'brands-shops', name: 'Brands & shops', domain: 'fashion', kind: 'brand', noun: ['entry', 'entries'], lede: 'Fashion · brands, shops and sites in one list', media: false, piece: false, statuses: [], tone: 'square', addHref: `${base}/add/url`, subTypes: subTypesOf.fashion },
	magazines: { slug: 'magazines', name: 'Magazines', domain: 'fashion', kind: 'magazine', noun: ['title', 'titles'], lede: 'Fashion · magazines worth keeping', media: false, piece: false, statuses: [], tone: 'portrait', addHref: `${base}/add/url`, subTypes: subTypesOf.fashion },
	wardrobe: { slug: 'wardrobe', name: 'Wardrobe', domain: 'fashion', kind: 'piece', noun: ['piece', 'pieces'], lede: 'Fashion · every piece you own', media: false, piece: true, statuses: pieceStatuses, tone: 'tall', addHref: `${base}/add/url`, subTypes: subTypesOf.fashion }
};

const pools: Record<ListSlug, [string, string | null][]> = {
	albums: [
		['Blue Hour Sessions', 'Marlene Okafor'],
		['Paper Lanterns', 'The Quiet Orchard'],
		['Low Tide', 'Ines Varga'],
		['Kintsugi Summer', 'Juno Ashby'],
		['Night Ferry', 'Halvard & Moe'],
		['Small Rooms', 'Ada Lindqvist'],
		['Glass Garden', 'The Quiet Orchard'],
		['Slow Weather', 'Marlene Okafor'],
		['Saltwater Radio', 'Coast Signal'],
		['After the Rain Stops', 'Ines Varga'],
		['Lamplight', 'Ada Lindqvist'],
		['Winter Letters', 'Halvard & Moe'],
		['Harbour Songs', 'Coast Signal'],
		['Soft Machines', 'Juno Ashby'],
		['Evening Tide', 'Marlene Okafor'],
		['Porcelain', 'The Quiet Orchard']
	],
	anime: [
		['Harbour Lights', 'Studio Kitsune'],
		['Night Train to Aomori', 'Studio Tsuki'],
		['The Lighthouse Keeper', 'Studio Kitsune'],
		['Paper Moon Café', 'Studio Hoshi'],
		['Small Gods of Spring', 'Studio Tsuki'],
		['Rooftop Radio', 'Studio Hoshi'],
		['Winter Courier', 'Studio Kitsune'],
		['Tidewater', 'Studio Tsuki']
	],
	'brands-shops': [
		['Margaret Howell', null],
		['Studio Nicholson', null],
		['Cosmos Vintage', null],
		['Folk Clothing', null],
		['Oak Street Tailors', null],
		['The Linen Room', null],
		['Atelier Hana', null],
		['Wool & Thread', null],
		['Second Hand Rose', null],
		['Northfield Outfitters', null]
	],
	magazines: [
		['Kinfolk Issue 52', 'Kinfolk'],
		['Apartamento No. 31', 'Apartamento'],
		['The Gentlewoman Spring', 'The Gentlewoman'],
		['Cereal Volume 28', 'Cereal'],
		['Drift Quarterly', 'Drift'],
		['Monocle Annual', 'Monocle'],
		['Fantastic Man 40', 'Fantastic Man'],
		['Hole & Corner', 'Hole & Corner']
	],
	wardrobe: [
		['Wool overshirt', 'Studio Nicholson'],
		['Linen trousers', 'Margaret Howell'],
		['Chelsea boots', 'Oak Street Tailors'],
		['Knit cardigan', 'Folk Clothing'],
		['Canvas tote', 'Atelier Hana'],
		['Raincoat', 'Northfield Outfitters'],
		['Cotton shirt', 'The Linen Room'],
		['Silk scarf', 'Second Hand Rose'],
		['Denim jacket', 'Wool & Thread'],
		['Leather belt', 'Oak Street Tailors']
	]
};

const tagSets = [['favourite'], ['favourite', 'autumn'], ['quiet'], [], ['favourite', 'autumn', 'quiet']];
const brandKinds = ['Brand', 'Shop', 'Site'];

export function isWorstTitle(t: string): boolean {
	return t.length > 60 || /[^\u0000-ɏ]/.test(t) || t === 'A';
}

export function langOf(s: string | null): string | undefined {
	if (!s) return undefined;
	if (/[぀-ヿ一-鿿]/.test(s)) return 'ja';
	if (/[؀-ۿ]/.test(s)) return 'ar';
	return undefined;
}

export const dirOf = (s: string | null): 'rtl' | undefined => (langOf(s) === 'ar' ? 'rtl' : undefined);

export function initials(title: string): string {
	const words = title.trim().split(/\s+/).filter(Boolean);
	const first = (w: string) => Array.from(w)[0] ?? '';
	if (words.length === 1) return Array.from(words[0]).slice(0, /[぀-ヿ一-鿿]/.test(words[0]) ? 1 : 2).join('').toUpperCase();
	return (first(words[0]) + first(words[1])).toUpperCase();
}

export const plural = (n: number, one: string, many: string) => `${n.toLocaleString('en-GB')} ${n === 1 ? one : many}`;

export const fmtRating = (n: number | null): string | null => (n === null ? null : String(Number(n.toFixed(2))));

export interface ListEntry extends MockEntry {
	kindLabel: string | null;
}

// 16 entries normally; the worst case names 500 and the wireframe draws the first 24 under the true count
export function listFor(slug: ListSlug, fx: MockData): { entries: ListEntry[]; total: number; worst: boolean } {
	const def = lists[slug];
	const pool = pools[slug];
	const worst = fx.worst;
	const n = worst ? 24 : Math.min(pool.length, slug === 'albums' ? 16 : 8);
	const statuses: Status[] = ['doing', 'want', 'done', 'dropped', null, 'done', 'want', 'doing'];
	const owned: PieceStatus[] = ['owned', 'owned', 'owned', 'owned', 'owned'];
	const entries = Array.from({ length: n }, (_, i): ListEntry => {
		const f = fx.list[i];
		const [poolTitle, poolBy] = pool[i % pool.length];
		const title = worst && isWorstTitle(f.title) ? f.title : poolTitle;
		const by = worst && f.by && f.by.includes('宮崎') ? f.by : poolBy;
		const kind: Kind = slug === 'brands-shops' ? (['brand', 'site', 'brand'][i % 3] as Kind) : def.kind;
		const rated = def.media && i % 4 !== 3;
		return {
			id: i + 1,
			kind,
			domain: def.domain,
			title,
			by,
			cover: worst ? f.cover : i % 9 === 4 ? null : 'cover',
			status: def.media ? statuses[i % statuses.length] : def.piece ? owned[i % owned.length] : null,
			rating: rated ? [8.75, 9, 7.5, 0, 6, 10][i % 6] : null,
			progress: kind === 'anime' ? { done: [7, 0, 24, 12][i % 4], total: 24, unit: 'episodes' } : null,
			tags: worst ? f.tags : tagSets[i % tagSets.length],
			year: 1998 + ((i * 3) % 27),
			kindLabel: slug === 'brands-shops' ? (i % 3 === 1 ? brandKinds[2] : i % 4 === 2 ? brandKinds[1] : brandKinds[0]) : null
		};
	});
	return { entries, total: worst ? 500 : n, worst };
}

export const entryHref = `${base}/entry`;

export type { MockData, MockEntryFull, Domain, Kind, Status, PieceStatus };

export type StateKey = 'want' | 'doing' | 'done' | 'dropped' | 'wishlist' | 'owned' | 'gone';

export function statusOf(e: MockEntry): { label: string; state: StateKey } | null {
	if (e.status === null || e.status === undefined) return null;
	const labels = statusLabels(e.kind);
	const order: StateKey[] = e.kind === 'piece' ? ['wishlist', 'owned', 'gone'] : ['want', 'doing', 'done', 'dropped'];
	const at = order.indexOf(e.status as StateKey);
	return at < 0 ? null : { label: labels[at], state: order[at] };
}

// the four worst-case titles (Latin, Japanese, Arabic, one letter) as list entries, for the state galleries in normal mode too
export function titleSamples(slug: ListSlug): ListEntry[] {
	const def = lists[slug];
	const worst = mockData(new URL('http://x/?data=worst'));
	const picks = [worst.list.find((e) => /[぀-ヿ一-鿿]/.test(e.title)), worst.list.find((e) => /[؀-ۿ]/.test(e.title)), worst.list.find((e) => e.title === 'A'), worst.list.find((e) => e.title.length > 150)];
	return picks
		.filter((e): e is MockEntry => !!e)
		.map((e, i) => ({ ...e, id: 900 + i, kind: def.kind, domain: def.domain, status: def.media ? 'doing' : null, rating: def.media ? 8.75 : null, progress: null, kindLabel: null, cover: i === 2 ? null : e.cover }));
}

// the fixtures for a mockup URL (page.url is read-only in Kit, mockData wants a plain URL)
export function dataFor(url: { searchParams: { get(name: string): string | null } }): MockData {
	return mockData(new URL(`http://x/${url.searchParams.get('data') === 'worst' ? '?data=worst' : ''}`));
}

export type EntryKey = 'album' | 'anime' | 'book' | 'piece' | 'magazine' | 'artist';

export interface EntryInfo {
	label: string;
	domain: Domain;
	list: string;
	progress: { label: string; total: number | null }[];
	facts: [string, string][];
}

const longTitle = 'The Extraordinarily Long Title That Never Quite Ends And Keeps Going '.repeat(3).slice(0, 180);

export const entryInfo: Record<EntryKey, EntryInfo> = {
	album: { label: 'Album', domain: 'music', list: 'Albums', progress: [], facts: [['Year', '2019'], ['Type', 'Album'], ['Tracks', '11']] },
	anime: { label: 'Anime', domain: 'animanga', list: 'Anime', progress: [{ label: 'Episodes', total: 24 }], facts: [['Alternative title', 'ハーバー・ライツ'], ['Year', '2021'], ['Episodes total', '24']] },
	book: { label: 'Book', domain: 'books', list: 'Books', progress: [], facts: [['Authors', 'Odile Brandt'], ['Year', '2018']] },
	piece: { label: 'Piece', domain: 'fashion', list: 'Wardrobe', progress: [], facts: [['Brand', 'Studio Nicholson'], ['URL', 'example.com/studio-nicholson/wool-overshirt'], ['Price', '€ 189']] },
	magazine: { label: 'Magazine', domain: 'fashion', list: 'Magazines', progress: [], facts: [['Instagram', '@kinfolk'], ['Website', 'kinfolk.com']] },
	artist: { label: 'Artist', domain: 'music', list: 'Artists', progress: [], facts: [] }
};

// one entry per kind from the fixtures; the worst case swaps in a 180-character, a Japanese, an Arabic and a one-letter title
export function entryFor(fx: MockData, key: EntryKey): MockEntryFull {
	const e = fx.entry[key];
	if (!fx.worst) return { ...e, title: key === 'album' ? 'Kintsugi Summer' : e.title, by: key === 'album' ? 'Juno Ashby' : e.by };
	const titles: Record<EntryKey, string> = {
		album: longTitle,
		anime: '東京の夜に流れる静かな歌 〜 完全版 〜',
		book: 'كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح',
		piece: 'A',
		magazine: longTitle,
		artist: '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット'
	};
	return { ...e, title: titles[key], cover: key === 'piece' ? null : e.cover };
}

// the last word carries the accent; a title of one word has none
export function splitTitle(title: string): { head: string; word: string | null } {
	const m = title.match(/^(.*\s)(\S+)$/s);
	return m ? { head: m[1], word: m[2] } : { head: title, word: null };
}
