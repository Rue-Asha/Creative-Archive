import type { NavigationType } from '$app/navigation';
import { atRest } from '#lib/entries/tilt.ts';
import { coverName, holdReveals, reducedMotion } from '#lib/motion.ts';

export interface MorphTarget {
	id: number;
	direction: 'forward' | 'back';
}

const DETAIL = /^\/entries\/(\d+)\/?$/;
const EDIT = /^\/entries\/\d+\/edit\/?$/;

// forward: a card opens its detail page; back: the detail page returns to wherever it was opened from.
// The edit page has no card cover on either side, so it never morphs.
export function morphTarget(from: string, to: string): MorphTarget | null {
	if (EDIT.test(from) || EDIT.test(to)) return null;
	const entering = DETAIL.exec(to);
	if (entering) return { id: Number(entering[1]), direction: 'forward' };
	const leaving = DETAIL.exec(from);
	if (leaving) return { id: Number(leaving[1]), direction: 'back' };
	return null;
}

const covers = (id: number) => `[data-cover-id="${id}"]`;

function inView(el: Element): boolean {
	const r = el.getBoundingClientRect();
	return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
}

// the card that was clicked, else the first one on screen, else the first one
function cardCover(id: number, clicked: Element | null): HTMLElement | null {
	if (clicked?.isConnected && clicked.matches(covers(id))) return clicked as HTMLElement;
	const all = [...document.querySelectorAll<HTMLElement>(covers(id))];
	return all.find(inView) ?? all[0] ?? null;
}

let lastClicked: Element | null = null;

// A card's cover is a sibling of its stretched title link, so the click target never contains it.
export function trackCoverClicks(): () => void {
	const remember = (event: MouseEvent) => {
		lastClicked = (event.target as Element | null)?.closest('[data-card]')?.querySelector('[data-cover-id]') ?? null;
	};
	document.addEventListener('click', remember, { capture: true });
	return () => document.removeEventListener('click', remember, { capture: true });
}

// The card a detail page was opened from, by its shelf (null outside shelves) and index there, and how far each
// shelf row was scrolled, keyed by the list URL. Module memory: a full reload loses it, and a reload never morphs.
interface Opened {
	id: number;
	shelf: string | null;
	index: number;
	rows: Map<string, number>;
}

const opened = new Map<string, Opened>();
const listKey = (url: URL) => url.pathname + url.search;
const shelfKey = (el: Element) => el.closest('[data-shelf]')?.getAttribute('data-shelf') ?? null;

function remember(url: URL, id: number, cover: HTMLElement) {
	const shelf = cover.closest('[data-shelf]');
	const rows = new Map<string, number>();
	for (const row of document.querySelectorAll('[data-shelf-row]')) {
		const key = shelfKey(row);
		if (key !== null) rows.set(key, row.scrollLeft);
	}
	const cards = [...(shelf ?? document).querySelectorAll('[data-card]')];
	opened.set(listKey(url), { id, shelf: shelf ? shelfKey(shelf) : null, index: cards.indexOf(cover.closest('[data-card]')!), rows });
}

function restoreRows(rows: Map<string, number>) {
	for (const row of document.querySelectorAll('[data-shelf-row]')) {
		const left = rows.get(shelfKey(row) ?? '');
		if (left !== undefined) row.scrollLeft = left;
	}
}

// Back lands on exactly the card that was opened, if it still shows the entry and is on screen; without a remembered
// card, on the first copy on screen. Anything else crossfades.
function backCover(id: number, from: Opened | undefined): HTMLElement | null {
	if (from?.id !== id) return [...document.querySelectorAll<HTMLElement>(covers(id))].find(inView) ?? null;
	const scope = from.shelf === null ? document : document.querySelector(`[data-shelf="${from.shelf}"]`);
	const cover = scope?.querySelectorAll('[data-card]')[from.index]?.querySelector<HTMLElement>(covers(id));
	return cover && inView(cover) ? cover : null;
}

// the class lets (app)/+layout.svelte shape every cover morph without knowing its id
function name(el: HTMLElement | null, id: number) {
	el?.style.setProperty('view-transition-name', coverName(id));
	el?.style.setProperty('view-transition-class', 'cover');
}

function unname(el: HTMLElement | null) {
	el?.style.removeProperty('view-transition-name');
	el?.style.removeProperty('view-transition-class');
}

interface Navigation {
	from: { url: URL } | null;
	to: { url: URL } | null;
	type: NavigationType;
	complete: Promise<void>;
}

// Names are set on one element per side, and only while the transition runs: two elements with the same
// view-transition-name abort it, and a stale name would keep a card out of the root crossfade.
export function pageTransition(navigation: Navigation): Promise<void> | void {
	// history back: the page comes back as it was left, so its reveals don't re-run, with or without a transition
	const restoring = navigation.type === 'popstate';
	const release = restoring ? holdReveals() : null;
	const { from, to } = navigation;
	if (reducedMotion() || typeof document.startViewTransition !== 'function' || !from || !to || from.url.pathname === to.url.pathname) {
		if (release) navigation.complete.then(release, release);
		return;
	}

	const found = morphTarget(from.url.pathname, to.url.pathname);
	const before = !found ? null : found.direction === 'forward' ? cardCover(found.id, lastClicked) : document.querySelector<HTMLElement>(covers(found.id));
	// no cover on the old page (an add form, a deep link) means nothing to morph from: plain crossfade
	const target = before ? found : null;
	const forward = target?.direction === 'forward';
	if (forward) remember(from.url, target.id, before!);
	const rested = forward ? atRest(before!) : null;
	if (target) name(before, target.id);
	// and its rows scroll back
	const left = restoring ? opened.get(listKey(to.url)) : undefined;

	return new Promise((resolve) => {
		let after: HTMLElement | null = null;
		const transition = document.startViewTransition(async () => {
			resolve();
			try {
				await navigation.complete;
				if (left) restoreRows(left.rows);
			} finally {
				release?.();
			}
			if (!target) return;
			after = forward ? document.querySelector<HTMLElement>(covers(target.id)) : backCover(target.id, left);
			name(after, target.id);
			// The old page was captured before the new one existed, so its cover is named either way; with nothing to
			// land on it fades out with the page instead of floating over it.
			if (!after) document.documentElement.setAttribute('data-morph', 'fade');
		});
		const clear = () => {
			unname(before);
			unname(after);
			document.documentElement.removeAttribute('data-morph');
			rested?.();
		};
		transition.finished.then(clear, clear);
	});
}
