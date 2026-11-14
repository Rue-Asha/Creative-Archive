import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const save = (page: Page) => page.getByRole('button', { name: 'Save' });
const artist = (page: Page) => page.getByLabel('Artist', { exact: true });
const linked = (page: Page) => page.getByRole('group', { name: 'Artist', exact: true });

test('Scenario: Manual entry picks an existing artist', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'artist', title: 'Solange' }] });
	await open(page, '/add/album?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('A Seat at the Table');
	await artist(page).fill('Sol');
	await page.getByRole('option', { name: 'Solange' }).click();
	await expect(linked(page)).toHaveText(/Solange/);
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	await expect(linked(page)).toHaveText(/Solange/);
});

test('Scenario: Manual entry types an artist as text only', async ({ page, request }) => {
	await open(page, '/add/song?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Untitled');
	await artist(page).fill('Unknown Band');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	await expect(artist(page)).toHaveValue('Unknown Band');
	await expect(linked(page)).toHaveCount(0);
	expect((await counts(request)).entries).toBe(1);
});

test('typing the exact name of an artist without choosing it stays text', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'artist', title: 'Solange' }] });
	await open(page, '/add/album?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('A Seat at the Table');
	await artist(page).fill('Solange');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	await expect(linked(page)).toHaveCount(0);
	await expect(artist(page)).toHaveValue('Solange');
});

test('arrow keys and Enter choose a suggestion, and the chip can be removed to type again', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'artist', title: 'Solange' }, { type: 'artist', title: 'Solar Wind' }] });
	await open(page, '/add/album?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('A Seat at the Table');
	await artist(page).fill('sol');
	await artist(page).press('ArrowDown');
	await artist(page).press('ArrowDown');
	await artist(page).press('Enter');

	await expect(linked(page)).toHaveText(/Solar Wind/);
	await expect(page).toHaveURL(/\/add\/album/);
	await page.getByRole('button', { name: 'Unlink artist' }).click();
	await expect(linked(page)).toHaveCount(0);
	await expect(artist(page)).toHaveValue('Solar Wind');
});

test('an album linked to an artist opens with the chip, and changing it saves the new link', async ({ page, request }) => {
	const { entries } = await seed(request, {
		entries: [{ type: 'artist', title: 'Solange' }, { type: 'artist', title: 'SZA' }, { type: 'album', title: 'Ctrl', artist: 1 }]
	});
	await open(page, `/entries/${entries[2]}/edit`);
	await expect(linked(page)).toHaveText(/SZA/);
	await page.getByRole('button', { name: 'Unlink artist' }).click();
	await artist(page).fill('Sol');
	await page.getByRole('option', { name: 'Solange' }).click();
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${entries[2]}`);
	await open(page, `/entries/${entries[2]}/edit`);
	await expect(linked(page)).toHaveText(/Solange/);
});

test('only albums and songs have an artist field', async ({ page }) => {
	for (const type of ['anime', 'book', 'artist', 'piece']) {
		await open(page, `/add/${type}?manual=1`);
		await expect(artist(page), type).toHaveCount(0);
	}
	await open(page, '/add/song?manual=1');
	await expect(artist(page)).toBeVisible();
});
