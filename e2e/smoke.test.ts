import { expect, test } from '@playwright/test';

test('home page hydrates', async ({ page }) => {
	await page.goto('/');

	await expect(page.locator('html[data-hydrated]')).toBeAttached();
});
