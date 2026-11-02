import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';
import { accents, schemes } from '../src/lib/styles/tokens.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

const TABS = {
	music: ['Albums', 'Artists', 'Songs'],
	animanga: ['Anime', 'Manga'],
	books: ['Books'],
	fashion: ['Wardrobe', 'Pieces', 'Looks', 'Brands', 'Shops', 'Influencers', 'Magazines']
};

const slugs = { Albums: 'albums', Artists: 'artists', Songs: 'songs', Anime: 'anime', Manga: 'manga', Books: 'books', Brands: 'brands', Shops: 'shops', Influencers: 'influencers', Magazines: 'magazines', Pieces: 'pieces', Wardrobe: 'wardrobe', Looks: 'looks' } as const;

const hero = (page: Page) => page.locator('[data-hero]');

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Domain page shows its hero photo', async ({ page, request }) => {
	await seed(request, { heroes: ['music'] });
	await open(page, '/settings');
	const id = await page.getByRole('region', { name: 'Music' }).locator('img').getAttribute('src');

	await open(page, '/music');

	await expect(hero(page).locator('img')).toHaveAttribute('src', id!);
});

test('Scenario: Domain without hero photo shows the theme gradient', async ({ page }) => {
	await open(page, '/books');

	const gradient = hero(page).locator('[data-hero-gradient]');
	await expect(gradient).toBeVisible();
	await expect(hero(page).locator('img')).toHaveCount(0);
	const { scheme, accent } = WORLDS.books;
	const soft = rgb(accents[accent][scheme]['accent-soft']);
	const surface = rgb(schemes[scheme]['surface-2']);
	const ground = rgb(schemes[scheme].ground);
	expect(await gradient.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
		`linear-gradient(160deg in oklab, ${soft}, ${surface} 55%, ${ground})`
	);
});

test('Scenario: Sub-type tabs per domain', async ({ page }) => {
	for (const [domain, labels] of Object.entries(TABS)) {
		await open(page, `/${domain}`);
		const links = page.getByRole('navigation', { name: 'Sub-types' }).getByRole('link');

		await expect(links, domain).toHaveText(labels);
		for (const [i, label] of labels.entries())
			await expect(links.nth(i), label).toHaveAttribute('href', `/${domain}/${slugs[label as keyof typeof slugs]}`);
	}
});

test("Scenario: Add offers the domain's types", async ({ page }) => {
	await open(page, '/fashion');

	await page.getByRole('button', { name: 'Add' }).click();
	const menu = page.getByRole('menu', { name: 'Add to Fashion' });
	await expect(menu.getByRole('menuitem')).toHaveText(['Brand', 'Shop/Site', 'Influencer', 'Magazine', 'Piece', 'Look']);

	await menu.getByRole('menuitem', { name: 'Magazine' }).click();
	await expect(page).toHaveURL(/\/add\/magazine$/);
});

test('Scenario: Domain shelves show its entries', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'First Record', status: 'want' },
			{ type: 'album', title: 'Second Record', status: 'want' },
			{ type: 'artist', title: 'Some Artist' }
		]
	});
	await open(page, '/music');

	const albums = page.getByRole('region', { name: 'Albums', exact: true });
	await expect(albums).toContainText('First Record');
	await expect(albums).toContainText('Second Record');
	await expect(page.getByRole('region', { name: 'Artists', exact: true })).toContainText('Some Artist');
	await expect(page.getByRole('region', { name: 'Songs', exact: true })).toHaveCount(0);
});

test('Scenario: Unknown domain answers 404', async ({ page }) => {
	const res = await page.goto('/podcasts');

	expect(res?.status()).toBe(404);
});
