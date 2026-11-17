import { expect, test } from '@playwright/test';
import { calm, cards, open, posture, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Create a collection from the index', async ({ page }) => {
	await open(page, '/collections');
	await page.getByRole('button', { name: 'New collection' }).click();
	await page.getByLabel('Name').fill('Autumn');
	await page.getByRole('button', { name: 'Create' }).click();

	const card = cards(page).filter({ hasText: 'Autumn' });
	await expect(card).toBeVisible();
	await expect(card.getByLabel('0 entries', { exact: true })).toHaveText('0');
	const collage = card.getByRole('img', { name: /collage/i });
	await expect(collage).toBeVisible();
	await expect(collage.getByRole('presentation')).toHaveCount(0);
	await expect(page.getByLabel('Name')).toHaveCount(0);
});

test('Scenario: Index shows collage and count', async ({ page, request }) => {
	await seed(request, {
		entries: [0, 1, 2, 3].map((i) => ({ type: 'album' as const, title: `Album ${i}`, image: true })),
		collections: [{ name: 'Moodboard', entries: [0, 1, 2, 3] }]
	});
	await open(page, '/collections');

	const card = cards(page).filter({ hasText: 'Moodboard' });
	await expect(card.getByRole('presentation')).toHaveCount(3);
	await expect(card.getByLabel('4 entries', { exact: true })).toHaveText('4');
});

test('Scenario: Collection page lists mixed entries in order', async ({ page, request }) => {
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

	const rows = page.getByRole('region', { name: 'In order' }).getByRole('listitem');
	await expect(rows).toHaveCount(3);
	await expect(rows.getByRole('link')).toHaveText(['Blonde', 'Berserk', 'Trench coat']);
	for (const [i, type] of ['Album', 'Manga', 'Piece'].entries()) await expect(rows.nth(i).getByText(type, { exact: true })).toBeVisible();
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
	const rows = page.getByRole('region', { name: 'In order' }).getByRole('listitem');
	await expect(page.getByLabel('2 entries', { exact: true })).toHaveText('2');
	if (posture(page) === 'desktop') await page.getByRole('button', { name: 'Remove Blonde' }).click();
	else {
		await page.getByRole('button', { name: 'Actions for Blonde', exact: true }).click();
		await page.getByRole('menuitem', { name: 'Remove', exact: true }).click();
	}

	await expect(rows).toHaveCount(1);
	await expect(page.getByRole('link', { name: 'Blonde' })).toHaveCount(0);
	await expect(page.getByLabel('1 entry', { exact: true })).toHaveText('1');
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
	await expect(cards(page).filter({ hasText: 'Archive Picks' })).toBeVisible();
	await expect(cards(page).filter({ hasText: 'Moodboard' })).toHaveCount(0);
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
	await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();

	await expect(page.getByRole('alertdialog')).toHaveCount(0);
	await expect(page).toHaveURL(`/collections/${id}`);
	expect((await request.get(`/collections/${id}`)).status()).toBe(200);

	await page.getByRole('button', { name: 'Delete collection' }).click();
	await page.getByRole('alertdialog').getByRole('button', { name: 'Delete' }).click();

	await expect(page).toHaveURL(/\/collections$/);
	await expect(cards(page).filter({ hasText: 'Moodboard' })).toHaveCount(0);
	expect((await request.get(`/collections/${id}`)).status()).toBe(404);
	expect((await request.get(`/entries/${entry}`)).status()).toBe(200);
});

test('collection row thumbnails are round, as in the hi-fi', async ({ page, request }) => {
	const {
		collections: [id]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde', image: true }, { type: 'book', title: 'Piranesi' }],
		collections: [{ name: 'Moodboard', entries: [0, 1] }]
	});
	await open(page, `/collections/${id}`);
	const rows = page.locator('main ol > li');
	for (const thumb of [rows.nth(0).getByRole('presentation'), rows.nth(1).locator('.thumb')])
		expect(await thumb.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('50%');
});
