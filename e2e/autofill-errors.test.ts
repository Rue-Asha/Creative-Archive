import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const searchbox = (page: Page) => page.getByRole('searchbox');
const addManually = (page: Page) => page.getByRole('link', { name: 'Add manually' });

async function offersManual(page: Page, path: string, query: string, message: string) {
	await open(page, path);
	await searchbox(page).fill(query);
	await expect(page.getByText(message)).toBeVisible();
	await addManually(page).click();

	await expect(page.getByLabel('Title', { exact: true })).toHaveValue(query);
	await expect(page.getByRole('searchbox')).toHaveCount(0);
}

test('Scenario: Provider error offers Add manually with the query', async ({ page }) => {
	await offersManual(page, '/add/book', 'error', 'Search is unavailable right now');
});

test('Scenario: Provider timeout offers Add manually with the query', async ({ page }) => {
	await offersManual(page, '/add/anime', 'timeout', 'Search is unavailable right now');
});

test('Scenario: No results offers Add manually with the query', async ({ page }) => {
	await offersManual(page, '/add/album', 'zzzz', 'No results');
});
