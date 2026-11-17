import { expect, test } from '@playwright/test';
import { calm, open, progressValue, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Inputs do not zoom on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'zoom on focus is an iOS phone behaviour');
	const {
		entries: [anime],
		collections: [collection]
	} = await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } } }],
		collections: [{ name: 'Moodboard', entries: [0] }]
	});
	const small = async (label: string) => {
		const sizes = await page
			.getByRole('textbox')
			.or(page.getByRole('searchbox'))
			.or(page.getByRole('combobox'))
			.or(page.getByRole('spinbutton'))
			.evaluateAll((els) =>
				els.filter((el) => (el as HTMLElement).offsetParent !== null).map((el) => parseFloat(getComputedStyle(el).fontSize))
			);
		expect(sizes.length, label).toBeGreaterThan(0);
		for (const size of sizes) expect(size, label).toBeGreaterThanOrEqual(16);
	};

	await open(page, '/add/anime?manual=1');
	await small('add form');
	await open(page, '/add/anime');
	await small('add search');
	await open(page, `/entries/${anime}/edit`);
	await small('edit form');
	await open(page, '/animanga/anime');
	await small('filter bar');
	await open(page, '/collections');
	await page.getByRole('button', { name: 'New collection' }).click();
	await expect(page.getByLabel('Name')).toBeVisible();
	await small('collections index form');
	await open(page, `/collections/${collection}`);
	await page.getByRole('button', { name: 'Rename' }).click();
	await expect(page.getByLabel('Name')).toBeVisible();
	await small('collection rename form');
	await open(page, `/entries/${anime}`);
	await page.getByRole('button', { name: 'Add to collection' }).click();
	await page.getByRole('menu', { name: 'Add to collection' }).getByRole('menuitem', { name: 'New collection' }).click();
	await expect(page.getByLabel('Name')).toBeVisible();
	await small('add-to-collection popover');
	await page.keyboard.press('Escape');
	await open(page, `/entries/${anime}`);
	await progressValue(page, 'Episodes').click();
	await expect(page.getByRole('group', { name: 'Episodes', exact: true }).getByRole('textbox')).toBeVisible();
	await small('progress input');
});

