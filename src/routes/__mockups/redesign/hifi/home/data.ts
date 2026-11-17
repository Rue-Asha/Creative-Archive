import type { Domain, MockCollection, MockData, MockEntry } from '../../fixtures.ts';
import { DOMAIN_LABEL, DOMAINS, fill, stress } from '../shell/data.ts';

export type Tile = { id: Domain; label: string; count: number; hero: boolean };
export type Recent = { domain: Domain; label: string; count: number; list: MockEntry[] };

export type HomeView = {
	worst: boolean;
	hero: boolean;
	tiles: Tile[];
	inProgress: MockEntry[];
	inProgressCount: number;
	recent: Recent[];
	collections: MockCollection[];
	total: number;
};

// counts a tile and its "Recently added" shelf show; worst case: thousands, one, none
const COUNTS: Record<Domain, number> = { music: 38, animanga: 24, books: 17, fashion: 31 };
const WORST_COUNTS: Record<Domain, number> = { music: 1284, animanga: 12, books: 1, fashion: 0 };

export function homeView(data: MockData): HomeView {
	const counts = data.worst ? WORST_COUNTS : COUNTS;
	const recent = DOMAINS.map((domain, i): Recent => ({
		domain,
		label: DOMAIN_LABEL[domain],
		count: counts[domain],
		list: stress(fill(data.home.recent[domain], Math.min(12, counts[domain])), data.worst, i)
	}));
	const inProgress = stress(data.home.inProgress, data.worst, 1);
	return {
		worst: data.worst,
		hero: data.heroes.home !== null,
		tiles: DOMAINS.map((id) => ({ id, label: DOMAIN_LABEL[id], count: counts[id], hero: data.heroes[id] !== null })),
		inProgress: inProgress.slice(0, 12),
		inProgressCount: inProgress.length,
		recent,
		collections: data.home.collections,
		total: DOMAINS.reduce((n, d) => n + counts[d], 0)
	};
}

export const EMPTY: Pick<HomeView, 'tiles' | 'inProgress' | 'inProgressCount' | 'recent' | 'collections' | 'total'> = {
	tiles: DOMAINS.map((id) => ({ id, label: DOMAIN_LABEL[id], count: 0, hero: false })),
	inProgress: [],
	inProgressCount: 0,
	recent: [],
	collections: [],
	total: 0
};

export const LEDE = 'Music, anime and manga, books and fashion: what you want next, what you are in the middle of, and what stayed.';

export const WELCOME: [Domain, string, string][] = [
	['music', 'Albums, artists and songs you love or want to hear.', 'Add your first album'],
	['animanga', 'What you watch and read, episode by episode.', 'Add your first anime'],
	['books', 'The shelf you are in the middle of, and the one waiting.', 'Add your first book'],
	['fashion', 'Brands, shops, pieces you own and looks you keep.', 'Add your first piece']
];
