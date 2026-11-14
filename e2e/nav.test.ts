import { expect, test, type Page } from '@playwright/test';
import { calm, expectCurrent, open } from './helpers.ts';

const nav = (page: Page) => page.getByRole('navigation', { name: 'Main' });
const ITEMS = ['Home', 'Music', 'Animanga', 'Books', 'Fashion', 'Collections'];

test.beforeEach(({ page }) => calm(page));

test('Scenario: Desktop shows the top pill nav', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'the top nav is for desktop');
	for (const path of ['/', '/music', '/settings']) {
		await open(page, path);
		const box = (await nav(page).boundingBox())!;
		const width = page.viewportSize()!.width;

		expect(box.y, path).toBeLessThanOrEqual(32);
		// the content column is centred in the viewport
		expect(Math.abs(box.x + box.width / 2 - width / 2), path).toBeLessThanOrEqual(1);
		await expect(nav(page).getByRole('link')).toHaveText(ITEMS);
		await expect(page.getByRole('link', { name: 'Settings' })).toBeVisible();
	}
});

test('Scenario: Phone shows the bottom pill nav', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the bottom nav is for phone');
	const viewport = page.viewportSize()!;
	for (const path of ['/', '/music', '/settings']) {
		await open(page, path);
		const box = (await nav(page).boundingBox())!;

		expect(viewport.height - (box.y + box.height), path).toBeLessThanOrEqual(32);
		await expect(nav(page).getByRole('link')).toHaveText(ITEMS);
		const heights = await nav(page).getByRole('link').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
		for (const h of heights) expect(h, path).toBeGreaterThanOrEqual(44);
		const settings = (await page.getByRole('link', { name: 'Settings' }).boundingBox())!;
		expect(settings.height).toBeGreaterThanOrEqual(44);
	}
});

test('Scenario: Nav marks the current section', async ({ page }) => {
	const current = { '/': 'Home', '/music': 'Music', '/fashion/pieces': 'Fashion', '/collections': 'Collections' };
	for (const [path, label] of Object.entries(current)) {
		await open(page, path);

		await expectCurrent(nav(page), label, path);
	}
});

test('the Settings button is marked on /settings and no section is', async ({ page }) => {
	await open(page, '/settings');

	await expect(page.getByRole('link', { name: 'Settings' })).toHaveAttribute('aria-current', 'page');
	await expectCurrent(nav(page), null);
});

test('Scenario: Content clears the bottom nav on phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the bottom nav is for phone');
	await open(page, '/');
	await page.getByRole('main').evaluate((main) => {
		const tall = document.createElement('div');
		tall.id = 'tall';
		tall.style.height = '3000px';
		main.append(tall);
	});
	await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
	const last = (await page.locator('#tall').boundingBox())!;
	const bar = (await nav(page).boundingBox())!;

	expect(last.y + last.height).toBeLessThanOrEqual(bar.y);
});
