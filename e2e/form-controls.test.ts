import { expect, test, type Locator } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const chevron = (wrapper: Locator) =>
	wrapper.evaluate((el) => {
		const after = getComputedStyle(el, '::after');
		return { content: after.content, image: after.backgroundImage, mask: after.maskImage || after.webkitMaskImage };
	});

test('Scenario: Form selects match the filter select', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Heard', status: 'done' }] });
	await open(page, '/music/albums');
	const sort = page.getByRole('toolbar', { name: 'Filters' }).locator('.select', { has: page.getByRole('combobox', { name: 'Sort' }) });
	const filterSelect = sort.locator('select');
	const filter = { appearance: await filterSelect.evaluate((el) => getComputedStyle(el).appearance), chevron: await chevron(sort) };

	await open(page, '/add/piece?manual=1');
	const status = page.locator('.select', { has: page.getByLabel('Status', { exact: true }) });
	await expect(status).toHaveCount(1);
	const form = { appearance: await status.locator('select').evaluate((el) => getComputedStyle(el).appearance), chevron: await chevron(status) };

	expect(filter.appearance).toBe('none');
	expect(form.appearance).toBe('none');
	expect(filter.chevron.image !== 'none' || filter.chevron.mask !== 'none').toBe(true);
	expect(form.chevron).toEqual(filter.chevron);
});

test('Scenario: Artist and tag tokens share one tone', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'artist', title: 'Solange' }] });
	await open(page, '/add/album?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('A Seat at the Table');
	await page.getByLabel('Artist', { exact: true }).fill('Sol');
	await page.getByRole('option', { name: 'Solange' }).click();
	await page.getByLabel('Add a tag').fill('Soul');
	await page.getByLabel('Add a tag').press('Enter');

	const tone = (el: Locator) =>
		el.evaluate((node) => {
			const s = getComputedStyle(node);
			return { background: s.backgroundColor, color: s.color, radius: s.borderRadius, weight: s.fontWeight };
		});
	const artist = await tone(page.locator('[data-linked]'));
	const tag = await tone(page.getByRole('list', { name: 'Selected tags' }).locator('li.tag'));
	expect(artist).toEqual(tag);
});
