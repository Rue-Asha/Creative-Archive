import { expect, test, type APIRequestContext, type Locator } from '@playwright/test';
import { calm, cards, open, reset, seed, type SeedEntry } from './helpers.ts';

const spaced = 'An Exceptionally Long Title That Keeps Going Well Past Any Phone Width And Then Some More';
const unbroken = 'Supercalifragilisticexpialidocious-Pneumonoultramicroscopicsilicovolcanoconiosis-Floccinaucinihilipilification';

const albums: SeedEntry[] = Array.from({ length: 10 }, (_, i) => ({
	type: 'album',
	title: i === 0 ? spaced : i === 1 ? unbroken : `Album ${i + 1}`,
	status: i % 2 ? 'done' : 'want',
	rating: 4,
	image: true,
	artist: i < 3 ? 0 : undefined,
	details: { year: 2000 + i }
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
		['Music', '/music'],
		['Animanga', '/animanga'],
		['Books', '/books'],
		['Fashion', '/fashion'],
		['List', '/music/albums'],
		['Detail', `/entries/${ids[1]}`],
		['Artist detail', `/entries/${ids[0]}`],
		['Add', '/add/album'],
		['Edit', `/entries/${ids[1]}/edit`],
		['Collections', '/collections'],
		['Collection', `/collections/${collections[0]}`],
		['Settings', '/settings']
	] as const;

async function left(box: Locator): Promise<number> {
	return Math.round((await box.boundingBox())!.x);
}

// A heading inside a settings slot starts where that slot starts, and the detail panel and its cover form one row
// (the cover is centred on phone, the panel is not), so that row starts at the leftmost of the two. The framed home
// hero is left out: its box has no role or name to find it by. Slots sit side by side on desktop: only the first of a
// row has to reach the column edge.
test('Scenario: Real screens share one alignment rule', async ({ page, request }, info) => {
	await calm(page);
	const { ids, collections } = await setup(request);
	const viewport = page.viewportSize()!.width;
	const edge = info.project.name === 'phone' ? 16 : (viewport - 1200) / 2;

	for (const [name, path] of screens(ids, collections)) {
		await open(page, path);
		const headings = [...(await page.getByRole('heading', { level: 1 }).all()), ...(await page.getByRole('heading', { level: 2 }).all())];
		let measured = 0;
		const cells: number[] = [];
		for (const heading of headings) {
			if (!(await heading.isVisible())) continue;
			const text = ((await heading.textContent()) ?? '').trim();
			if (name === 'Home' && (await heading.evaluate((el) => el.tagName)) === 'H1') continue;
			measured++;
			if (name === 'Settings') {
				const slot = page.getByRole('region', { name: text, exact: true });
				if (await slot.count()) {
					cells.push(await left(slot));
					continue;
				}
			}
			if ((name === 'Detail' || name === 'Artist detail') && (await heading.evaluate((el) => el.tagName)) === 'H1') {
				const panel = page.getByRole('region', { name: text, exact: true });
				if (await panel.count()) {
					const cover = page.getByRole('img', { name: text, exact: true });
					expect(Math.min(await left(panel), await left(cover)), `${name}: "${text}"`).toBe(edge);
					continue;
				}
			}
			expect(await left(heading), `${name}: "${text}"`).toBe(edge);
		}
		expect(measured, `${name} has headings`).toBeGreaterThan(0);
		const columns = await page.evaluate(() =>
			[...document.querySelectorAll('main [data-column]')]
				.map((el) => el.getBoundingClientRect())
				.filter((b) => b.width > 0)
				.map((b) => ({ left: Math.round(b.left), right: Math.round(b.right) }))
		);
		expect(columns.length, `${name} has a column`).toBeGreaterThan(0);
		for (const c of columns) {
			expect(c.right - c.left, `${name}: column width`).toBeLessThanOrEqual(1200);
		}
		for (const c of columns) {
			expect(c.left, `${name}: column left edge`).toBe(edge);
			expect(c.right, `${name}: column right edge`).toBe(viewport - edge);
		}
		if (cells.length) expect(Math.min(...cells), `${name}: first slot`).toBe(edge);
	}
});

test('Scenario: Desktop uses the width', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	await calm(page);
	const { ids } = await setup(request);
	const columns = async (items: Locator) => new Set((await Promise.all((await items.all()).map(async (item) => Math.round((await item.boundingBox())!.x))))).size;

	await open(page, '/music/albums');
	await expect(cards(page).first()).toBeVisible();
	const tops = await Promise.all((await cards(page).all()).map(async (card) => Math.round((await card.boundingBox())!.y)));
	const firstRow = tops.filter((t) => t === tops[0]).length;
	expect(firstRow).toBeGreaterThanOrEqual(4);

	await open(page, `/entries/${ids[1]}`);
	const cover = (await page.getByRole('img', { name: spaced, exact: true }).boundingBox())!;
	const panel = (await page.getByRole('region', { name: spaced, exact: true }).boundingBox())!;
	expect(cover.x + cover.width).toBeLessThanOrEqual(panel.x);
	expect(Math.abs(cover.y - panel.y)).toBeLessThan(cover.height);

	await open(page, '/');
	expect(await columns(page.getByRole('region', { name: 'Collections', exact: true }).getByRole('list').getByRole('link'))).toBeGreaterThanOrEqual(3);

	await open(page, '/collections');
	expect(await columns(cards(page))).toBeGreaterThanOrEqual(3);
});

test('Scenario: No horizontal page scroll on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	await calm(page);
	const { ids, collections } = await setup(request);

	for (const [name, path] of screens(ids, collections)) {
		await open(page, path);
		const widths = await page.evaluate(() => ({
			scroll: document.documentElement.scrollWidth,
			view: innerWidth,
			columns: [...document.querySelectorAll('main [data-column]')].filter((el) => el.getBoundingClientRect().right > innerWidth + 1).length
		}));
		// the app wrapper clips x overflow, so scrollWidth alone cannot see a heading or section that is wider than the phone
		const past: string[] = [];
		const roles = ['region', 'toolbar', 'list', 'article', 'textbox', 'form'] as const;
		const boxes = [
			...[1, 2].map((level) => page.getByRole('heading', { level })),
			...roles.map((role) => page.getByRole(role)),
			page.locator('main [data-column] > *:not([aria-hidden="true"])')
		];
		for (const box of boxes) {
			past.push(
				...(await box.evaluateAll((els) => {
					// shelves scroll sideways and the hero clips its carousel on purpose, so whatever sits in such a box inside main runs past the phone
					const scrolled = (el: Element) => {
						for (let node: Element | null = el.parentElement; node && node.tagName !== 'MAIN'; node = node.parentElement) {
							if (getComputedStyle(node).overflowX !== 'visible' && node.scrollWidth > node.clientWidth) return true;
						}
						return false;
					};
					return els
						.filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && !scrolled(el))
						.map((el) => `${el.tagName} ${el.textContent?.slice(0, 30)}`);
				}))
			);
		}
		expect(widths.scroll, name).toBe(widths.view);
		expect(widths.columns, `${name}: columns wider than the phone`).toBe(0);
		expect(past, `${name}: wider than the phone`).toEqual([]);
	}
});
