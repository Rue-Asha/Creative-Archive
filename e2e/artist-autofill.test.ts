import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

async function addByPick(page: Page, path: string, query: string, name: RegExp, mid?: () => Promise<void>) {
	await open(page, path);
	await page.getByRole('searchbox').fill(query);
	await page.getByRole('list', { name: 'Search results' }).getByRole('button', { name }).click();
	await mid?.();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
}

test('Scenario: Autofill creates the artist with status none and photo', async ({ page, request }) => {
	await addByPick(page, '/add/album', 'Blonde', /Blonde/);
	await page.getByRole('link', { name: 'Frank Ocean' }).click();

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Frank Ocean');
	await expect(page.locator('[data-status-label]')).toHaveText('No status');
	await expect(page.getByRole('img', { name: 'Frank Ocean' })).toHaveAttribute('src', /^\/images\/\d+$/);
	expect((await counts(request)).entries).toBe(2);
});

test('Scenario: Autofill links an existing artist', async ({ page, request }) => {
	const {
		entries: [artist]
	} = await seed(request, { entries: [{ type: 'artist', title: 'Frank Ocean', provider: 'deezer', externalId: 'fake-ar-1' }] });
	await addByPick(page, '/add/song', 'Nikes', /Nikes/);

	await expect(page.getByRole('link', { name: 'Frank Ocean' })).toHaveAttribute('href', `/entries/${artist}`);
	expect((await counts(request)).entries).toBe(2);
});

test('Scenario: Unticking Add artist stores the name only', async ({ page, request }) => {
	await addByPick(page, '/add/album', 'Blonde', /Blonde/, async () => {
		await page.getByLabel('Add artist').uncheck();
	});

	await expect(page.getByText('Frank Ocean', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Frank Ocean' })).toHaveCount(0);
	expect((await counts(request)).entries).toBe(1);
});
