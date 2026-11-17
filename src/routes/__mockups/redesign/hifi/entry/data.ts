import type { Domain, MockData, MockEntryFull } from '../../fixtures.ts';
import { LISTS, type ListSlug } from '../list/data.ts';
import { LONG } from '../add/data.ts';

export type EntryKey = 'album' | 'anime' | 'book' | 'piece' | 'magazine' | 'artist';

export interface EntryInfo {
	label: string;
	domain: Domain;
	list: ListSlug;
	ratio: string;
	progress: { label: string; total: number | null }[];
	facts: [string, string][];
	statusSet: string[];
}

export const INFO: Record<EntryKey, EntryInfo> = {
	album: { label: 'Album', domain: 'music', list: 'albums', ratio: '1 / 1', progress: [], facts: [['Year', '2019'], ['Type', 'Album'], ['Tracks', '11']], statusSet: ['Want to listen', 'Listening', 'Listened', 'Dropped'] },
	anime: { label: 'Anime', domain: 'animanga', list: 'anime', ratio: '3 / 4', progress: [{ label: 'Episodes', total: 24 }], facts: [['Alternative title', 'ハーバー・ライツ'], ['Year', '2021'], ['Episodes total', '24']], statusSet: ['Plan to watch', 'Watching', 'Watched', 'Dropped'] },
	book: { label: 'Book', domain: 'books', list: 'books', ratio: '3 / 4', progress: [], facts: [['Authors', 'Odile Brandt, Joséphine Aubry'], ['Year', '2018']], statusSet: ['Want to read', 'Reading', 'Read', 'Dropped'] },
	piece: { label: 'Piece', domain: 'fashion', list: 'wardrobe', ratio: '3 / 4', progress: [], facts: [['Brand', 'Studio Nicholson'], ['URL', 'example.com/studio-nicholson/wool-overshirt'], ['Price', '€ 189']], statusSet: ['Wishlist', 'Owned', 'Gone'] },
	magazine: { label: 'Magazine', domain: 'fashion', list: 'magazines', ratio: '3 / 4', progress: [], facts: [['Instagram', '@kinfolk'], ['Website', 'kinfolk.com']], statusSet: [] },
	artist: { label: 'Artist', domain: 'music', list: 'artists', ratio: '1 / 1', progress: [], facts: [], statusSet: ['Want to listen', 'Listening', 'Listened', 'Dropped'] }
};

export const asKey = (value: string | null): EntryKey => (value && value in INFO ? (value as EntryKey) : 'album');
export const LISTNAME = (k: EntryKey) => LISTS[INFO[k].list].name;

const WORST: Record<EntryKey, string> = {
	album: LONG,
	anime: '東京の夜に流れる静かな歌 〜 完全版 〜',
	book: 'كتاب الحكايات القديمة والأسرار المنسية في مدينة الملح',
	piece: 'A',
	magazine: LONG,
	artist: '宮崎 駿・ジョン・ジェイコブ・ジングルハイマー・シュミット'
};

export function entryFor(data: MockData, key: EntryKey): MockEntryFull {
	const e = data.entry[key];
	if (!data.worst) return { ...e, title: key === 'album' ? 'Kintsugi Summer' : e.title, by: key === 'album' ? 'Juno Ashby' : e.by };
	return { ...e, title: WORST[key], cover: key === 'piece' ? null : e.cover };
}

export const TAGS_SHOWN = 8;
export const tagsToggle = (open: boolean, n: number) => (open ? 'Show fewer tags' : `Show all ${n} tags`);
