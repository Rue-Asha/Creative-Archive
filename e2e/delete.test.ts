import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

const dialog = (page: Page) => page.getByRole('dialog');
const toast = (page: Page) => page.getByRole('status').filter({ hasText: 'Deleted' });

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Delete asks first and returns to the list', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true, tags: ['summer'] }] });
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Delete' }).click();

	await expect(dialog(page)).toBeVisible();
	await expect(dialog(page)).toContainText('Blonde');
	expect((await request.get(`/entries/${id}`)).status()).toBe(200);
	await dialog(page).getByRole('button', { name: 'Delete' }).click();

	await expect(page).toHaveURL(/\/music\/albums$/);
	await expect(toast(page)).toBeVisible();
	expect((await request.get(`/entries/${id}`)).status()).toBe(404);
	const after = await counts(request);
	expect(after.entries).toBe(0);
	expect(after.images).toBe(0);
	expect(after.entry_tags).toBe(0);
});

test('Scenario: Cancelled delete keeps the entry', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Delete' }).click();
	await dialog(page).getByRole('button', { name: 'Cancel' }).click();

	await expect(dialog(page)).toHaveCount(0);
	await expect(page).toHaveURL(`/entries/${id}`);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blonde');
	expect((await request.get(`/entries/${id}`)).status()).toBe(200);
});

test('Scenario: Toast confirms delete', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood' }] });
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Delete' }).click();
	await dialog(page).getByRole('button', { name: 'Delete' }).click();

	await expect(page).toHaveURL(/\/books\/books$/);
	await expect(toast(page)).toBeVisible();
});

test('Escape cancels and hands focus back to the Delete button', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Delete' }).click();
	await expect(dialog(page).getByRole('button', { name: 'Cancel' })).toBeFocused();
	await page.keyboard.press('Escape');

	await expect(dialog(page)).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Delete' })).toBeFocused();
});

test('each type returns to its own list', async ({ page, request }) => {
	const { entries } = await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren' },
			{ type: 'site', title: 'Vinted', kind: 'shop' },
			{ type: 'look', title: 'Autumn layers' }
		]
	});
	const lists = [/\/animanga\/anime$/, /\/fashion\/shops$/, /\/fashion\/looks$/];

	for (const [i, id] of entries.entries()) {
		await open(page, `/entries/${id}`);
		await page.getByRole('button', { name: 'Delete' }).click();
		await dialog(page).getByRole('button', { name: 'Delete' }).click();

		await expect(page).toHaveURL(lists[i]);
	}
});

test('a double click on the confirm button deletes once and lands on the list', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Delete' }).click();
	await dialog(page).getByRole('button', { name: 'Delete' }).dblclick();

	await expect(page).toHaveURL(/\/music\/albums$/);
	await expect(toast(page)).toHaveCount(1);
});

test('deleting an artist keeps the artist name on its albums', async ({ page, request }) => {
	const {
		entries: [artist, album]
	} = await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean' },
			{ type: 'album', title: 'Blonde', artist: 0 }
		]
	});
	await open(page, `/entries/${artist}`);
	await page.getByRole('button', { name: 'Delete' }).click();
	await dialog(page).getByRole('button', { name: 'Delete' }).click();
	await expect(page).toHaveURL(/\/music\/artists$/);
	await open(page, `/entries/${album}`);

	await expect(page.getByText('Frank Ocean', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Frank Ocean' })).toHaveCount(0);
});
