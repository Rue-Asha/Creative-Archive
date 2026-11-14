import { expect, test, type Locator, type Page } from '@playwright/test';
import { cardOf, cards, countSaves, open, reset, seed, shelf, type SeedEntry } from './helpers.ts';

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Item {
	target: boolean;
	opacity: number;
	transform: string;
}

interface Capture {
	names: string[];
	shelf: string | null;
	index: number;
	box: Box | null;
	rows: Record<string, number>;
	items: Item[];
}

interface Pseudo {
	pseudo: string;
	duration: number;
	shadow: string;
	radius: string;
}

declare global {
	interface Window {
		__backMorph: { calls: number; captured: Capture[]; pseudos: Pseudo[][]; settled: (Box | null)[] };
	}
}

// Wraps startViewTransition: once the update callback is done (the new page is about to be captured) it records the
// cover- names, where the named card sits, every shelf row's scrollLeft and the reveal state of the list items in
// view; once the transition is ready it lists every pseudo-element animation with its group's shadow and radius; after
// the transition has finished it measures the named element again.
async function watchBack(page: Page) {
	await page.addInitScript(() => {
		window.__backMorph = { calls: 0, captured: [], pseudos: [], settled: [] };
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		const box = (el: Element): Box => {
			const r = el.getBoundingClientRect();
			return { x: r.x, y: r.y, width: r.width, height: r.height };
		};
		const inView = (el: Element) => {
			const r = el.getBoundingClientRect();
			return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
		};
		document.startViewTransition = (callback?: ViewTransitionUpdateCallback) => {
			window.__backMorph.calls++;
			let named: Element | undefined;
			const transition = start(async () => {
				await callback?.();
				const all = [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName.startsWith('cover-'));
				named = all[0];
				const card = named?.closest('article') ?? null;
				const shelf = named?.closest('section[aria-label]') ?? null;
				const rows = [...document.querySelectorAll('section[aria-label]')].map((section) => [section.getAttribute('aria-label') ?? '', section.querySelector('ul')?.scrollLeft ?? 0]);
				const items = [...document.querySelectorAll('li')]
					.filter((li) => li.querySelector('article') && (inView(li) || (card !== null && li.contains(card))))
					.map((li) => ({
						target: card !== null && li.contains(card),
						opacity: Number(getComputedStyle(li).opacity),
						transform: getComputedStyle(li).transform
					}));
				window.__backMorph.captured.push({
					names: all.map((el) => getComputedStyle(el).viewTransitionName),
					shelf: shelf?.getAttribute('aria-label') ?? null,
					index: card ? [...(shelf ?? document).querySelectorAll('article')].indexOf(card) : -1,
					box: named ? box(named) : null,
					rows: Object.fromEntries(rows),
					items
				});
			});
			void transition.ready.then(() => {
				const pseudos = document.getAnimations().flatMap((a) => {
					const pseudo = (a.effect as KeyframeEffect | null)?.pseudoElement ?? '';
					if (!pseudo.startsWith('::view-transition-')) return [];
					const group = getComputedStyle(document.documentElement, `::view-transition-group(${pseudo.slice(pseudo.indexOf('(') + 1, -1)})`);
					return [{ pseudo, duration: Number(a.effect!.getComputedTiming().duration), shadow: group.boxShadow, radius: group.borderRadius }];
				});
				window.__backMorph.pseudos.push(pseudos);
			});
			void transition.finished.then(() => window.__backMorph.settled.push(named ? box(named) : null));
			return transition;
		};
	});
}

const watched = (page: Page) => page.evaluate(() => window.__backMorph);

// opens the card's detail page and waits until its forward transition is over, then forgets it
async function openCard(page: Page, card: Locator, title: string) {
	await card.getByRole('link', { name: title }).click();
	await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
	await expect.poll(async () => (await watched(page)).settled.length).toBe(1);
	await page.evaluate(() => (window.__backMorph = { calls: 0, captured: [], pseudos: [], settled: [] }));
}

async function back(page: Page, url: string) {
	await page.goBack();
	await expect(page).toHaveURL(url);
	await expect.poll(async () => (await watched(page)).settled.length).toBe(1);
	const seen = await watched(page);
	expect(seen.calls).toBe(1);
	return { captured: seen.captured[0], pseudos: seen.pseudos[0], settled: seen.settled[0] };
}

const day = (n: number) => `2026-10-${String(n).padStart(2, '0')}T12:00:00.000Z`;

