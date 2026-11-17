import { expect, test, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { calm, cards, open, reset, seed, type SeedEntry } from './helpers.ts';

const spaced = 'An Exceptionally Long Title That Keeps Going Well Past Any Phone Width And Then Some More';
const unbroken = 'Supercalifragilisticexpialidocious-Pneumonoultramicroscopicsilicovolcanoconiosis-Floccinaucinihilipilification';

const albums: SeedEntry[] = Array.from({ length: 10 }, (_, i) => ({
	type: 'album',
	title: i === 0 ? spaced : i === 1 ? unbroken : `Album ${i + 1}`,
	status: i % 2 ? 'done' : 'want',
	rating: 8,
	image: true,
	artist: i < 3 ? 0 : undefined,
	details: { year: 2000 + i },
	tags: i < 2 ? ['a rather long tag name', 'night', 'slow'] : undefined,
	note: i === 1 ? spaced : undefined
}));

const entries: SeedEntry[] = [
	{ type: 'artist', title: 'Frank Ocean', image: true },
	...albums,
	{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } }, image: true },
	{ type: 'manga', title: unbroken, status: 'progress', progress: { chapters: { current: 10, total: null } }, image: true },
	{ type: 'book', title: spaced, status: 'done', image: true, details: { authors: ['Susanna Clarke'] } },
	{ type: 'brand', title: 'Acne Studios', kind: 'brand', image: true },
	{ type: 'piece', title: 'Wool coat', status: 'owned', image: true },
	{ type: 'look', title: 'Autumn look', image: true },
	{ type: 'influencer', title: 'Some Influencer', image: true }
];

async function setup(request: APIRequestContext) {
	await reset(request);
	const { entries: ids, collections } = await seed(request, {
		entries,
		heroes: ['home', 'music'],
		collections: [
			{ name: 'Winter evenings', description: 'Slow things', entries: [1, 2, 3, 11, 12] },
			{ name: spaced, entries: [4, 13] },
			{ name: unbroken, entries: [12] },
			{ name: 'Fits', entries: [15, 16] }
		]
	});
	return { ids, collections };
}

const screens = (ids: number[], collections: number[]) =>
	[
		['Home', '/'],
		['Domain page', '/music'],
		['List', '/music/albums'],
		['Shelves list', '/animanga/anime?view=shelves'],
		['Entry', `/entries/${ids[1]}`],
		['Anime entry', `/entries/${ids[11]}`],
		['Add', '/add/album'],
		['Edit', `/entries/${ids[1]}/edit`],
		['Collections', '/collections'],
		['Collection', `/collections/${collections[0]}`],
		['Settings', '/settings']
	] as const;

const widths = [320, 375, 390, 768, 1024, 1280, 1920];

test('Scenario: No horizontal page scroll from 320 to 1920', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own widths');
	test.setTimeout(180_000);
	await calm(page);
	const { ids, collections } = await setup(request);

	for (const [name, path] of screens(ids, collections)) {
		await page.setViewportSize({ width: 1280, height: 800 });
		await open(page, path);
		for (const width of widths) {
			await page.setViewportSize({ width, height: 800 });
			const result = await page.evaluate(() => {
				const root = document.documentElement;
				// the frame clips its own overflow, so scrollWidth alone cannot see a box wider than the screen; whatever scrolls
				// on purpose (a shelf row, a dragged list) is the only thing allowed to run past it
				const scrolls = (el: Element) => {
					for (let node = el.parentElement; node && node !== root; node = node.parentElement)
						if (getComputedStyle(node).overflowX !== 'visible' && node.scrollWidth > node.clientWidth) return true;
					return false;
				};
				const past = [...document.querySelectorAll('main *, header *, nav *')]
					.filter((el) => {
						const box = el.getBoundingClientRect();
						return box.width > 0 && box.height > 0 && box.right > innerWidth + 1 && !scrolls(el) && getComputedStyle(el).position !== 'fixed';
					})
					.slice(0, 5)
					.map((el) => `${el.tagName}.${el.className} ${el.textContent?.slice(0, 24)}`);
				return { scroll: root.scrollWidth, client: root.clientWidth, past };
			});
			expect(result.scroll, `${name} at ${width}`).toBeLessThanOrEqual(result.client);
			expect(result.past, `${name} at ${width}: wider than the viewport`).toEqual([]);
		}
	}
});

