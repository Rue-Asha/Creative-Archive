import { expect, test, type Page } from '@playwright/test';
import { calm, cardTitles, open, reset, seed, shelf } from './helpers.ts';

test('Scenario: Home shows the hero photo and headline', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { heroes: ['home'] });
	await open(page, '/');

	const src = await page.locator('[data-hero-image]').getAttribute('src');
	expect(src).toMatch(/^\/images\/\d+$/);
	const headline = page.getByRole('heading', { level: 1 });
	await expect(headline).toBeVisible();
	await expect(headline.getByText('love', { exact: true })).toBeVisible();
	const font = await headline.evaluate((el) => getComputedStyle(el).fontFamily);
	const display = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--font-display').trim());
	expect(font).toBe(display);
	expect(font.split(',')[0].replace(/['"]/g, '')).toBe('Bricolage Grotesque');
});

test('Scenario: Home without hero photo shows the world gradient', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/');

	await expect(page.locator('[data-hero-gradient]')).toHaveCount(1);
	await expect(page.locator('[data-hero-image]')).toHaveCount(0);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

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
	await expect(cardTitles(progress)).toHaveText(['Piranesi', 'Frieren']);
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

	await expect(shelf(page, 'Recently added · Music').getByRole('heading', { level: 2 })).toHaveText(/Recently added\s*·?\s*Music/);
	await expect(cardTitles(shelf(page, 'Recently added · Music'))).toHaveText(['Blonde']);
	await expect(shelf(page, 'Recently added · Fashion').getByRole('heading', { level: 2 })).toHaveText(/Recently added\s*·?\s*Fashion/);
	await expect(cardTitles(shelf(page, 'Recently added · Fashion'))).toHaveText(['Wool coat']);
	await expect(shelf(page, 'Recently added · Animanga')).toHaveCount(0);
	await expect(shelf(page, 'Recently added · Books')).toHaveCount(0);
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
	const cards = bento.getByRole('list').getByRole('link');
	await expect(cards).toHaveCount(2);
	await expect(cards.nth(0)).toHaveAttribute('href', `/collections/${collections[1]}`);
	await expect(cards.nth(1)).toHaveAttribute('href', `/collections/${collections[0]}`);
	await expect(cards.nth(0)).toContainText('Tokyo, someday');
	await expect(cards.nth(0)).toContainText('1 entry');
	await expect(cards.nth(1)).toContainText('3 entries');
	await expect(cards.nth(1).getByRole('img', { name: 'Winter evenings collage' }).getByRole('presentation')).toHaveCount(3);
});

test('Scenario: Empty archive shows a welcome per domain', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/');

	const welcome = page.getByRole('region', { name: 'Your archive starts here' });
	await expect(welcome.getByRole('link', { name: /^Add your first/ })).toHaveCount(4);
	for (const [domain, type] of [['Music', 'album'], ['Animanga', 'anime'], ['Books', 'book'], ['Fashion', 'piece']]) {
		const item = welcome.getByRole('listitem').filter({ has: page.getByRole('heading', { name: domain, exact: true }) });
		await expect(item.getByRole('link')).toHaveAttribute('href', `/add/${type}`);
	}
	await expect(page.getByRole('region', { name: /^(In progress|Recently added)/ })).toHaveCount(0);
	await expect(page.getByRole('group', { name: 'Latest entries' })).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Collections', exact: true })).toHaveCount(0);
});

// Collections list newest first, so they are seeded in reverse to show up in the order the scenarios name them.
const tileBoxes = async (page: Page) =>
	Promise.all(
		(await page.getByRole('region', { name: 'Collections', exact: true }).getByRole('list').getByRole('link').all()).map(async (tile) => {
			const box = (await tile.boundingBox())!;
			return { name: await tile.getByRole('heading', { level: 3 }).textContent(), width: Math.round(box.width), height: Math.round(box.height) };
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

	await expect(shelf(page, 'Recently added · Music')).toBeVisible();
	await expect(page.getByRole('region', { name: 'Collections', exact: true })).toHaveCount(0);
});
