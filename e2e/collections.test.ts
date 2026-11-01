import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Create a collection from the index', async ({ page }) => {
	await open(page, '/collections');
	await page.getByRole('button', { name: 'New collection' }).click();
	await page.getByLabel('Name').fill('Autumn');
	await page.getByRole('button', { name: 'Create' }).click();

	const card = page.locator('[data-collection-card]', { hasText: 'Autumn' });
	await expect(card).toBeVisible();
	await expect(card.locator('[data-count]')).toHaveText('0');
	const collage = card.getByRole('img', { name: /collage/i });
	await expect(collage).toBeVisible();
	await expect(collage.locator('span')).toHaveCount(3);
	await expect(collage.locator('img')).toHaveCount(0);
	await expect(page.getByLabel('Name')).toHaveCount(0);
});

test('Scenario: Index shows collage and count', async ({ page, request }) => {
	await seed(request, {
		entries: [0, 1, 2, 3].map((i) => ({ type: 'album' as const, title: `Album ${i}`, image: true })),
		collections: [{ name: 'Moodboard', entries: [0, 1, 2, 3] }]
	});
	await open(page, '/collections');

	const card = page.locator('[data-collection-card]', { hasText: 'Moodboard' });
	await expect(card.locator('img')).toHaveCount(3);
	await expect(card.locator('[data-count]')).toHaveText('4');
});

test('Scenario: Collection page shows mixed cards', async ({ page, request }) => {
	const {
		collections: [id]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde' },
			{ type: 'manga', title: 'Berserk' },
			{ type: 'piece', title: 'Trench coat' }
		],
		collections: [{ name: 'Moodboard', entries: [0, 1, 2] }]
	});
	await open(page, `/collections/${id}`);

	const cards = page.locator('[data-card]');
	await expect(cards).toHaveCount(3);
	await expect(cards.locator('[data-card-title]')).toHaveText(['Blonde', 'Berserk', 'Trench coat']);
	await expect(page.locator('[data-type-chip]')).toHaveText(['Album', 'Manga', 'Piece']);
});

test('Scenario: Remove an entry from a collection', async ({ page, request }) => {
	const {
		entries: [album],
		collections: [id]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde' },
			{ type: 'manga', title: 'Berserk' }
		],
		collections: [{ name: 'Moodboard', entries: [0, 1] }]
	});
	await open(page, `/collections/${id}`);
	await expect(page.locator('[data-count]')).toHaveText('2');
	await page.getByRole('button', { name: 'Remove Blonde' }).click();

	await expect(page.locator('[data-card]')).toHaveCount(1);
	await expect(page.getByRole('link', { name: 'Blonde' })).toHaveCount(0);
	await expect(page.locator('[data-count]')).toHaveText('1');
	expect((await request.get(`/entries/${album}`)).status()).toBe(200);
});

test('Scenario: Rename a collection on its page', async ({ page, request }) => {
	const {
		collections: [id]
	} = await seed(request, { collections: [{ name: 'Moodboard', entries: [] }] });
	await open(page, `/collections/${id}`);
	await page.getByRole('button', { name: 'Rename' }).click();
	await page.getByLabel('Name').fill('Archive Picks');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Archive Picks');
	await open(page, '/collections');
	await expect(page.locator('[data-collection-card]', { hasText: 'Archive Picks' })).toBeVisible();
	await expect(page.locator('[data-collection-card]', { hasText: 'Moodboard' })).toHaveCount(0);
});

test('Scenario: Deleting a collection asks first', async ({ page, request }) => {
	const {
		entries: [entry],
		collections: [id]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [{ name: 'Moodboard', entries: [0] }]
	});
	await open(page, `/collections/${id}`);
	await page.getByRole('button', { name: 'Delete collection' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();

	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(page).toHaveURL(`/collections/${id}`);
	expect((await request.get(`/collections/${id}`)).status()).toBe(200);

	await page.getByRole('button', { name: 'Delete collection' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();

	await expect(page).toHaveURL(/\/collections$/);
	await expect(page.locator('[data-collection-card]', { hasText: 'Moodboard' })).toHaveCount(0);
	expect((await request.get(`/collections/${id}`)).status()).toBe(404);
	expect((await request.get(`/entries/${entry}`)).status()).toBe(200);
});
