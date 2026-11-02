import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const searchbox = (page: Page) => page.getByRole('searchbox');
const results = (page: Page) => page.getByRole('list', { name: 'Search results' });
const title = (page: Page) => page.getByLabel('Title', { exact: true });
const progress = (page: Page, label: string) => page.getByRole('group', { name: label, exact: true });

async function pick(page: Page, path: string, query: string, name: string | RegExp) {
	await open(page, path);
	await searchbox(page).fill(query);
	await results(page).getByRole('button', { name }).click();
}

async function save(page: Page) {
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/\/entries\/\d+(\?coverFailed=1)?$/);
}

test('Scenario: Search shows results with cover, title, creator and year', async ({ page }) => {
	await open(page, '/add/album');
	await searchbox(page).fill('Blonde');

	const row = results(page).getByRole('listitem').first();
	await expect(row.getByText('Blonde', { exact: true })).toBeVisible();
	await expect(row.getByText('Frank Ocean')).toBeVisible();
	await expect(row.getByText('2016')).toBeVisible();
	const cover = row.locator('img');
	await expect(cover).toBeVisible();
	await expect.poll(() => cover.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test('Scenario: Typing is debounced', async ({ page }) => {
	const requests: string[] = [];
	page.on('request', (req) => {
		if (new URL(req.url()).pathname === '/add/album/search') requests.push(new URL(req.url()).searchParams.get('q') ?? '');
	});
	await open(page, '/add/album');
	await searchbox(page).pressSequentially('Blonde', { delay: 50 });
	await expect(results(page).getByRole('listitem')).toHaveCount(1);

	expect(requests).toEqual(['Blonde']);
});

test('Scenario: Existing entry shows Already in your archive', async ({ page, request }) => {
	const { entries } = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde', provider: 'deezer', externalId: 'fake-al-1' }]
	});
	await open(page, '/add/album');
	await searchbox(page).fill('Blonde');

	const link = results(page).getByRole('link', { name: /Already in your archive/ });
	await expect(link).toHaveAttribute('href', `/entries/${entries[0]}`);
	await expect(results(page).getByRole('button')).toHaveCount(0);
});

test('Scenario: Picking a result prefills the form', async ({ page }) => {
	await pick(page, '/add/album', 'Blonde', /Blonde/);

	await expect(title(page)).toHaveValue('Blonde');
	await expect(page.getByLabel('Artist', { exact: true })).toHaveValue('Frank Ocean');
	await expect(page.getByLabel('Year')).toHaveValue('2016');
	await expect(page.getByLabel('Type')).toHaveValue('album');
	await expect(page.getByLabel('Tracks')).toHaveValue('17');
	await expect(page.getByLabel('Add artist')).toBeChecked();
	for (const field of [title(page), page.getByLabel('Artist', { exact: true }), page.getByLabel('Year'), page.getByLabel('Type'), page.getByLabel('Tracks')])
		await expect(field).toBeEditable();
	await expect(page.getByRole('searchbox')).toHaveCount(0);
});

test('Scenario: Saved cover is stored locally', async ({ page, request }) => {
	await pick(page, '/add/album', 'Blonde', /Blonde/);
	await save(page);

	const src = await page.locator('[data-cover-id] img').getAttribute('src');
	expect(src).toMatch(/^\/images\/\d+$/);
	const image = await request.get(src!);
	expect(image.headers()['content-type']).toBe('image/webp');
});

test('Scenario: Anime search prefills episodes', async ({ page }) => {
	await pick(page, '/add/anime', 'Frieren', /Frieren/);
	await save(page);

	await expect(page.getByText('Sousou no Frieren')).toBeVisible();
	await expect(page.getByText('2023', { exact: true })).toBeVisible();
	await expect(progress(page, 'Episodes').getByRole('button', { name: 'Episodes 0 of 28' })).toBeVisible();
	await expect(progress(page, 'Episodes')).toContainText('0 / 28');
});

test('Scenario: Ongoing manga autofill leaves totals empty', async ({ page }) => {
	await pick(page, '/add/manga', 'Vagabond', /Vagabond/);

	await expect(page.getByLabel('Chapters total')).toHaveValue('');
	await expect(page.getByLabel('Volumes total')).toHaveValue('');
	await save(page);

	await expect(progress(page, 'Chapters')).toContainText('/ ?');
	await expect(progress(page, 'Volumes')).toContainText('/ ?');
});

test('Scenario: Original-script author stays editable', async ({ page }) => {
	await pick(page, '/add/book', 'Norwegian', /^Norwegian Wood 村上春樹/);

	const authors = page.getByLabel('Authors');
	await expect(authors).toHaveValue('村上春樹');
	await authors.fill('Haruki Murakami');
	await save(page);

	await expect(page.getByText('Haruki Murakami')).toBeVisible();
	await expect(page.getByText('村上春樹')).toHaveCount(0);
});

test('Scenario: Cover download failure saves without cover', async ({ page, request }) => {
	await pick(page, '/add/book', 'Norwegian', /Vintage/);
	await save(page);
	await expect(page.locator('[data-cover-id] img')).toHaveCount(0);
	expect((await counts(request)).images).toBe(0);

	await pick(page, '/add/book', 'Broken', /Broken/);
	await save(page);

	await expect(page.getByText('Cover could not be downloaded')).toBeVisible();
	await expect(page.locator('[data-cover-id] img')).toHaveCount(0);
	await expect(page.locator('[data-cover-id]').getByRole('img', { name: 'Broken' })).toBeVisible();
	expect((await counts(request)).entries).toBe(2);
	expect((await counts(request)).images).toBe(0);
});