type Small = { what: string; size: string };

// A control's own box, or the invisible hit area the fingerprint's `.hit` grows to the target size
async function undersized(page: Page, min: number): Promise<Small[]> {
	return page.evaluate((minimum) => {
		const target = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--target')) || 0;
		const controls = document.querySelectorAll(
			'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="menuitem"], [role="checkbox"], [role="spinbutton"]'
		);
		const found: Small[] = [];
		for (const el of controls) {
			if (!(el as HTMLElement).checkVisibility({ visibilityProperty: true })) continue;
			const style = getComputedStyle(el);
			const box = el.getBoundingClientRect();
			if (box.width <= 1 || box.height <= 1 || style.clipPath !== 'none') continue;
			// a link inside running text is exempt (WCAG 2.5.8 inline exception)
			const text = el.parentElement?.textContent?.trim() ?? '';
			if (el.tagName === 'A' && style.display === 'inline' && text.length > (el.textContent?.trim().length ?? 0)) continue;
			const grown = el.classList.contains('hit') ? target : 0;
			// a stretched link spreads its target over its card with an absolutely placed pseudo-element
			const stretch = ['::before', '::after'].map((pseudo) => {
				const p = getComputedStyle(el, pseudo);
				return p.content !== 'none' && p.position === 'absolute' ? { w: parseFloat(p.width) || 0, h: parseFloat(p.height) || 0 } : { w: 0, h: 0 };
			});
			const width = Math.max(box.width, grown, ...stretch.map((x) => x.w));
			const height = Math.max(box.height, grown, ...stretch.map((x) => x.h));
			if (width + 0.5 < minimum || height + 0.5 < minimum)
				found.push({ what: `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30)}"`, size: `${Math.round(width)}x${Math.round(height)}` });
		}
		return found;
	}, min);
}

