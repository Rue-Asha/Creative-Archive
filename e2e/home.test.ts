import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test('Scenario: Home shows the hero photo and headline', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { heroes: ['home'] });
	await open(page, '/');

	const src = await page.locator('[data-hero] [data-hero-image]').getAttribute('src');
	expect(src).toMatch(/^\/images\/\d+$/);
	const headline = page.getByRole('heading', { level: 1 });
	await expect(headline).toBeVisible();
	await expect(headline.locator('em')).not.toHaveText('');
	const font = await headline.evaluate((el) => getComputedStyle(el).fontFamily);
	const display = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--font-display').trim());
	expect(font).toBe(display);
	expect(font.split(',')[0].replace(/['"]/g, '')).toBe('Bricolage Grotesque');
});

test('Scenario: Home without hero photo shows the world gradient', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/');

	await expect(page.locator('[data-hero] [data-hero-gradient]')).toHaveCount(1);
	await expect(page.locator('[data-hero] img')).toHaveCount(0);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

const shelf = (page: Page, key: string) => page.locator(`[data-shelf="${key}"]`);
const titles = (page: Page, key: string) => shelf(page, key).locator('[data-card-title]');

test('Scenario: In progress shelf lists media in progress', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } }, updatedAt: '2026-10-01T12:00:00.000Z' },
			{ type: 'book', title: 'Piranesi', status: 'progress', updatedAt: '2026-10-02T12:00:00.000Z' },
			{ type: 'album', title: 'Blonde', status: 'done' }
		]
	});
	await open(page, '/');

	const progress = page.getByRole('region', { name: 'In progress', exact: true });
	await expect(progress).toHaveCount(1);
	await expect(progress.locator('[data-card-title]')).toHaveText(['Piranesi', 'Frieren']);
});

test('Scenario: Recently added shelves per domain', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde' },
			{ type: 'piece', title: 'Wool coat' }
		]
	});
	await open(page, '/');

	await expect(shelf(page, 'recent-music').getByRole('heading', { level: 2 })).toHaveText(/Recently added\s*·?\s*Music/);
	await expect(titles(page, 'recent-music')).toHaveText(['Blonde']);
	await expect(shelf(page, 'recent-fashion').getByRole('heading', { level: 2 })).toHaveText(/Recently added\s*·?\s*Fashion/);
	await expect(titles(page, 'recent-fashion')).toHaveText(['Wool coat']);
	await expect(shelf(page, 'recent-animanga')).toHaveCount(0);
	await expect(shelf(page, 'recent-books')).toHaveCount(0);
});

test('Scenario: Collections bento shows collages', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	const { collections } = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'book', title: 'Piranesi', image: true },
			{ type: 'anime', title: 'Frieren', image: true }
		],
		collections: [
			{ name: 'Winter evenings', entries: [0, 1, 2] },
			{ name: 'Tokyo, someday', entries: [2] }
		]
	});
	await open(page, '/');

	const bento = page.getByRole('region', { name: 'Collections', exact: true });
	const cards = bento.locator('[data-bento-card]');
	await expect(cards).toHaveCount(2);
	await expect(cards.nth(0)).toHaveAttribute('href', `/collections/${collections[1]}`);
	await expect(cards.nth(1)).toHaveAttribute('href', `/collections/${collections[0]}`);
	await expect(cards.nth(0)).toContainText('Tokyo, someday');
	await expect(cards.nth(0)).toContainText('1 entry');
	await expect(cards.nth(1)).toContainText('3 entries');
	await expect(cards.nth(1).getByRole('img', { name: 'Winter evenings collage' }).locator('img')).toHaveCount(3);
});

test('Scenario: Empty archive shows a welcome per domain', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/');

	const welcome = page.locator('[data-welcome]');
	await expect(welcome.getByRole('link', { name: /^Add your first/ })).toHaveCount(4);
	for (const [domain, type] of [['music', 'album'], ['animanga', 'anime'], ['books', 'book'], ['fashion', 'piece']]) {
		await expect(welcome.locator(`[data-welcome-domain="${domain}"] a`)).toHaveAttribute('href', `/add/${type}`);
	}
	await expect(page.locator('[data-shelf]')).toHaveCount(0);
	await expect(page.locator('[data-coverflow]')).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Collections', exact: true })).toHaveCount(0);
});

// Collections list newest first, so they are seeded in reverse to show up in the order the scenarios name them.
const tileBoxes = (page: Page) =>
	page.getByRole('region', { name: 'Collections', exact: true }).locator('[data-bento-card]').evaluateAll((els) =>
		els.map((el) => {
			const box = el.getBoundingClientRect();
			return { name: el.querySelector('h3')!.textContent, width: Math.round(box.width), height: Math.round(box.height) };
		})
	);

test('Scenario: Bento features the first collection with images', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'bento sizes are a desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'book', title: 'Piranesi', image: true }
		],
		collections: [
			{ name: 'Summer', entries: [1] },
			{ name: 'Late Night', entries: [0] },
			{ name: 'Empty one', entries: [] }
		]
	});
	await open(page, '/');

	const tiles = await tileBoxes(page);
	expect(tiles.map((t) => t.name)).toEqual(['Late Night', 'Empty one', 'Summer']);
	const [feature, empty, regular] = tiles;
	expect(empty.width).toBe(regular.width);
	expect(empty.height).toBe(regular.height);
	expect(feature.width).toBeGreaterThan(regular.width * 1.9);
	expect(feature.height).toBeGreaterThan(regular.height * 1.9);
});

test('Scenario: Bento without images features no collection', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'bento sizes are a desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [{ type: 'album', title: 'Plain' }, { type: 'book', title: 'Bare' }],
		collections: [
			{ name: 'One', entries: [0] },
			{ name: 'Two', entries: [1] },
			{ name: 'Three', entries: [] }
		]
	});
	await open(page, '/');

	const tiles = await tileBoxes(page);
	expect(tiles).toHaveLength(3);
	for (const tile of tiles) {
		expect(tile.width).toBe(tiles[0].width);
		expect(tile.height).toBe(tiles[0].height);
	}
});

test('Scenario: Home without collections shows no bento', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, '/');

	await expect(page.locator('[data-shelf]').first()).toBeVisible();
	await expect(page.getByRole('region', { name: 'Collections', exact: true })).toHaveCount(0);
});
