// Gate 4 wireframe helpers for the shell, Home, domain and Settings screens. Fixtures stay in ../../fixtures.ts; what these
// screens need beyond it (add items, sub-types, count and title stress) lives here.
import type { Domain, Kind, MockEntry, PhotoWorld, Section } from '../../fixtures.ts';

export const base = '/__mockups/redesign';

export const link = (path: string, worst: boolean, extra = '') => {
	const query = [worst ? 'data=worst' : '', extra].filter(Boolean).join('&');
	return `${base}/${path}${query ? `?${query}` : ''}`;
};

export type Current = Section | 'settings';

export const sections: { id: Section; label: string; path: string }[] = [
	{ id: 'home', label: 'Home', path: 'wire/home' },
	{ id: 'music', label: 'Music', path: 'wire/domain' },
	{ id: 'animanga', label: 'Animanga', path: 'wire/domain' },
	{ id: 'books', label: 'Books', path: 'wire/domain' },
	{ id: 'fashion', label: 'Fashion', path: 'wire/domain' },
	{ id: 'collections', label: 'Collections', path: 'wire/collections' }
];

export const sectionLink = (s: { id: Section; path: string }, worst: boolean) =>
	link(s.path, worst, s.path === 'wire/domain' ? `d=${s.id}` : '');

export const DOMAINS: Domain[] = ['music', 'animanga', 'books', 'fashion'];
export const DOMAIN_LABEL: Record<PhotoWorld, string> = { home: 'Home', music: 'Music', animanga: 'Animanga', books: 'Books', fashion: 'Fashion' };

export type AddItem = { domain: Domain; label: string; type: string };

const ITEMS: Record<Domain, [string, string][]> = {
	music: [['Album', 'album'], ['Artist', 'artist'], ['Song', 'song']],
	animanga: [['Anime', 'anime'], ['Manga', 'manga']],
	books: [['Book', 'book']],
	fashion: [['Brand or shop', 'brand'], ['Influencer', 'influencer'], ['Magazine', 'magazine'], ['Piece', 'piece'], ['Look', 'look']]
};

export const addItems = (scope: Domain | 'all'): AddItem[] =>
	(scope === 'all' ? DOMAINS : [scope]).flatMap((domain) => ITEMS[domain].map(([label, type]) => ({ domain, label, type })));

export const addGroups = (scope: Domain | 'all') =>
	(scope === 'all' ? DOMAINS : [scope]).map((domain) => ({ domain, label: DOMAIN_LABEL[domain], items: addItems(domain) }));

export const fmt = (n: number) => n.toLocaleString('en');
export const entries = (n: number) => (n === 1 ? '1 entry' : `${fmt(n)} entries`);

export function initials(title: string) {
	const words = title.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
	const first = Array.from(words[0] ?? '?');
	if (/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(first[0])) return first.slice(0, 2).join('');
	const pick = words.length > 1 ? [words[0], words[1]] : [words[0] ?? '?'];
	return pick.map((w) => Array.from(w.replace(/^[^\p{L}\p{N}]+/u, ''))[0] ?? '?').join('').toUpperCase();
}

const KIND_LABEL: Record<Kind, string> = {
	album: 'Album', artist: 'Artist', song: 'Song', anime: 'Anime', manga: 'Manga', book: 'Book', magazine: 'Magazine',
	brand: 'Brand or shop', site: 'Brand or shop', influencer: 'Influencer', piece: 'Piece', look: 'Look'
};
export const kindLabel = (kind: Kind) => KIND_LABEL[kind];

const STATUS: Record<Domain, Record<string, string>> = {
	music: { want: 'Want to listen', doing: 'Listening', done: 'Listened', dropped: 'Dropped' },
	animanga: { want: 'Plan to watch', doing: 'Watching', done: 'Watched', dropped: 'Dropped' },
	books: { want: 'Want to read', doing: 'Reading', done: 'Read', dropped: 'Dropped' },
	fashion: { wishlist: 'Wishlist', owned: 'Owned', gone: 'Gone' }
};
const MANGA: Record<string, string> = { want: 'Want to read', doing: 'Reading', done: 'Read', dropped: 'Dropped' };
export function statusLabel(e: MockEntry) {
	if (!e.status) return null;
	if (e.kind === 'manga') return MANGA[e.status] ?? null;
	return (STATUS[e.domain] as Record<string, string>)[e.status] ?? null;
}

export function ratingText(rating: number | null) {
	return rating === null ? null : `${Number(rating.toFixed(2))} / 10`;
}

export function progressText(e: MockEntry) {
	if (!e.progress) return null;
	const { done, total, unit } = e.progress;
	const shown = total === null ? `${fmt(done)} / ?` : `${fmt(Math.min(done, total))} / ${fmt(total)}`;
	return `${shown} ${unit}`;
}

// worst-case copies of the first entries: 180-character Latin, Japanese, Arabic, one letter, no cover, long author
const LONG = 'The Extraordinarily Long Title That Never Quite Ends And Keeps Going Because Someone Typed The Whole Subtitle Too: A Field Guide To Everything We Almost Forgot To Write Down Before The Archive Closed'.slice(0, 180);
const STRESS: Partial<MockEntry>[] = [
	{ title: LONG, by: 'Maximilian Alexander von Hohenzollern-Sigmaringen-Wasserburg' },
	{ title: '東京の夜に流れる静かな歌 〜 完全版 〜', by: '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット' },
	{ title: 'كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح', by: 'عبد الرحمن منيف' },
	{ title: 'A', by: null, cover: null }
];
export const stress = (list: MockEntry[], worst: boolean, offset = 0): MockEntry[] =>
	worst ? list.map((e, i) => (i < 2 ? { ...e, ...STRESS[(i + offset) % STRESS.length] } : e)) : list;

// the normal fixture holds a couple of dozen entries; shelves cycle them up to the count a shelf shows (12 newest)
export function fill(source: MockEntry[], n: number): MockEntry[] {
	if (!source.length) return [];
	return Array.from({ length: n }, (_, i) => {
		const e = source[i % source.length];
		const round = Math.floor(i / source.length);
		return round ? { ...e, id: e.id + 1000 * round, title: `${e.title} ${['II', 'III', 'IV', 'V'][round - 1] ?? round + 1}` } : e;
	});
}
