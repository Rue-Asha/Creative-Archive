import type { Domain, Kind, MockData, MockEntry } from '../../fixtures.ts';
import { DOMAIN_LABEL, DOMAINS, fill, stress } from '../shell/data.ts';

export type SubType = { label: string; slug: string; kinds: Kind[]; count: number };
export type Shelf = { label: string; slug: string; count: number; list: MockEntry[] };
export type DomainView = {
	d: Domain;
	label: string;
	lede: string;
	worst: boolean;
	hero: boolean;
	media: boolean;
	subTypes: SubType[];
	shelves: Shelf[];
	inProgress: MockEntry[];
	inProgressCount: number;
	total: number;
};

export const asDomain = (value: string | null): Domain => (DOMAINS.includes(value as Domain) ? (value as Domain) : 'music');

const LEDE: Record<Domain, string> = {
	music: 'Albums, artists and songs you love or want to hear.',
	animanga: 'What you watch and read, episode by episode.',
	books: 'The shelf you are in the middle of, and the one waiting.',
	fashion: 'Brands, shops, pieces you own and looks you keep.'
};

// [label, slug, kinds, normal count, worst count]: sub-types in the contract's order; worst has a thousand, one and none
const SUBS: Record<Domain, [string, string, Kind[], number, number][]> = {
	music: [['Albums', 'albums', ['album'], 14, 1284], ['Artists', 'artists', ['artist'], 6, 1], ['Songs', 'songs', ['song'], 9, 0]],
	animanga: [['Anime', 'anime', ['anime'], 12, 312], ['Manga', 'manga', ['manga'], 7, 0]],
	books: [['Books', 'books', ['book'], 18, 1]],
	fashion: [
		['Wardrobe', 'wardrobe', ['piece'], 9, 148],
		['Pieces', 'pieces', ['piece'], 11, 203],
		['Looks', 'looks', ['look'], 5, 1],
		['Brands & shops', 'brands-shops', ['brand', 'site'], 8, 0],
		['Influencers', 'influencers', ['influencer'], 4, 27],
		['Magazines', 'magazines', ['magazine'], 6, 0]
	]
};

export function domainView(data: MockData, d: Domain, opts: { empty?: boolean; hero?: boolean; zero?: string[] } = {}): DomainView {
	const subTypes = SUBS[d].map(([label, slug, kinds, normal, worst]): SubType => ({
		label,
		slug,
		kinds,
		count: opts.empty || opts.zero?.includes(slug) ? 0 : data.worst ? worst : normal
	}));
	const shelves = subTypes
		.filter((s) => s.count > 0)
		.map((s, i): Shelf => ({
			label: s.label,
			slug: s.slug,
			count: s.count,
			list: stress(fill(data.list.filter((e) => e.domain === d && s.kinds.includes(e.kind)), Math.min(12, s.count)), data.worst, i)
		}));
	const media = d !== 'fashion';
	const progress = opts.empty || !media ? [] : stress(data.list.filter((e) => e.domain === d && e.status === 'doing'), data.worst, 1);
	return {
		d,
		label: DOMAIN_LABEL[d],
		lede: LEDE[d],
		worst: data.worst,
		hero: opts.hero ?? data.heroes[d] !== null,
		media,
		subTypes,
		shelves,
		inProgress: progress.slice(0, 12),
		inProgressCount: progress.length,
		total: subTypes.filter((s) => !(d === 'fashion' && s.slug === 'wardrobe')).reduce((n, s) => n + s.count, 0)
	};
}
