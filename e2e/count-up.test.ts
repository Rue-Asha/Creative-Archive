import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

type Samples = { __countUpSamples: string[] };

const count = '[data-shelf="progress"] .count';

// every distinct text the count shows, frame by frame, from before the app loads
async function sample(page: Page) {
	await page.addInitScript((selector) => {
		const w = window as unknown as Samples;
		w.__countUpSamples = [];
		const poll = () => {
			const text = document.querySelector(selector)?.textContent?.trim();
			if (text !== undefined && w.__countUpSamples.at(-1) !== text) w.__countUpSamples.push(text);
			requestAnimationFrame(poll);
		};
		poll();
	}, count);
}

const samples = (page: Page) => page.evaluate(() => (window as unknown as Samples).__countUpSamples.map(Number));

async function twelveInProgress(request: Parameters<typeof reset>[0]) {
	await reset(request);
	await seed(request, {
		entries: Array.from({ length: 12 }, (_, i) => ({ type: 'book' as const, title: `Book ${i + 1}`, status: 'progress' as const }))
	});
}

test('Scenario: Home counts count up on first view', async ({ page, request }) => {
	await sample(page);
	await twelveInProgress(request);
	await open(page, '/');
	await page.locator(count).scrollIntoViewIfNeeded();

	await expect(page.locator(count)).toHaveText('12');
	const seen = await samples(page);
	expect(seen.some((n) => n < 12)).toBe(true);
	expect(seen.at(-1)).toBe(12);
});

test('Scenario: Reduced motion shows final counts immediately', async ({ page, request }) => {
	await calm(page);
	await sample(page);
	await twelveInProgress(request);
	await open(page, '/');
	await page.locator(count).scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);

	await expect(page.locator(count)).toHaveText('12');
	expect(await samples(page)).toEqual([12]);
});
