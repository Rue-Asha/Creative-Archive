import { expect, test, type Page } from '@playwright/test';
import { DOMAIN_LABEL } from '../src/lib/domains.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const title = (page: Page) => page.getByLabel('Title', { exact: true });
const save = (page: Page) => page.getByRole('button', { name: 'Save' });
const saved = (page: Page) => page.getByRole('status').filter({ hasText: 'Saved' });

test('Scenario: Edit changes are saved', async ({ page, request }) => {
	const { entries } = await seed(request, {
		entries: [{ type: 'manga', title: 'Vagabond', progress: { chapters: { current: 3, total: 10 } } }]
	});
	await open(page, `/entries/${entries[0]}/edit`);
	await expect(page.getByLabel('Chapters total')).toHaveValue('10');
	await title(page).fill('Vagabond (Deluxe)');
	await page.getByLabel('Chapters total').fill('327');
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${entries[0]}`);
	await open(page, `/entries/${entries[0]}/edit`);
	await expect(title(page)).toHaveValue('Vagabond (Deluxe)');
	await expect(page.getByLabel('Chapters total')).toHaveValue('327');
});

test('Scenario: Toast confirms save', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${entries[0]}/edit`);
	await page.getByLabel('Note').fill('on repeat');
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${entries[0]}`);
	await expect(saved(page)).toBeVisible();
	await expect(saved(page)).toHaveCount(0, { timeout: 4000 });
});

test('Scenario: Reduced motion toast appears without sliding', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${entries[0]}/edit`);
	await page.getByLabel('Note').fill('on repeat');
	await save(page).click();

	await expect(saved(page)).toBeVisible();
	expect(await saved(page).evaluate((el) => el.getAnimations().length)).toBe(0);
});

test('a new entry shows the toast too', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await title(page).fill('Kitchen Confidential');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(saved(page)).toBeVisible();
});

test('a failed save shows no toast', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await save(page).click();

	await expect(page.getByText('Title is required')).toBeVisible();
	await expect(saved(page)).toHaveCount(0);
});

test('the edit form shows the stored fields of its type', async ({ page, request }) => {
	const { entries } = await seed(request, {
		entries: [
			{ type: 'piece', title: 'Wool Coat', status: 'owned', details: { brand: 'Maison', url: 'https://piece.example/coat', price: '240 EUR' }, note: 'too big' },
			{ type: 'influencer', title: 'Someone', details: { handles: { instagram: 'someone', website: 'https://someone.example' } } },
			{ type: 'book', title: 'Good Omens', details: { authors: ['Terry Pratchett', 'Neil Gaiman'], year: 1990 } },
			{ type: 'site', title: 'Zalando', kind: 'shop' }
		]
	});

	await open(page, `/entries/${entries[0]}/edit`);
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Wool Coat');
	await expect(page.getByLabel('Brand')).toHaveValue('Maison');
	await expect(page.getByLabel('URL')).toHaveValue('https://piece.example/coat');
	await expect(page.getByLabel('Price')).toHaveValue('240 EUR');
	await expect(page.getByLabel('Status')).toHaveValue('owned');
	await expect(page.getByLabel('Note')).toHaveValue('too big');

	await open(page, `/entries/${entries[1]}/edit`);
	await expect(page.getByLabel('Instagram')).toHaveValue('someone');
	await expect(page.getByLabel('TikTok')).toHaveValue('');
	await expect(page.getByLabel('Website')).toHaveValue('https://someone.example');

	await open(page, `/entries/${entries[2]}/edit`);
	await expect(page.getByLabel('Authors')).toHaveValue('Terry Pratchett\nNeil Gaiman');
	await expect(page.getByLabel('Year')).toHaveValue('1990');

	await open(page, `/entries/${entries[3]}/edit`);
	await expect(page.getByLabel('Kind')).toHaveValue('shop');
});

test('changing the kind of a brand moves it to the shops side', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'brand', title: 'Zalando', kind: 'brand' }] });
	await open(page, `/entries/${entries[0]}/edit`);
	await page.getByLabel('Kind').selectOption('shop');
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${entries[0]}`);
	await open(page, `/entries/${entries[0]}/edit`);
	await expect(page.getByLabel('Kind')).toHaveValue('shop');
});

test('an unknown entry answers 404', async ({ page }) => {
	const res = await page.goto('/entries/999999/edit');

	expect(res?.status()).toBe(404);
});

test('edit pages mark their domain in the nav and the world', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'manga', title: 'Vagabond' }, { type: 'book', title: 'Kitchen' }] });
	const nav = page.getByRole('navigation', { name: 'Main' });

	for (const [id, domain] of [[entries[0], 'animanga'], [entries[1], 'books']] as const) {
		await open(page, `/entries/${id}/edit`);
		await expect(nav.locator('[aria-current="page"]')).toHaveText(DOMAIN_LABEL[domain]);
		await expect(page.locator('[data-world]')).toHaveAttribute('data-accent', WORLDS[domain].accent);
	}
});
