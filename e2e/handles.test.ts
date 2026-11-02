import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const handle = (page: Page, label: string) => page.getByLabel(label, { exact: true });

async function paste(page: Page, url: string) {
	await page.getByLabel('Page URL').fill(url);
	await page.getByLabel('Page URL').blur();
}

async function expectHandles(page: Page, filled: Record<string, string>) {
	for (const label of ['Instagram', 'TikTok', 'YouTube', 'Website'])
		await expect(handle(page, label)).toHaveValue(filled[label] ?? '');
}

test('Scenario: Pasting an Instagram profile fills the handle', async ({ page }) => {
	await open(page, '/add/influencer');
	await paste(page, 'https://www.instagram.com/someone/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await expectHandles(page, { Instagram: 'someone' });
});

test('Scenario: Pasting another site fills the website field', async ({ page }) => {
	await open(page, '/add/influencer');
	await paste(page, 'https://brand.example/');

	await expect(page.getByRole('img', { name: 'Page preview' })).toBeVisible();
	await expectHandles(page, { Website: 'https://brand.example/' });
});

test('Scenario: Pasting a profile on a magazine fills the handle', async ({ page }) => {
	await open(page, '/add/magazine');
	await paste(page, 'https://www.instagram.com/someone/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await expectHandles(page, { Instagram: 'someone' });
});

test("Scenario: Pasting a magazine's site fills name, image and website", async ({ page }) => {
	await open(page, '/add/magazine');
	await paste(page, 'https://brand.example/');

	await expect(page.getByRole('img', { name: 'Page preview' })).toBeVisible();
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Maison Example');
	await expectHandles(page, { Website: 'https://brand.example/' });
});

test('Scenario: A typed handle is not overwritten', async ({ page }) => {
	await open(page, '/add/influencer');
	await handle(page, 'Instagram').fill('mine');
	await paste(page, 'https://www.instagram.com/someone/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await expectHandles(page, { Instagram: 'mine' });
});

test('Scenario: Pasting a post URL fills no handle', async ({ page }) => {
	await open(page, '/add/influencer');
	await paste(page, 'https://www.instagram.com/p/Cx1/');

	await expect(page.getByText('No preview found')).toBeVisible();
	await expectHandles(page, {});
});
