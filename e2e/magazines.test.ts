import { expect, test } from '@playwright/test';
import { calm, cardTitles, cards, open, reset, shelf } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Create a magazine from the Add menu', async ({ page }) => {
	await open(page, '/fashion');
	await page.getByRole('button', { name: 'Add' }).click();
	await page.getByRole('menu', { name: 'Add to Fashion' }).getByRole('menuitem', { name: 'Magazine' }).click();
	await expect(page).toHaveURL(/\/add\/magazine$/);

	await page.getByLabel('Name', { exact: true }).fill('Vestoj');
	await page.getByLabel('Instagram', { exact: true }).fill('vestoj');
	await page.getByRole('button', { name: 'Save' }).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(page.getByRole('heading', { level: 1, name: 'Vestoj' })).toBeVisible();
	await expect(page.getByRole('term').filter({ hasText: /^Instagram$/ })).toBeVisible();
	await expect(page.getByRole('definition').getByText('vestoj', { exact: true })).toBeVisible();

	await open(page, '/fashion/magazines');
	await expect(cardTitles(page)).toHaveText(['Vestoj']);

	await open(page, '/');
	const recent = shelf(page, 'Recently added · Fashion');
	await expect(recent.getByRole('heading', { level: 2 })).toHaveText(/Recently added\s*·?\s*Fashion/);
	await expect(recent).toContainText('Vestoj');
});

test('Scenario: Magazine form shows the influencer fields', async ({ page }) => {
	await open(page, '/add/magazine?manual=1');

	await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
	for (const label of ['Instagram', 'TikTok', 'YouTube', 'Website']) await expect(page.getByLabel(label, { exact: true }), label).toBeVisible();
	await expect(page.getByLabel('Status', { exact: true })).toHaveCount(0);
	await expect(page.getByLabel(/Episodes|Chapters|Volumes/)).toHaveCount(0);
});

test('Scenario: Empty magazines list offers Add', async ({ page }) => {
	await open(page, '/fashion/magazines');

	await expect(cards(page)).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Add', exact: true })).toHaveAttribute('href', '/add/magazine');
});

test('Scenario: Fashion welcome names magazines', async ({ page }) => {
	await open(page, '/');

	const fashion = page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Fashion', exact: true }) });
	await expect(fashion).toContainText('Brands, shops, magazines, pieces you own and looks you keep.');
	await expect(fashion.getByRole('link')).toHaveAttribute('href', '/add/piece');
});
