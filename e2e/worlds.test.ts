import { expect, test } from '@playwright/test';
import { calm, expectWorld, open, reset, seed } from './helpers.ts';

test.beforeEach(({ page }) => calm(page));

test('Scenario: Domain pages use their world', async ({ page }) => {
	for (const domain of ['music', 'animanga', 'books', 'fashion'] as const) {
		await open(page, `/${domain}`);
		await expectWorld(page, domain);
	}
});

test('Scenario: Home, collections and settings name no world', async ({ page }) => {
	for (const path of ['/', '/collections', '/settings']) {
		await open(page, path);

		await expectWorld(page, 'home', path);
	}
});

test('Scenario: Detail pages use their type\'s domain world', async ({ page, request }) => {
	await reset(request);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Dune' }] });
	await open(page, `/entries/${id}`);
	await expect(page.locator('.app')).toHaveAttribute('data-world', 'books');
	await open(page, '/add/piece');

	await expect(page.locator('.app')).toHaveAttribute('data-world', 'fashion');
});

test("a list page uses its domain's world before the list names one", async ({ page }) => {
	await open(page, '/fashion/pieces');

	await expectWorld(page, 'fashion');
});

test('Scenario: A world shows its hero photo in the frame', async ({ page, request }) => {
	await reset(request);
	await seed(request, { heroes: ['music'] });
	await open(page, '/music/albums');
	const photo = page.locator('.app .frame > figure.stage > img.stage-photo');
	const src = await photo.getAttribute('src');

	expect(src).toMatch(/^\/images\/\d+$/);
	await expect(page.locator('.app')).toHaveAttribute('data-photo', src!);
	expect((await page.request.get(src!)).ok()).toBe(true);
});

test('Scenario: A world without a hero photo shows the colour field', async ({ page, request }) => {
	await reset(request);
	const requested: string[] = [];
	page.on('request', (req) => requested.push(new URL(req.url()).pathname));
	for (const path of ['/', '/fashion/pieces']) {
		await open(page, path);

		await expect(page.locator('.app'), path).toHaveAttribute('data-backdrop', 'field');
		await expect(page.locator('.app .stage-photo'), path).toHaveCount(0);
	}
	expect(requested.filter((p) => p.startsWith('/images/') || /\.(jpe?g|webp|avif)$/.test(p))).toEqual([]);
});
