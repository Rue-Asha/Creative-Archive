import { coverName, reducedMotion } from '#lib/motion.ts';

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

const name = (el: HTMLElement | null, id: number) => el?.style.setProperty('view-transition-name', coverName(id));
const unname = (el: HTMLElement | null) => el?.style.removeProperty('view-transition-name');

interface Navigation {
	from: { url: URL } | null;
	to: { url: URL } | null;
	complete: Promise<void>;
}

// Names are set on one element per side, and only while the transition runs: two elements with the same
// view-transition-name abort it, and a stale name would keep a card out of the root crossfade.
export function pageTransition(navigation: Navigation): Promise<void> | void {
	if (reducedMotion() || typeof document.startViewTransition !== 'function') return;
	const { from, to } = navigation;
	if (!from || !to || from.url.pathname === to.url.pathname) return;

	const found = morphTarget(from.url.pathname, to.url.pathname);
	const before = !found ? null : found.direction === 'forward' ? cardCover(found.id, lastClicked) : document.querySelector<HTMLElement>(covers(found.id));
	// no cover on the old page (an add form, a deep link) means nothing to morph from: plain crossfade
	const target = before ? found : null;
	if (target) name(before, target.id);

	return new Promise((resolve) => {
		let after: HTMLElement | null = null;
		const transition = document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
			if (!target) return;
			after = target.direction === 'forward' ? document.querySelector<HTMLElement>(covers(target.id)) : cardCover(target.id, null);
			name(after, target.id);
		});
		const clear = () => {
			unname(before);
			unname(after);
		};
		transition.finished.then(clear, clear);
	});
}