test('Scenario: Controls meet the target sizes', async ({ page, request }, info) => {
	test.setTimeout(120_000);
	await calm(page);
	const { ids, collections } = await setup(request);
	const phone = info.project.name === 'phone';

	const small: string[] = [];
	for (const [name, path] of screens(ids, collections)) {
		await open(page, path);
		small.push(...(await undersized(page, 24)).map((s) => `${name}: ${s.what} ${s.size}`));
	}
	expect(small, 'under 24 px').toEqual([]);

	if (!phone) return;
	// at 44 px: the navigation pills and the "+", every Move control, every selection toggle, every progress and rating step
	const big = async (label: string, locator: Locator) => {
		const boxes = await locator.evaluateAll((els) =>
			els
				.filter((el) => (el as HTMLElement).checkVisibility({ visibilityProperty: true }))
				.map((el) => {
					const box = el.getBoundingClientRect();
					const stretch = ['::before', '::after'].map((pseudo) => {
						const p = getComputedStyle(el, pseudo);
						return p.content !== 'none' && p.position === 'absolute' ? { w: parseFloat(p.width) || 0, h: parseFloat(p.height) || 0 } : { w: 0, h: 0 };
					});
					return {
						what: (el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 30),
						width: Math.max(box.width, ...stretch.map((x) => x.w)),
						height: Math.max(box.height, ...stretch.map((x) => x.h))
					};
				})
		);
		expect(boxes.length, `${label}: found none`).toBeGreaterThan(0);
		for (const box of boxes) {
			expect(box.width, `${label} "${box.what}" width`).toBeGreaterThanOrEqual(43.5);
			expect(box.height, `${label} "${box.what}" height`).toBeGreaterThanOrEqual(43.5);
		}
	};

	// a text link only has to be as tall as the target; its width is its words
	const tall = async (label: string, locator: Locator) => {
		const heights = await locator.evaluateAll((els) =>
			els.filter((el) => (el as HTMLElement).checkVisibility({ visibilityProperty: true })).map((el) => ({ what: (el.textContent ?? '').trim(), height: el.getBoundingClientRect().height }))
		);
		expect(heights.length, `${label}: found none`).toBeGreaterThan(0);
		for (const h of heights) expect(h.height, `${label} "${h.what}" height`).toBeGreaterThanOrEqual(43.5);
	};

	await open(page, '/music/albums');
	await big('navigation pill', page.getByRole('navigation', { name: 'Main' }).getByRole('link'));
	await big('plus', page.getByRole('button', { name: 'Add', exact: true }));
	await page.locator('main').getByRole('button', { name: 'Select', exact: true }).click();
	await expect(page.getByRole('region', { name: 'Selection', exact: true })).toBeVisible();
	await big('selection toggle', cards(page).getByRole('button'));

	await open(page, `/entries/${ids[11]}`);
	await big('progress step', page.getByRole('group', { name: 'Episodes', exact: true }).getByRole('button', { name: /: one (more|less)$/ }));
	await open(page, `/entries/${ids[1]}`);
	await big('rating step', page.getByRole('button', { name: /^Rating: one (more|less)$/ }));

	await open(page, `/collections/${collections[0]}`);
	await page.getByRole('button', { name: /^Actions for / }).first().click();
	await big('Move control', page.getByRole('menuitem', { name: /^Move / }));

	await open(page, '/music');
	await big('brand mark', page.getByRole('link', { name: 'Creative Archive', exact: true }));
	await tall('sub-type link', page.getByRole('navigation', { name: 'Sub-types' }).getByRole('link'));
	await open(page, '/music/albums');
	await tall('sub-type link', page.getByRole('navigation', { name: 'Sub-types' }).getByRole('link'));
	await open(page, `/entries/${ids[1]}`);
	await tall('breadcrumb link', page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link'));
	await tall('artist link', page.locator('main .lede').getByRole('link'));
	await big('typed rating field', page.getByRole('spinbutton', { name: 'Rating', exact: true }));
	for (const path of [`/entries/${ids[1]}/edit`, '/add/album']) {
		await open(page, path);
		await tall(`${path} breadcrumb link`, page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link'));
	}
});

test('Scenario: Desktop uses its width', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: Array.from({ length: 10 }, (_, i) => ({ type: 'album' as const, title: `Album ${i + 1}`, image: true })),
		collections: Array.from({ length: 6 }, (_, i) => ({ name: `Collection ${i + 1}`, entries: [i] })),
		heroes: ['home']
	});
	const columns = async (items: Locator) => new Set((await Promise.all((await items.all()).map(async (item) => Math.round((await item.boundingBox())!.x))))).size;

	for (const path of ['/music/albums', '/', '/collections']) {
		await open(page, path);
		const frame = (await page.locator('.frame').boundingBox())!;
		expect(frame.width, `${path} column`).toBeLessThanOrEqual(1200);
		expect(Math.abs(frame.x - (1280 - frame.x - frame.width)), `${path} centred`).toBeLessThanOrEqual(1);
	}

	await open(page, '/music/albums');
	await expect(cards(page).first()).toBeVisible();
	const tops = await Promise.all((await cards(page).all()).map(async (card) => Math.round((await card.boundingBox())!.y)));
	expect(tops.filter((top) => top === tops[0]).length).toBeGreaterThanOrEqual(4);

	await open(page, '/collections');
	await expect(page.getByRole('main').getByRole('link').first()).toBeVisible();
	expect(await columns(page.getByRole('main').getByRole('list').getByRole('link'))).toBeGreaterThanOrEqual(3);
});

