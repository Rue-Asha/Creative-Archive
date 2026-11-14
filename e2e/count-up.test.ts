import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, shelf } from './helpers.ts';

type Samples = { __countUpSamples: string[] };

const count = (page: Page) => shelf(page, 'In progress').getByText(/^\d+$/);

// every distinct text the count shows, frame by frame, from before the app loads: the first bare number inside the shelf
async function sample(page: Page) {
	await page.addInitScript(() => {
		const w = window as unknown as Samples;
		w.__countUpSamples = [];
		const poll = () => {
			const region = document.querySelector('[aria-label="In progress"]');
			const text = [...(region?.querySelectorAll('*') ?? [])].find((el) => el.children.length === 0 && /^\d+$/.test(el.textContent?.trim() ?? ''))?.textContent?.trim();
			if (text !== undefined && w.__countUpSamples.at(-1) !== text) w.__countUpSamples.push(text);
			requestAnimationFrame(poll);
		};
		poll();
	});
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
	await count(page).scrollIntoViewIfNeeded();

	await expect(count(page)).toHaveText('12');
	// the sampler's frame callback can run before the count's in the frame that writes 12, so it records it a frame later
	await expect.poll(async () => (await samples(page)).at(-1)).toBe(12);
	expect((await samples(page)).some((n) => n < 12)).toBe(true);
});

test('Scenario: Reduced motion shows final counts immediately', async ({ page, request }) => {
	await calm(page);
	await sample(page);
	await twelveInProgress(request);
	await open(page, '/');
	await count(page).scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);

	await expect(count(page)).toHaveText('12');
	expect(await samples(page)).toEqual([12]);
});
