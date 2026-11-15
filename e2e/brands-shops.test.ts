import { expect, test } from '@playwright/test';
import { calm, cardTitles, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Retired brands list redirects', async ({ request }) => {
	const res = await request.get('/fashion/brands?tag=3&sort=title', { maxRedirects: 0 });

	expect(res.status()).toBe(308);
	const location = new URL(res.headers().location, 'http://localhost');
	expect(location.pathname + location.search).toBe('/fashion/brands-shops?tag=3&sort=title&kind=brand');
});

test('Scenario: Retired shops list redirects', async ({ request }) => {
	const res = await request.get('/fashion/shops?sort=title', { maxRedirects: 0 });

	expect(res.status()).toBe(308);
	const location = new URL(res.headers().location, 'http://localhost');
	expect(location.pathname + location.search).toBe('/fashion/brands-shops?sort=title');
	expect(location.searchParams.has('kind')).toBe(false);
});

test('the combined list shows brands, shops and sites and a retired link lands on it', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'brand', title: 'Maison', kind: 'brand' },
			{ type: 'site', title: 'Corner Shop', kind: 'shop' },
			{ type: 'site', title: 'Web Zine', kind: 'site' }
		]
	});
	await open(page, '/fashion/shops');

	await expect(page).toHaveURL(/\/fashion\/brands-shops$/);
	await expect(cardTitles(page)).toHaveCount(3);
});

test('Scenario: Both add routes open the combined form', async ({ page }) => {
	const labels = () => page.locator('form label').allInnerTexts();

	await open(page, '/add/brand');
	const first = await labels();
	await expect(page.getByLabel('Page URL')).toBeVisible();
	await expect(page.getByLabel('Kind')).toHaveValue('brand');
	await expect(page.getByLabel('Kind').locator('option:checked')).toHaveText('Brand');

	await open(page, '/add/site');
	const second = await labels();
	await expect(page.getByLabel('Page URL')).toBeVisible();
	await expect(page.getByLabel('Kind')).toHaveValue('shop');
	await expect(page.getByLabel('Kind').locator('option:checked')).toHaveText('Shop');

	expect(first).toEqual(['Name', 'Kind', 'URL', 'Description', 'Tags', 'Note']);
	expect(second).toEqual(first);
});
