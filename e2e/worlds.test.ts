import { expect, test } from '@playwright/test';
import { calm, expectWorld, open } from './helpers.ts';
import { schemes } from '../src/lib/styles/tokens.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

test.beforeEach(({ page }) => calm(page));

test('Scenario: Domain pages use their world', async ({ page }) => {
	for (const domain of ['music', 'animanga', 'books', 'fashion'] as const) {
		await open(page, `/${domain}`);
		const { scheme } = WORLDS[domain];

		await expectWorld(page, domain);
		expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), domain).toBe(rgb(schemes[scheme].ground));
	}
});

test('Scenario: Home, collections and settings use the home world', async ({ page }) => {
	for (const path of ['/', '/collections', '/settings']) {
		await open(page, path);

		await expectWorld(page, 'home', path);
	}
});

test("a list page uses its domain's world before the list names one", async ({ page }) => {
	await open(page, '/fashion/pieces');

	await expectWorld(page, 'fashion');
});
