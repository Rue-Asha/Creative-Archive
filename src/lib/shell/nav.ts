import { DOMAINS, type World } from '#lib/domains.ts';
import { TYPES } from '#lib/entries/config.ts';

export type Section = World | 'collections' | 'settings';

// the top bar shows from this width up; everything below, tablets included, gets the phone bar
export const POSTURE_SWITCH = 1024;

// Collections and Settings sit in the home world, so the world alone can't tell them from Home.
export function activeSection(pathname: string, world: World): Section {
	if (pathname === '/collections' || pathname.startsWith('/collections/')) return 'collections';
	if (pathname === '/settings' || pathname.startsWith('/settings/')) return 'settings';
	return world;
}

// An entry's world is only known from its page data, so entry paths answer home here.
export function worldOf(path: string): World {
	const [first, second] = path.split(/[?#]/)[0].split('/').filter(Boolean);
	const domain = DOMAINS.find((d) => d === first);
	if (domain) return domain;
	if (first === 'add' && second && second in TYPES) return TYPES[second as keyof typeof TYPES].domain;
	return 'home';
}

// How far each shelf row was scrolled when a page was left, by list URL and shelf name. Module memory: a full reload
// loses it, and history back is the only way it is read.
const rows = new Map<string, Map<string, number>>();
const shelfName = (el: Element) => el.closest('[data-shelf]')?.getAttribute('data-shelf') ?? null;
const listKey = (url: URL) => url.pathname + url.search;

export function rememberShelves(url: URL): void {
	const lefts = new Map<string, number>();
	for (const row of document.querySelectorAll('[data-shelf-row]')) {
		const name = shelfName(row);
		if (name !== null) lefts.set(name, row.scrollLeft);
	}
	rows.set(listKey(url), lefts);
}

export function restoreShelves(url: URL): void {
	const lefts = rows.get(listKey(url));
	if (!lefts) return;
	// a row can still be growing (images, fonts) or snapping when the page lands, so each frame sets it again until it holds
	let frames = 0;
	const place = () => {
		let held = true;
		for (const row of document.querySelectorAll('[data-shelf-row]')) {
			const left = lefts.get(shelfName(row) ?? '');
			if (left === undefined) continue;
			row.scrollLeft = left;
			if (Math.abs(row.scrollLeft - left) > 1) held = false;
		}
		if (!held && ++frames < 30) requestAnimationFrame(place);
	};
	requestAnimationFrame(place);
}
