import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const transform = (page: Page) => page.locator('[data-hero-image]').evaluate((el) => (el as HTMLElement).style.transform);

async function scrolled(page: Page): Promise<[string, string]> {
	await open(page, '/music');
	const before = await transform(page);
	await page.evaluate(() => window.scrollTo(0, 300));
	await page.waitForFunction(() => scrollY >= 300);
	await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
	return [before, await transform(page)];
}

test.beforeEach(async ({ request }) => {
	await reset(request);
	await seed(request, {
		heroes: ['music'],
		// enough shelves that a phone viewport can scroll 300 px past the hero
		entries: (['album', 'artist', 'song'] as const).map((type) => ({ type, title: `Some ${type}`, status: type === 'artist' ? undefined : ('want' as const) }))
	});
});

test('Scenario: Hero photo moves with scroll', async ({ page }) => {
	const [before, after] = await scrolled(page);

	expect(after).not.toBe(before);
});

test('Scenario: Reduced motion keeps the hero still', async ({ page }) => {
	await calm(page);
	const [before, after] = await scrolled(page);

	expect(after).toBe(before);
});
