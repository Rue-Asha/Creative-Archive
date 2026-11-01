import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { calm, open, reset, seed, type SeedEntry } from './helpers.ts';

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

// A heading inside a framed hero or a settings slot starts where that box starts; a full-bleed hero sets its heading in
// its own column, so the heading itself is measured. The detail panel and its cover form one row (the cover is centred
// on phone, the panel is not), so that row starts at the leftmost of the two. Slots sit side by side on desktop: only
// the first of a row has to reach the column edge.
function headingEdges(page: Page): Promise<{ text: string; left: number; cell: boolean }[]> {
	return page.evaluate(() => {
		const visible = (el: Element) => {
			const b = el.getBoundingClientRect();
			return b.width > 0 && b.height > 0;
		};
		const left = (el: Element | null) => Math.round(el!.getBoundingClientRect().left);
		return [...document.querySelectorAll('main h1, main h2')].filter(visible).map((h) => {
			const found = h.closest('[data-hero], [data-slot]');
			const box = found?.parentElement?.closest('.column') ? found : null;
			const panel = h.closest('[data-detail-panel]');
			const anchor = panel ? Math.min(left(panel), left(document.querySelector('[data-cover-id]'))) : left(box ?? h);
			return { text: (h.textContent ?? '').trim(), left: anchor, cell: box?.hasAttribute('data-slot') ?? false };
		});
	});
}

test('Scenario: Real screens share one alignment rule', async ({ page, request }, info) => {
	await calm(page);
	const { ids, collections } = await setup(request);
	const edge = info.project.name === 'phone' ? 16 : (1280 - 1200) / 2;

	for (const [name, path] of screens(ids, collections)) {
		await open(page, path);
		const headings = await headingEdges(page);
		expect(headings.length, `${name} has headings`).toBeGreaterThan(0);
		for (const h of headings.filter((h) => !h.cell)) expect(h.left, `${name}: "${h.text}"`).toBe(edge);
		const cells = headings.filter((h) => h.cell).map((h) => h.left);
		if (cells.length) expect(Math.min(...cells), `${name}: first slot`).toBe(edge);
	}
});

test('Scenario: Desktop uses the width', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	await calm(page);
	const { ids } = await setup(request);
	const columns = (selector: string) =>
		page.evaluate((s) => new Set([...document.querySelectorAll(s)].map((el) => Math.round(el.getBoundingClientRect().left))).size, selector);

	await open(page, '/music/albums');
	const firstRow = await page.evaluate(() => {
		const tops = [...document.querySelectorAll('[data-card]')].map((el) => Math.round(el.getBoundingClientRect().top));
		return tops.filter((t) => t === tops[0]).length;
	});
	expect(firstRow).toBeGreaterThanOrEqual(4);

	await open(page, `/entries/${ids[1]}`);
	const cover = (await page.locator('[data-cover-id]').boundingBox())!;
	const panel = (await page.locator('[data-detail-panel]').boundingBox())!;
	expect(cover.x + cover.width).toBeLessThanOrEqual(panel.x);
	expect(Math.abs(cover.y - panel.y)).toBeLessThan(cover.height);

	await open(page, '/');
	expect(await columns('[data-bento-card]')).toBeGreaterThanOrEqual(3);

	await open(page, '/collections');
	expect(await columns('[data-collection-card]')).toBeGreaterThanOrEqual(3);
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
			// the app wrapper clips x overflow, so scrollWidth alone cannot see a column that is wider than the phone
			// (aria-hidden glows are blurred decoration that bleeds on purpose)
			past: [...document.querySelectorAll('main .column, main .column > *:not([aria-hidden="true"])')]
				.filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
				.map((el) => el.className || el.tagName)
		}));
		expect(widths.scroll, name).toBe(widths.view);
		expect(widths.past, `${name}: wider than the phone`).toEqual([]);
	}
});
