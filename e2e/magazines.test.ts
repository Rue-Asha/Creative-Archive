import { expect, test } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

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
	const handles = page.locator('[data-detail-panel] dl');
	await expect(handles.locator('dt', { hasText: /^Instagram$/ })).toBeVisible();
	await expect(handles.getByText('vestoj', { exact: true })).toBeVisible();

	await open(page, '/fashion/magazines');
	await expect(page.locator('[data-card] [data-card-title]')).toHaveText(['Vestoj']);

	await open(page, '/');
	const shelf = page.locator('[data-shelf="recent-fashion"]');
	await expect(shelf.getByRole('heading', { level: 2 })).toHaveText(/Recently added\s*·?\s*Fashion/);
	await expect(shelf).toContainText('Vestoj');
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

	await expect(page.locator('[data-card]')).toHaveCount(0);
	await expect(page.getByRole('link', { name: 'Add', exact: true })).toHaveAttribute('href', '/add/magazine');
});

test('Scenario: Fashion welcome names magazines', async ({ page }) => {
	await open(page, '/');

	const fashion = page.locator('[data-welcome-domain="fashion"]');
	await expect(fashion).toContainText('Brands, shops, magazines, pieces you own and looks you keep.');
	await expect(fashion.getByRole('link')).toHaveAttribute('href', '/add/piece');
});
