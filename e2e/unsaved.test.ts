import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const nav = (page: Page, name: string) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name });
const dialog = (page: Page) => page.getByRole('alertdialog', { name: 'Discard changes?' });

test('Scenario: Leaving a changed form asks first', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Half written');
	await nav(page, 'Music').click();

	await expect(dialog(page)).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Keep editing' }).click();
	await expect(dialog(page)).toHaveCount(0);
	await expect(page).toHaveURL(/\/add\/book/);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Half written');
});

test('Scenario: Discarding leaves the form', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Half written');
	await nav(page, 'Music').click();
	await dialog(page).getByRole('button', { name: 'Discard' }).click();

	await expect(page).toHaveURL(/\/music$/);
});

test('Scenario: Leaving an untouched form does not ask', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${entries[0]}/edit`);
	await nav(page, 'Home').click();

	await expect(page).toHaveURL(/\/$/);
	await expect(dialog(page)).toHaveCount(0);
});

test('Scenario: Changed edit form asks before leaving', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${entries[0]}/edit`);
	await page.getByLabel('Note').fill('on repeat');
	await nav(page, 'Collections').click();

	await expect(dialog(page)).toBeVisible();
});

test('Scenario: Saving does not ask', async ({ page }) => {
	const dialogs: string[] = [];
	page.on('dialog', (d) => {
		dialogs.push(d.type());
		void d.dismiss();
	});
	await open(page, '/add/album?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Ctrl');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(dialog(page)).toHaveCount(0);
	await nav(page, 'Home').click();

	await expect(page).toHaveURL(/\/$/);
	await expect(dialog(page)).toHaveCount(0);
	expect(dialogs).toEqual([]);
});

test('Scenario: Reload of a changed form triggers the native prompt', async ({ page }) => {
	const dialogs: string[] = [];
	page.on('dialog', (d) => {
		dialogs.push(d.type());
		void d.accept();
	});
	await open(page, '/add/look');
	await page.getByLabel('Title', { exact: true }).fill('Fit check');
	await page.reload();

	expect(dialogs).toEqual(['beforeunload']);
});

test('Scenario: Reload of an untouched form does not prompt', async ({ page }) => {
	const dialogs: string[] = [];
	page.on('dialog', (d) => {
		dialogs.push(d.type());
		void d.accept();
	});
	await open(page, '/add/look');
	await page.reload();

	expect(dialogs).toEqual([]);
});

test('Escape in the dialog keeps editing, and typing back to the start is not a change', async ({ page }) => {
	await open(page, '/add/look');
	const title = page.getByLabel('Title', { exact: true });
	await title.fill('x');
	await title.fill('');
	await nav(page, 'Music').click();
	await expect(page).toHaveURL(/\/music$/);

	await open(page, '/add/look');
	await title.fill('Draft');
	await nav(page, 'Music').click();
	await expect(dialog(page)).toBeVisible();
	await page.keyboard.press('Escape');

	await expect(dialog(page)).toHaveCount(0);
	await expect(page).toHaveURL(/\/add\/look/);
});

test('Cancel with changes asks first as well', async ({ page }) => {
	await open(page, '/add/look');
	await page.getByLabel('Title', { exact: true }).fill('Draft');
	await page.getByRole('link', { name: 'Cancel' }).click();

	await expect(dialog(page)).toBeVisible();
});

test('a failed save keeps the guard on', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await page.getByLabel('Note').fill('something');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page.getByText('Title is required')).toBeVisible();
	await nav(page, 'Music').click();

	await expect(dialog(page)).toBeVisible();
});

test('the dialog leaves the accessibility tree while it fades out', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await open(page, '/add/look');
	await page.getByLabel('Title', { exact: true }).fill('Draft');
	await nav(page, 'Music').click();
	await expect(dialog(page)).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Keep editing' }).click();

	await expect(page.getByRole('alertdialog')).toHaveCount(0);
});
