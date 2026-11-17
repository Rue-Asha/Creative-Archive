import { expect, test } from '@playwright/test';
import { calm, cards, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Index shows descriptions', async ({ page, request }) => {
	const {
		collections: [plain, late]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [
			{ name: 'Plain', entries: [] },
			{ name: 'Late Night', description: 'Albums for after midnight', entries: [0] }
		]
	});
	await open(page, '/collections');

	const lateCard = cards(page).filter({ hasText: 'Late Night' });
	await expect(lateCard.getByText('Albums for after midnight', { exact: true })).toBeVisible();
	await expect(lateCard.getByLabel('1 entry', { exact: true })).toHaveText('1');
	await expect(lateCard.getByRole('link', { name: 'Late Night' })).toHaveAttribute('href', `/collections/${late}`);
	const plainCard = cards(page).filter({ hasText: 'Plain' });
	await expect(plainCard.locator('p')).toHaveCount(1);
	await expect(plainCard.getByLabel('0 entries', { exact: true })).toHaveText('0');
	await expect(plainCard.getByRole('link', { name: 'Plain' })).toHaveAttribute('href', `/collections/${plain}`);
});

test('Scenario: Long description and no images stay inside the card', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'One' },
			{ type: 'album', title: 'Two' }
		],
		collections: [{ name: 'Wordy', description: 'long words '.repeat(55).trim().slice(0, 600), entries: [0, 1] }]
	});
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		await open(page, '/collections');
		const card = cards(page).filter({ hasText: 'Wordy' });
		const description = card.getByText(/^long words/);
		const box = (await card.boundingBox())!;
		const inner = (await description.boundingBox())!;
		expect(inner.x + inner.width).toBeLessThanOrEqual(box.x + box.width);
		expect(await description.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
		const collage = card.getByRole('img', { name: /collage/i });
		await expect(collage.getByRole('presentation')).toHaveCount(0);
		await expect(collage).toContainText('WO');
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
	}
});

test('Scenario: No collections yet', async ({ page }) => {
	await open(page, '/collections');
	await expect(page.getByRole('heading', { name: 'No collections yet' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'New collection' })).toHaveCount(1);

	await page.getByRole('button', { name: 'New collection' }).click();
	await page.getByLabel('Name').fill('Summer');
	await page.getByLabel('Description').fill('Light reads');
	await page.getByRole('button', { name: 'Create' }).click();

	const card = cards(page).filter({ hasText: 'Summer' });
	await expect(card.getByText('Light reads', { exact: true })).toBeVisible();
	await expect(card.getByLabel('0 entries', { exact: true })).toHaveText('0');
	await expect(page.getByRole('heading', { name: 'No collections yet' })).toHaveCount(0);
});
