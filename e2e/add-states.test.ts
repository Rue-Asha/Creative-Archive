import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, photo, reset } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const title = (page: Page) => page.getByLabel('Title', { exact: true });
const status = (page: Page) => page.getByLabel('Status', { exact: true });
const save = (page: Page) => page.getByRole('button', { name: 'Save' });
const saved = (page: Page) => page.getByRole('status').filter({ hasText: 'Saved' });

test('Scenario: Media form saves an initial status', async ({ page, request }) => {
	await open(page, '/add/anime?manual=1');
	await title(page).fill('Frieren');
	await status(page).selectOption({ label: 'Watching' });
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(saved(page)).toBeVisible();
	await expect(page.getByRole('main').getByText('Watching').first()).toBeVisible();
	const n = await counts(request);
	expect(n.status_events).toBe(1);
	expect(n['status_events.progress']).toBe(1);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	await expect(page.getByLabel('Status', { exact: true })).toHaveCount(0);
});

test('Scenario: Media form defaults to No status', async ({ page, request }) => {
	await open(page, '/add/album?manual=1');
	await expect(status(page).locator('option:checked')).toHaveText('No status');
	await title(page).fill('Untitled demo');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	expect((await counts(request)).status_events).toBe(0);
	await expect(page.getByRole('main').getByText('No status').first()).toBeVisible();
});

test('Scenario: Status prefill reaches the media form', async ({ page, request }) => {
	await open(page, '/add/book?manual=1&status=want');
	await expect(status(page).locator('option:checked')).toHaveText('Want to read');
	await title(page).fill('Dune');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(page.getByRole('main').getByText('Want to read').first()).toBeVisible();
	expect((await counts(request)).status_events).toBe(1);
});

test('Scenario: Catalogue down leads to the manual form', async ({ page }) => {
	await open(page, '/add/book');
	await page.getByRole('searchbox').fill('error');
	const message = page.getByText('Search is unavailable right now');
	await expect(message).toBeVisible();
	await expect(page.getByLabel('Title', { exact: true })).toHaveCount(0);
	await page.getByRole('link', { name: 'Add manually' }).click();

	await expect(title(page)).toHaveValue('error');
	await page.goto('/add/book');
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('searchbox').fill('timeout');
	await expect(message).toBeVisible();
	await page.getByRole('link', { name: 'Add manually' }).click();
	await expect(title(page)).toHaveValue('timeout');
});

test('Scenario: HEIC photo is rejected in the add form', async ({ page, request }) => {
	await open(page, '/add/look?manual=1');
	await title(page).fill('Fit check');
	// the browser labels the file image/heif, so the server's decode is what refuses it
	await page.getByLabel('Photo file').setInputFiles(photo('../heic/sample.heic'));
	await save(page).click();

	await expect(page.getByRole('alert').filter({ hasText: 'Unsupported image type' })).toBeVisible();
	await expect(page).toHaveURL(/\/add\/look/);
	const after = await counts(request);
	expect(after.images).toBe(0);
	expect(after.entries).toBe(0);
});

test('Scenario: Duplicate title and long title are allowed', async ({ page, request }) => {
	const long = `Long ${'wanderings through the archive '.repeat(6)}`.trim().slice(0, 180);
	expect(long).toHaveLength(180);
	await page.setViewportSize({ width: 390, height: 844 });
	for (let i = 0; i < 2; i++) {
		await open(page, '/add/book?manual=1');
		await title(page).fill(long);
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow).toBeLessThanOrEqual(0);
		await save(page).click();
		await expect(page).toHaveURL(/\/entries\/\d+$/);
		await expect(page.getByRole('heading', { level: 1, name: long })).toBeVisible();
	}
	expect((await counts(request)).entries).toBe(2);
});
