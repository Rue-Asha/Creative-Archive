import { expect, test } from '@playwright/test';
import { calm, cardTitles, cards, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: List shows entries of one type', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Older Album', createdAt: '2026-01-01T10:00:00.000Z' },
			{ type: 'song', title: 'A Song', createdAt: '2026-01-02T10:00:00.000Z' },
			{ type: 'album', title: 'Newer Album', createdAt: '2026-01-03T10:00:00.000Z' }
		]
	});
	await open(page, '/music/albums');

	await expect(cards(page)).toHaveCount(2);
	await expect(cardTitles(page)).toHaveText(['Newer Album', 'Older Album']);
	await expect(page.getByRole('heading', { level: 1, name: 'Albums' })).toBeVisible();
});

test('Scenario: Wardrobe lists owned pieces', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'piece', title: 'Wool Coat', status: 'owned' },
			{ type: 'piece', title: 'Silk Scarf', status: 'wishlist' },
			{ type: 'piece', title: 'Old Boots', status: 'gone' }
		]
	});
	await open(page, '/fashion/wardrobe');

	await expect(cardTitles(page)).toHaveText(['Wool Coat']);
	await expect(page.getByRole('heading', { level: 1, name: 'Wardrobe' })).toBeVisible();
});

test('Scenario: Empty list offers Add', async ({ page }) => {
	await open(page, '/fashion/looks');

	await expect(cards(page)).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Add', exact: true })).toHaveAttribute('href', '/add/look');
});

test('Scenario: Unknown list answers 404', async ({ request }) => {
	const res = await request.get('/music/podcasts');
	expect(res.status()).toBe(404);
	expect((await request.get('/nowhere/albums')).status()).toBe(404);
});
