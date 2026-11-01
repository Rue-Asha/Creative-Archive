import { expect, test, type Page } from '@playwright/test';
import { calm, open, photo, reset } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const urlField = (page: Page) => page.getByLabel('Page URL');
const previewImage = (page: Page) => page.getByRole('img', { name: 'Page preview' });
const name = (page: Page) => page.getByLabel('Name', { exact: true });

async function paste(page: Page, path: string, url: string) {
	await open(page, path);
	await urlField(page).fill(url);
	await urlField(page).blur();
}

test('Scenario: Paste a brand URL and get its preview image', async ({ page }) => {
	await paste(page, '/add/brand', 'https://brand.example/');

	await expect(previewImage(page)).toBeVisible();
	await expect(name(page)).toHaveValue('Maison Example');
	await expect(page.getByLabel('Description')).toHaveValue('Quiet tailoring & knitwear from a small atelier.');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(page.locator('[data-cover-id] img')).toHaveAttribute('src', /^\/images\/\d+$/);
});

test('Scenario: Piece URL preview fills name and image', async ({ page }) => {
	await paste(page, '/add/piece', 'https://piece.example/coat');

	await expect(name(page)).toHaveValue('Wool Coat');
	await expect(previewImage(page)).toBeVisible();
});

test('Scenario: Icon is used when there is no og:image', async ({ page }) => {
	await paste(page, '/add/site', 'https://favicon.example/');

	await expect(previewImage(page)).toBeVisible();
	await expect(page.getByText('No preview found')).toHaveCount(0);
});

test('Scenario: Blocked site keeps the form usable', async ({ page }) => {
	await paste(page, '/add/brand', 'https://blocked.example/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await expect(urlField(page)).toHaveValue('https://blocked.example/');
	await name(page).fill('Blocked Label');
	await page.locator('input[type=file]').setInputFiles(photo('fashion-look.jpg'));
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(page.locator('[data-cover-id] img')).toHaveAttribute('src', /^\/images\/\d+$/);
});

test('Scenario: JS-only shell shows No preview found', async ({ page }) => {
	await paste(page, '/add/site', 'https://shell.example/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await expect(name(page)).toBeEditable();
});

test('Scenario: Login wall shows No preview found', async ({ page }) => {
	await paste(page, '/add/influencer', 'https://www.instagram.com/someone/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await name(page).fill('Someone');
	await page.locator('input[type=file]').setInputFiles(photo('fashion-look.jpg'));
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(page.locator('[data-cover-id] img')).toHaveAttribute('src', /^\/images\/\d+$/);
});

test('Scenario: Existing name is not overwritten by the preview', async ({ page }) => {
	await open(page, '/add/brand');
	await name(page).fill('My Label');
	await urlField(page).fill('https://brand.example/');
	await urlField(page).blur();

	await expect(previewImage(page)).toBeVisible();
	await expect(name(page)).toHaveValue('My Label');
});

test('Scenario: Invalid URL shows an inline error', async ({ page }) => {
	let requests = 0;
	page.on('request', (r) => {
		if (r.url().endsWith('/preview')) requests += 1;
	});
	await paste(page, '/add/brand', 'brand dot com');

	await expect(page.getByText('Enter a valid http or https URL')).toBeVisible();
	await expect(urlField(page)).toHaveAttribute('aria-invalid', 'true');
	expect(requests).toBe(0);
});

// The form cannot tell a refused address from a page without a preview; that the address is refused is pinned by the
// unit scenarios "Loopback and private addresses are refused" and "Hostname resolving to a private address is refused".
test('Scenario: Private address URL is refused in the form', async ({ page }) => {
	const answer = page.waitForResponse((r) => r.url().endsWith('/preview'));
	await paste(page, '/add/site', 'http://127.0.0.1/');

	expect(await (await answer).json()).toEqual({ title: null, description: null, image: null });
	await expect(page.getByText('No preview found')).toBeVisible();
	await expect(previewImage(page)).toHaveCount(0);
	await expect(page.getByText('Enter a valid http or https URL')).toHaveCount(0);
	await expect(name(page)).toBeEditable();
	await expect(name(page)).toHaveValue('');
});

test('a preview counts as unsaved input', async ({ page }) => {
	await paste(page, '/add/brand', 'https://brand.example/');
	await expect(previewImage(page)).toBeVisible();

	await page.getByRole('link', { name: 'Cancel' }).click();
	await expect(page.getByRole('alertdialog', { name: 'Discard changes?' })).toBeVisible();
});

test('an image-only preview counts as unsaved input', async ({ page }) => {
	await paste(page, '/add/influencer', 'https://www.tiktok.com/@someone/video/1');
	await expect(previewImage(page)).toBeVisible();
	await expect(name(page)).toHaveValue('');

	await page.getByRole('link', { name: 'Cancel' }).click();
	await expect(page.getByRole('alertdialog', { name: 'Discard changes?' })).toBeVisible();
});

test('Scenario: Pasted preview URL fills an empty URL field', async ({ page }) => {
	await paste(page, '/add/brand', 'https://brand.example/');

	await expect(page.getByLabel('URL', { exact: true })).toHaveValue('https://brand.example/');
});

test('Scenario: A typed URL is not overwritten by the preview URL', async ({ page }) => {
	await open(page, '/add/brand');
	await page.getByLabel('URL', { exact: true }).fill('https://mine.example/');
	await urlField(page).fill('https://brand.example/');
	await urlField(page).blur();

	await expect(previewImage(page)).toBeVisible();
	await expect(page.getByLabel('URL', { exact: true })).toHaveValue('https://mine.example/');
});
