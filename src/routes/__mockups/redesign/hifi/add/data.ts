import type { Domain } from '../../fixtures.ts';
import { LISTS, type ListSlug } from '../list/data.ts';

export type FormKind = 'album' | 'artist' | 'song' | 'anime' | 'manga' | 'book' | 'brand' | 'influencer' | 'magazine' | 'piece' | 'look';

export interface TypeInfo {
	kind: FormKind;
	domain: Domain;
	list: ListSlug;
	word: string;
	entry: 'catalogue' | 'url' | 'manual';
	lede: string;
}

export const TYPES: Record<FormKind, TypeInfo> = {
	album: { kind: 'album', domain: 'music', list: 'albums', word: 'album', entry: 'catalogue', lede: 'Search the catalogue, or add it by hand.' },
	artist: { kind: 'artist', domain: 'music', list: 'artists', word: 'artist', entry: 'catalogue', lede: 'Search the catalogue, or add the name by hand.' },
	song: { kind: 'song', domain: 'music', list: 'songs', word: 'song', entry: 'catalogue', lede: 'Search the catalogue, or add it by hand.' },
	anime: { kind: 'anime', domain: 'animanga', list: 'anime', word: 'anime', entry: 'catalogue', lede: 'Search the catalogue, or add it by hand.' },
	manga: { kind: 'manga', domain: 'animanga', list: 'manga', word: 'manga', entry: 'catalogue', lede: 'Search the catalogue, or add it by hand.' },
	book: { kind: 'book', domain: 'books', list: 'books', word: 'book', entry: 'catalogue', lede: 'Search the catalogue, or add it by hand.' },
	brand: { kind: 'brand', domain: 'fashion', list: 'brands-shops', word: 'brand or shop', entry: 'url', lede: 'Paste a page link for a picture and a name, or fill the form by hand.' },
	influencer: { kind: 'influencer', domain: 'fashion', list: 'influencers', word: 'influencer', entry: 'url', lede: 'Paste a profile link for the handle and a picture, or fill the form by hand.' },
	magazine: { kind: 'magazine', domain: 'fashion', list: 'magazines', word: 'magazine', entry: 'url', lede: 'Paste a page link for a cover and a name, or fill the form by hand.' },
	piece: { kind: 'piece', domain: 'fashion', list: 'pieces', word: 'piece', entry: 'url', lede: 'Paste a page link for a picture and a name, or fill the form by hand.' },
	look: { kind: 'look', domain: 'fashion', list: 'looks', word: 'look', entry: 'manual', lede: 'Give the look a title and, if you have one, where it came from.' }
};

export const asType = (value: string | null, fallback: FormKind = 'album'): FormKind => (value && value in TYPES ? (value as FormKind) : fallback);

export const listName = (kind: FormKind) => LISTS[TYPES[kind].list].name;

export const MEDIA: FormKind[] = ['album', 'artist', 'song', 'anime', 'manga', 'book'];
export const STATUS_LABELS: Record<string, string[]> = {
	music: ['Want to listen', 'Listening', 'Listened', 'Dropped'],
	animanga: ['Plan to watch', 'Watching', 'Watched', 'Dropped'],
	books: ['Want to read', 'Reading', 'Read', 'Dropped'],
	piece: ['Wishlist', 'Owned', 'Gone']
};
export const statusOptions = (kind: FormKind): string[] =>
	kind === 'piece' ? STATUS_LABELS.piece : MEDIA.includes(kind) ? ['No status', ...(kind === 'manga' ? STATUS_LABELS.books : STATUS_LABELS[TYPES[kind].domain])] : [];

export const LONG = 'The Extraordinarily Long Title That Never Quite Ends And Keeps Going '.repeat(3).slice(0, 180);

export const RESULTS: Record<string, [string, string, number][]> = {
	album: [['Kintsugi Summer', 'Juno Ashby', 2019], ['Blue Hour Sessions', 'Marlene Okafor', 2021], ['Kintsugi Summer (Deluxe)', 'Juno Ashby', 2020]],
	artist: [['Juno Ashby', 'Artist', 2012], ['Juno Ashby Quartet', 'Artist', 2016], ['June Ashby', 'Artist', 2009]],
	song: [['Kintsugi', 'Juno Ashby', 2019], ['Kintsugi (live)', 'Juno Ashby', 2020], ['Gold Seams', 'Ada Lindqvist', 2018]],
	anime: [['Harbour Lights', 'Studio Kitsune', 2021], ['Harbour Lights: Winter', 'Studio Kitsune', 2022], ['Harbour at Dusk', 'Studio Hoshi', 2015]],
	manga: [['The Salt Clockmaker', 'Haruka Mori', 2017], ['The Salt Clockmaker: Side Stories', 'Haruka Mori', 2019], ['Salt and Hours', 'Mio Tanabe', 2020]],
	book: [['A Field Guide to Winter', 'Odile Brandt', 2018], ['A Field Guide to Summer', 'Odile Brandt', 2020], ['Field Notes on Snow', 'Pablo Iriarte', 2014]]
};
export const WORST_RESULTS: [string, string, number][] = [
	['東京の夜に流れる静かな歌 〜 完全版 〜', '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット', 2023],
	['كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح', 'عبد الرحمن منيف', 1984],
	[LONG, 'Maximilian Alexander von Hohenzollern-Sigmaringen-Wasserburg', 2001]
];
export const resultsFor = (kind: FormKind, worst: boolean) =>
	[...(RESULTS[kind] ?? RESULTS.album), ...(worst ? WORST_RESULTS : [])].map(([title, by, year], i) => ({ title, by, year, exists: i === 1 && kind === 'album', cover: i !== 2 }));