test('Scenario: Back morph lands on the clicked card', async ({ page, request }) => {
	await reset(request);
	const entries: SeedEntry[] = [
		{ type: 'manga', title: 'Vagabond', image: true, createdAt: day(1) },
		{ type: 'anime', title: 'Frieren', status: 'progress', image: true, progress: { episodes: { current: 3, total: 28 } }, createdAt: day(2) },
		{ type: 'anime', title: 'Mushishi', image: true, createdAt: day(3) }
	];
	const {
		entries: [, id]
	} = await seed(request, { entries });
	await watchBack(page);
	await open(page, '/');
	const recent = cards(shelf(page, 'Recently added · Animanga'));
	await expect(recent).toHaveCount(3);
	await expect(cardOf(shelf(page, 'In progress'), 'Frieren')).toHaveCount(1);
	const card = recent.nth(1);
	await expect(card).toContainText('Frieren');
	await card.scrollIntoViewIfNeeded();
	await openCard(page, card, 'Frieren');
	const { captured, settled } = await back(page, '/');

	expect(captured.names).toEqual([`cover-${id}`]);
	expect(captured.shelf).toBe('Recently added · Animanga');
	expect(captured.index).toBe(1);
	for (const key of ['x', 'y', 'width', 'height'] as const) expect(Math.abs(captured.box![key] - settled![key])).toBeLessThanOrEqual(1);
});

test('Scenario: Back restores the shelf scroll position', async ({ page, request }) => {
	await reset(request);
	const {
		entries: ids
	} = await seed(request, {
		entries: Array.from({ length: 12 }, (_, i) => ({ type: 'album' as const, title: `Album ${String(i + 1).padStart(2, '0')}`, image: true, createdAt: day(28 - i) }))
	});
	await watchBack(page);
	await open(page, '/music');
	const albums = shelf(page, 'Albums');
	const row = albums.getByRole('list');
	await expect(cards(albums)).toHaveCount(12);
	const eighth = cards(albums).nth(7);
	await expect(eighth).toContainText('Album 08');
	await eighth.scrollIntoViewIfNeeded();
	const left = () => row.evaluate((el) => el.scrollLeft);
	// a phone row snaps after the scroll; wait until it rests
	let last = -1;
	await expect.poll(async () => {
		const now = await left();
		const still = now === last;
		last = now;
		return still;
	}).toBe(true);
	const before = await left();
	expect(before).toBeGreaterThan(0);
	await openCard(page, eighth, 'Album 08');
	const { captured } = await back(page, '/music');

	expect(Math.abs(captured.rows['Albums'] - before)).toBeLessThanOrEqual(2);
	expect(captured.names).toEqual([`cover-${ids[7]}`]);
	expect(captured.shelf).toBe('Albums');
	expect(captured.index).toBe(7);
});

test('Scenario: Back shows in-view cards without re-running the reveal', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		entries: Array.from({ length: 18 }, (_, i) => ({ type: 'album' as const, title: `Album ${String(i + 1).padStart(2, '0')}`, createdAt: day(28 - i) }))
	});
	await watchBack(page);
	await open(page, '/music/albums');
	const card = cardOf(page, 'Album 07');
	await card.scrollIntoViewIfNeeded();
	const cell = page.getByRole('listitem').filter({ has: card });
	await expect.poll(() => cell.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
	await openCard(page, card, 'Album 07');
	const { captured } = await back(page, '/music/albums');

	expect(captured.names).toHaveLength(1);
	expect(captured.items.filter((i) => i.target)).toHaveLength(1);
	expect(captured.items.length).toBeGreaterThan(1);
	for (const item of captured.items) expect(item).toMatchObject({ opacity: 1, transform: 'none' });
});

test('Scenario: Back to a card that left its shelf crossfades', async ({ page, request }) => {
	await reset(request);
	const {
		entries: [, id]
	} = await seed(request, {
		entries: [
			{ type: 'anime', title: 'Mushishi', status: 'progress', image: true, progress: { episodes: { current: 2, total: 26 } }, updatedAt: day(1) },
			{ type: 'anime', title: 'Frieren', status: 'progress', image: true, progress: { episodes: { current: 3, total: 28 } }, updatedAt: day(2) }
		]
	});
	const saves = countSaves(page);
	await watchBack(page);
	await open(page, '/animanga');
	const card = cards(shelf(page, 'In progress')).first();
	await expect(card).toContainText('Frieren');
	await openCard(page, card, 'Frieren');
	await page.getByRole('button', { name: 'Status: Watching' }).click();
	await page.getByRole('menu', { name: 'Status' }).getByRole('menuitemradio', { name: 'Watched' }).click();
	await expect(page.getByRole('button', { name: 'Status: Watched', exact: true })).toBeVisible();
	await saves(1);
	const { captured, pseudos } = await back(page, '/animanga');

	expect(captured.names).toEqual([]);
	// the detail cover was named before the list existed; it fades out with the page, nothing lands on a card
	const root = pseudos.find((p) => p.pseudo === '::view-transition-old(root)')!;
	const covers = pseudos.filter((p) => p.pseudo.includes('(cover-'));
	expect(covers.map((p) => p.pseudo)).toEqual([`::view-transition-old(cover-${id})`]);
	for (const cover of covers) expect(cover).toMatchObject({ duration: root.duration, shadow: 'none', radius: '0px' });
	await expect(cards(shelf(page, 'In progress'))).toHaveCount(1);
});
