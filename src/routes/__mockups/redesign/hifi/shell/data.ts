// Shared by the gate 5 hi-fi screens (shell, Home, domain, Settings and, after the merge, list, entry, collections): links, sections,
// the "+" sheet items, labels and the stress helpers. Fixtures stay in ../../fixtures.ts.
import type { Domain, Kind, MockEntry, PhotoWorld, Section } from '../../fixtures.ts';

export const base = '/__mockups/redesign';

// a screen links to its hi-fi page once that exists and to its wireframe until then
const hifi = new Set(Object.keys(import.meta.glob('../../hifi/*/+page.svelte')).map((key) => key.split('/')[3]));

export const href = (slug: string, worst: boolean, extra = '') => {
	const query = [worst ? 'data=worst' : '', extra].filter(Boolean).join('&');
	return `${base}/${hifi.has(slug) ? 'hifi' : 'wire'}/${slug}${query ? `?${query}` : ''}`;
};

export type Current = Section | 'settings';

export const sections: { id: Section; label: string; slug: string }[] = [
	{ id: 'home', label: 'Home', slug: 'home' },
	{ id: 'music', label: 'Music', slug: 'domain' },
	{ id: 'animanga', label: 'Animanga', slug: 'domain' },
	{ id: 'books', label: 'Books', slug: 'domain' },
	{ id: 'fashion', label: 'Fashion', slug: 'domain' },
	{ id: 'collections', label: 'Collections', slug: 'collections' }
];

export const sectionHref = (s: { id: Section; slug: string }, worst: boolean) => href(s.slug, worst, s.slug === 'domain' ? `d=${s.id}` : '');

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

export const sheetTitle = (scope: Domain | 'all') => (scope === 'all' ? 'Add to your archive' : `Add to ${DOMAIN_LABEL[scope]}`);

export const fmt = (n: number) => n.toLocaleString('en-GB');
export const plural = (n: number, one: string, many: string) => `${fmt(n)} ${n === 1 ? one : many}`;
export const entries = (n: number) => plural(n, 'entry', 'entries');

export function initials(title: string) {
	const words = title.trim().split(/[\s:;,.!?—–-]+/).filter((w) => /^[\p{L}\p{N}]/u.test(w));
	if (!words.length) return '·';
	if (/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(words[0])) return Array.from(words[0])[0];
	return words.slice(0, 2).map((w) => Array.from(w)[0].toUpperCase()).join('');
}

// the generated cover-*/fashion-* gradients read as mesh filler; entries without a real photo get the initials plate
export const synthetic = (src: string | null | undefined) => !!src && /\/(cover|fashion)-[a-z]+\.jpg$/.test(src);
export const real = (src: string | null | undefined) => (src && !synthetic(src) ? src : null);

// a heading title that stays readable: cut at a word boundary past `max` characters, the accent on the last whole word
// that carries a letter or digit (never on an ornament like 〜 or a fragment), anything after it plain
export function headTitle(title: string, max = 64): { head: string; word: string | null; rest: string } {
	const t = title.trim();
	let cut = false;
	let text = t;
	if (Array.from(t).length > max) {
		const head = Array.from(t).slice(0, max).join('');
		const space = head.lastIndexOf(' ');
		text = space > 0 ? head.slice(0, space) : head;
		cut = true;
	}
	const m = text.match(/^(.*?)(\S*[\p{L}\p{N}]\S*)([^\p{L}\p{N}]*)$/su);
	if (!m) return { head: text, word: null, rest: cut ? '…' : '' };
	const [, head, word, rest] = m;
	return { head, word, rest: rest + (cut ? '…' : '') };
}

// headless and older browsers ship no hyphenation dictionary: a long Latin word (14+ letters) gets soft hyphens before the last consonant of a syllable
// so a narrow card breaks it with a hyphen instead of mid-word
export const soft = (text: string | null | undefined) =>
	text ? text.replace(/[A-Za-z\u00C0-\u024F]{14,}/g, (w) => w.replace(/([aeiouy][^aeiouy]*?)(?=[^aeiouy][aeiouy])/gi, (m, v, at) => (at + m.length >= 3 && at + m.length <= w.length - 3 ? v + '\u00AD' : v))) : text;

export const tone = (title: string) => Array.from(title).reduce((h, c) => (h * 31 + c.codePointAt(0)!) >>> 0, 7) % 4;

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

export const ratingText = (rating: number | null) => (rating === null ? null : `${Number(rating.toFixed(2))} / 10`);

export function progressParts(e: MockEntry) {
	if (!e.progress) return null;
	const { done, total, unit } = e.progress;
	const shown = total === null ? done : Math.min(done, total);
	return { label: unit[0].toUpperCase() + unit.slice(1), done: shown, total, text: `${fmt(shown)} / ${total === null ? '?' : fmt(total)} ${unit}` };
}

// the normal fixture holds a couple of dozen entries; shelves cycle them up to the count a shelf shows (12 newest)
export function fill(source: MockEntry[], n: number): MockEntry[] {
	if (!source.length) return [];
	return Array.from({ length: n }, (_, i) => {
		const e = source[i % source.length];
		const round = Math.floor(i / source.length);
		return round ? { ...e, id: e.id + 1000 * round, title: `${e.title} ${['II', 'III', 'IV', 'V'][round - 1] ?? round + 1}` } : e;
	});
}

// worst case: 180-character Latin, Japanese, Arabic, one letter, no cover, long author
const LONG = 'The Extraordinarily Long Title That Never Quite Ends And Keeps Going Because Someone Typed The Whole Subtitle Too: A Field Guide To Everything We Almost Forgot To Write Down Before The Archive Closed'.slice(0, 180);
const STRESS: Partial<MockEntry>[] = [
	{ title: LONG, by: 'Maximilian Alexander von Hohenzollern-Sigmaringen-Wasserburg' },
	{ title: '東京の夜に流れる静かな歌 〜 完全版 〜', by: '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット' },
	{ title: 'كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح', by: 'عبد الرحمن منيف' },
	{ title: 'A', by: null, cover: null }
];
export const stress = (list: MockEntry[], worst: boolean, offset = 0): MockEntry[] =>
	worst ? list.map((e, i) => (i < 4 ? { ...e, ...STRESS[(i + offset) % STRESS.length] } : e)) : list;

export const langOf = (text: string) => (/[぀-ヿ一-鿿]/u.test(text) ? 'ja' : /[؀-ۿ]/u.test(text) ? 'ar' : undefined);
