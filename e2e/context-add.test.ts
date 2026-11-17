import { expect, test, type Page } from '@playwright/test';
import { calm, open, plus, reset, seed } from './helpers.ts';

test.beforeEach(({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the "+" lives in the phone bar');
	return Promise.all([calm(page), reset(request)]);
});

const sheet = (page: Page) => page.getByRole('dialog');

test('Scenario: Plus on Home offers every type grouped by domain', async ({ page }) => {
	await open(page, '/');
	await plus(page).click();

	await expect(sheet(page)).toBeVisible();
	await expect(sheet(page).getByRole('heading', { level: 2, name: 'Add to your archive' })).toBeVisible();
	await expect(sheet(page).getByRole('heading', { level: 3 })).toHaveText(['Music', 'Animanga', 'Books', 'Fashion']);
	await expect(sheet(page).getByRole('link')).toHaveText(['Album', 'Artist', 'Song', 'Anime', 'Manga', 'Book', 'Brand or shop', 'Influencer', 'Magazine', 'Piece', 'Look']);
	await sheet(page).getByRole('link', { name: 'Book', exact: true }).click();

	await expect(page).toHaveURL(/\/add\/book$/);
	await expect(sheet(page)).toBeHidden();
});

test('Scenario: Plus inside a domain offers its types', async ({ page }) => {
	await open(page, '/fashion/magazines');
	await plus(page).click();

	await expect(sheet(page).getByRole('heading', { level: 2, name: 'Add to Fashion' })).toBeVisible();
	await expect(sheet(page).getByRole('link')).toHaveText(['Brand or shop', 'Influencer', 'Magazine', 'Piece', 'Look']);
	await sheet(page).getByRole('link', { name: 'Magazine', exact: true }).click();

	await expect(page).toHaveURL(/\/add\/magazine$/);
});

test('Scenario: Plus on Wardrobe adds an owned piece', async ({ page }) => {
	await open(page, '/fashion/wardrobe');
	await plus(page).click();
	await sheet(page).getByRole('link', { name: 'Piece' }).click();

	await expect(page).toHaveURL(/\/add\/piece\?status=owned$/);
});

test('Scenario: Type sheet closes on Escape, outside tap and back', async ({ page }) => {
	await open(page, '/');
	for (const how of ['Escape', 'outside', 'back'] as const) {
		await plus(page).click();
		await expect(sheet(page)).toBeVisible();
		if (how === 'Escape') await page.keyboard.press('Escape');
		else if (how === 'outside') await page.mouse.click(195, 20);
		else await page.goBack();

		await expect(sheet(page), how).toBeHidden();
		await expect(plus(page), how).toBeFocused();
		expect(new URL(page.url()).pathname, how).toBe('/');
	}
});

test('Scenario: Plus is inert on add and edit forms', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blue' }] });
	for (const path of ['/add/album?manual=1', `/entries/${id}/edit`]) {
		await open(page, path);
		await plus(page).click({ force: true });

		await expect(plus(page), path).toHaveAttribute('aria-disabled', 'true');
		await expect(sheet(page), path).toHaveCount(0);
	}
});