// Tabs through the page; every stop shows the focus style (an outline at the fingerprint's focus width, or the focus
// halo; its own, or its card's) and no probe point across it is covered
async function walk(page: Page, label: string, within?: string): Promise<string[]> {
	await page.evaluate(() => {
		(document.activeElement as HTMLElement | null)?.blur();
		window.scrollTo(0, 0);
	});
	const seen = new Set<number>();
	const problems: string[] = [];
	for (let step = 0; step < 150; step++) {
		await page.keyboard.press('Tab');
		const stop = await page.evaluate((container) => {
			const el = document.activeElement as HTMLElement | null;
			if (!el || el === document.body) return null;
			const w = window as unknown as { __walk?: WeakMap<Element, number>; __count?: number };
			w.__walk ??= new WeakMap();
			if (!w.__walk.has(el)) w.__walk.set(el, (w.__count = (w.__count ?? 0) + 1));
			const name = `${el.tagName.toLowerCase()} "${(el.getAttribute('aria-label') ?? el.textContent ?? '').trim().slice(0, 28)}"`;
			const probe = document.createElement('span');
			probe.style.cssText = 'position:absolute;outline:var(--focus-width) solid;box-shadow:var(--focus-halo)';
			document.body.append(probe);
			const focusWidth = parseFloat(getComputedStyle(probe).outlineWidth);
			const halo = getComputedStyle(probe).boxShadow;
			probe.remove();
			const drawn = (node: Element) =>
				[undefined, '::before', '::after'].some((pseudo) => {
					const s = getComputedStyle(node, pseudo);
					const ring = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= focusWidth - 0.5 && !/, 0\)$/.test(s.outlineColor) && s.outlineColor !== 'transparent';
					return ring || s.boxShadow === halo;
				});
			let indicator = false;
			for (let node: Element | null = el, i = 0; node && i < 4 && !indicator; node = node.parentElement, i++) indicator = drawn(node);
			const box = el.getBoundingClientRect();
			const clear = (x: number, y: number) => {
				if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) return false;
				const top = document.elementFromPoint(x, y);
				return !!top && (el.contains(top) || top.contains(el) || !!top.closest('label')?.contains(el));
			};
			const visible = {
				x1: Math.max(box.left, 0),
				x2: Math.min(box.right, innerWidth),
				y1: Math.max(box.top, 0),
				y2: Math.min(box.bottom, innerHeight)
			};
			// a clamped title clips its link: only the part its clipping ancestors show has to be uncovered
			for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
				if (getComputedStyle(node).overflow === 'visible') continue;
				const clip = node.getBoundingClientRect();
				visible.x1 = Math.max(visible.x1, clip.left);
				visible.x2 = Math.min(visible.x2, clip.right);
				visible.y1 = Math.max(visible.y1, clip.top);
				visible.y2 = Math.min(visible.y2, clip.bottom);
			}
			const mid = [(visible.x1 + visible.x2) / 2, (visible.y1 + visible.y2) / 2];
			const points = [mid, [visible.x1 + 2, mid[1]], [visible.x2 - 2, mid[1]], [mid[0], visible.y1 + 2], [mid[0], visible.y2 - 2]];
			const exposed = visible.x2 > visible.x1 && visible.y2 > visible.y1 && points.every(([x, y]) => clear(x, y));
			const inside = container ? !!el.closest(container) : true;
			return { id: w.__walk.get(el)!, name, indicator, exposed, inside };
		}, within ?? null);
		if (!stop || seen.has(stop.id)) break;
		seen.add(stop.id);
		if (!stop.indicator) problems.push(`${stop.name}: no focus indicator`);
		if (!stop.exposed) problems.push(`${stop.name}: covered or off screen`);
		if (!stop.inside) problems.push(`${stop.name}: left ${within}`);
	}
	expect(seen.size, `${label}: tab stops`).toBeGreaterThan(2);
	return problems.map((p) => `${label}: ${p}`);
}

