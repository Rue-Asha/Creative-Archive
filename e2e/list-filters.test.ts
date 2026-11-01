import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const bar = (page: Page) => page.getByRole('toolbar', { name: 'Filters' });
const chip = (page: Page, name: string) => bar(page).getByRole('button', { name, exact: true });
const select = (page: Page, name: string) => bar(page).getByRole('combobox', { name, exact: true });
const titles = (page: Page) => page.locator('[data-card] [data-card-title]');

test('Scenario: Filter media by status', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Heard', status: 'done' },
			{ type: 'album', title: 'Wanted', status: 'want' },
			{ type: 'album', title: 'Heard Too', status: 'done' }
		]
	});
	await open(page, '/music/albums');
	await expect(titles(page)).toHaveCount(3);
	await chip(page, 'Listened').click();

	await expect(page).toHaveURL(/status=done/);
	await expect(titles(page)).toHaveText(['Heard Too', 'Heard']);
	await expect(chip(page, 'Listened')).toHaveAttribute('aria-pressed', 'true');
});

test('Scenario: Filter by tag', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'book', title: 'Beach Read', tags: ['Summer'] },
			{ type: 'book', title: 'Winter Tale', tags: ['Winter'] },
			{ type: 'book', title: 'Untagged' }
		]
	});
	await open(page, '/books/books');
	await select(page, 'Tag').selectOption({ label: 'Summer' });

	await expect(page).toHaveURL(/tag=\d+/);
	await expect(titles(page)).toHaveText(['Beach Read']);
});

test('Scenario: Filter by minimum rating', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Five', rating: 5 },
			{ type: 'anime', title: 'Three Half', rating: 3.5 },
			{ type: 'anime', title: 'Four', rating: 4 },
			{ type: 'anime', title: 'Unrated' }
		]
	});
	await open(page, '/animanga/anime');
	await select(page, 'Minimum rating').selectOption({ label: '4+' });

	await expect(page).toHaveURL(/rating=4/);
	await expect(titles(page)).toHaveText(['Four', 'Five']);
});

test('Scenario: Filter shops by kind', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'site', title: 'Corner Shop', kind: 'shop' },
			{ type: 'site', title: 'Web Zine', kind: 'site' },
			{ type: 'brand', title: 'Maison' }
		]
	});
	await open(page, '/fashion/shops');
	await expect(titles(page)).toHaveCount(2);
	await chip(page, 'Site').click();

	await expect(page).toHaveURL(/kind=site/);
	await expect(titles(page)).toHaveText(['Web Zine']);
});

test('Scenario: Filter pieces by status', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'piece', title: 'Coat', status: 'owned' },
			{ type: 'piece', title: 'Scarf', status: 'wishlist' },
			{ type: 'piece', title: 'Boots', status: 'gone' }
		]
	});
	await open(page, '/fashion/pieces');
	await chip(page, 'Wishlist').click();

	await expect(page).toHaveURL(/status=wishlist/);
	await expect(titles(page)).toHaveText(['Scarf']);
});

const sortable = () => ({
	entries: [
		{ type: 'album' as const, title: 'Zeta', rating: 3, createdAt: '2026-01-01T10:00:00.000Z' },
		{ type: 'album' as const, title: 'Ästhetik', createdAt: '2026-01-02T10:00:00.000Z' },
		{ type: 'album' as const, title: 'alpha', rating: 5, createdAt: '2026-01-03T10:00:00.000Z' }
	]
});

test('Scenario: Sort by title and rating in the list', async ({ page, request }) => {
	await seed(request, sortable());
	await open(page, '/music/albums');
	await expect(titles(page)).toHaveText(['alpha', 'Ästhetik', 'Zeta']);

	await select(page, 'Sort').selectOption({ label: 'Title' });
	await expect(page).toHaveURL(/sort=title/);
	await expect(titles(page)).toHaveText(['alpha', 'Ästhetik', 'Zeta']);

	await select(page, 'Sort').selectOption({ label: 'Rating' });
	await expect(page).toHaveURL(/sort=rating/);
	await expect(titles(page)).toHaveText(['alpha', 'Zeta', 'Ästhetik']);
});

test('Scenario: Filter state survives reload and back', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Zeta', status: 'done', rating: 4, createdAt: '2026-01-01T10:00:00.000Z' },
			{ type: 'album', title: 'Beta', status: 'done', rating: 2, createdAt: '2026-01-02T10:00:00.000Z' },
			{ type: 'album', title: 'Alpha', status: 'want', createdAt: '2026-01-03T10:00:00.000Z' }
		]
	});
	await open(page, '/music/albums');
	await chip(page, 'Listened').click();
	await expect(page).toHaveURL(/status=done/);
	await select(page, 'Sort').selectOption({ label: 'Title' });
	await expect(page).toHaveURL(/sort=title/);
	await expect(titles(page)).toHaveText(['Beta', 'Zeta']);

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(chip(page, 'Listened')).toHaveAttribute('aria-pressed', 'true');
	await expect(select(page, 'Sort')).toHaveValue('title');
	await expect(titles(page)).toHaveText(['Beta', 'Zeta']);

	const earlier = page.url();
	await select(page, 'Minimum rating').selectOption({ label: '3+' });
	await expect(page).toHaveURL(/rating=3/);
	await expect(titles(page)).toHaveText(['Zeta']);

	await page.goBack();
	await expect(page).toHaveURL(earlier);
	await expect(titles(page)).toHaveText(['Beta', 'Zeta']);
	await expect(select(page, 'Minimum rating')).toHaveValue('');
	await expect(chip(page, 'Listened')).toHaveAttribute('aria-pressed', 'true');
});

test('Scenario: Filters matching nothing offer reset', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Good', rating: 4 },
			{ type: 'album', title: 'Fine', rating: 3 }
		]
	});
	await open(page, '/music/albums');
	await select(page, 'Minimum rating').selectOption({ label: '5+' });

	await expect(page.getByText('Nothing matches')).toBeVisible();
	await expect(page.locator('[data-card]')).toHaveCount(0);
	await page.getByRole('button', { name: 'Reset filters', exact: true }).click();

	await expect(titles(page)).toHaveCount(2);
	await expect(page.getByText('Nothing matches')).toHaveCount(0);
	expect(new URL(page.url()).search).toBe('');
});