test('Scenario: Focus is visible and not obscured', async ({ page, request }) => {
	test.setTimeout(240_000);
	await calm(page);
	const { ids, collections } = await setup(request);
	const problems: string[] = [];

	for (const [name, path] of screens(ids, collections)) {
		await open(page, path);
		problems.push(...(await walk(page, name)));
	}

	await open(page, '/');
	await page.getByRole('button', { name: 'Add', exact: true }).first().click();
	await expect(page.getByRole('dialog')).toBeVisible();
	problems.push(...(await walk(page, 'Add sheet', '[role="dialog"], dialog')));
	// closing pops the sheet's history entry, and a page load that starts before that back lands is aborted by it
	await page.evaluate(() => addEventListener('popstate', () => ((window as { popped?: boolean }).popped = true), { once: true }));
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toBeHidden();
	await expect.poll(() => page.evaluate(() => (window as { popped?: boolean }).popped)).toBe(true);

	await open(page, `/entries/${ids[1]}`);
	await page.getByRole('button', { name: 'Entry menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
	await expect(page.getByRole('alertdialog', { name: /Delete this/ })).toBeVisible();
	problems.push(...(await walk(page, 'Delete dialog', '[role="alertdialog"], dialog')));
	expect(problems).toEqual([]);
});

test('Scenario: Reduced motion removes movement', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'the desktop has the Move buttons');
	await calm(page);
	const { ids, collections } = await setup(request);
	await page.addInitScript(() => {
		const moving = ['transform', 'translate', 'scale', 'rotate'];
		const w = window as unknown as { __moved: string[]; __transitions: number };
		w.__moved = [];
		w.__transitions = 0;
		document.startViewTransition = ((...args: unknown[]) => {
			w.__transitions++;
			void args;
			throw new Error('view transition started');
		}) as typeof document.startViewTransition;
		const look = () => {
			for (const animation of document.getAnimations()) {
				const effect = animation.effect as KeyframeEffect | null;
				const timing = effect?.getComputedTiming();
				if (!effect || !timing || Number(timing.duration) <= 1) continue;
				if (effect.getKeyframes().some((frame) => moving.some((property) => property in frame && frame.offset !== null)))
					w.__moved.push(`${(effect.target as Element | null)?.tagName}.${(effect.target as Element | null)?.className} ${(animation as CSSAnimation).animationName ?? ''}`);
			}
			requestAnimationFrame(look);
		};
		addEventListener('DOMContentLoaded', look);
		addEventListener('transitionrun', (event) => {
			if (moving.includes((event as TransitionEvent).propertyName)) w.__moved.push(`transition ${(event.target as Element).tagName} ${(event as TransitionEvent).propertyName}`);
		});
	});
	const moved = () => page.evaluate(() => (window as unknown as { __moved: string[] }).__moved);

	await open(page, '/');
	await expect(page.getByRole('region', { name: 'In progress', exact: true })).toBeVisible();
	await page.waitForTimeout(600);
	expect(await moved(), 'Home').toEqual([]);

	await open(page, '/music/albums');
	const view = page.getByRole('toolbar', { name: 'Filters' });
	await view.getByRole('button', { name: 'Shelves', exact: true }).click();
	await expect(page).toHaveURL(/view=shelves/);
	await view.getByRole('button', { name: 'Grid', exact: true }).click();
	await page.waitForTimeout(400);
	expect(await moved(), 'view switch').toEqual([]);

	await open(page, `/entries/${ids[1]}`);
	await page.getByRole('button', { name: 'Rating: one less' }).click();
	await page.waitForTimeout(400);
	expect(await moved(), 'rating').toEqual([]);

	await open(page, `/collections/${collections[0]}`);
	const first = page.getByRole('button', { name: /^Move .* down$/ }).first();
	await first.click();
	await page.waitForTimeout(400);
	expect(await moved(), 'collection move').toEqual([]);
	expect(await page.evaluate(() => (window as unknown as { __transitions: number }).__transitions), 'view transitions').toBe(0);
});
