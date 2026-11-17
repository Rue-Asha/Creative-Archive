import { expect, test, type Locator } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

// the select primitive: a native select inside .field > .control that draws one chevron (an svg beside it)
const primitive = (select: Locator) =>
	select.evaluate((el) => {
		const chevron = el.closest('.field')?.querySelector(':scope > .control > svg');
		return {
			native: el.tagName === 'SELECT',
			appearance: getComputedStyle(el).appearance,
			chevron: chevron?.querySelector('path')?.getAttribute('d') ?? null,
			size: chevron ? `${chevron.getAttribute('width')}x${chevron.getAttribute('height')}` : null
		};
	});

test('Scenario: Form selects match the filter select', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Heard', status: 'done' }] });
	await open(page, '/music/albums');
	const sort = page.getByRole('toolbar', { name: 'Filters' }).getByRole('combobox', { name: 'Sort' });
	const filter = await primitive(sort);

	await open(page, '/add/piece?manual=1');
	const status = page.getByLabel('Status', { exact: true });
	await expect(status).toHaveCount(1);
	const form = await primitive(status);

	expect(filter).toEqual({ native: true, appearance: 'none', chevron: expect.any(String), size: '16x16' });
	expect(form).toEqual(filter);
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
	const artist = await tone(page.getByRole('group', { name: 'Artist', exact: true }));
	const tag = await tone(page.getByRole('list', { name: 'Selected tags' }).getByRole('listitem').filter({ hasText: 'Soul' }));
	expect(artist).toEqual(tag);
});

test('the phone Save pill keeps its label left and its arrow on the right edge', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the pill is full width only on the phone');
	await open(page, '/add/book?manual=1');
	const save = page.getByRole('button', { name: 'Save', exact: true });
	const at = await save.evaluate((el) => {
		const box = el.getBoundingClientRect();
		const text = el.querySelector('.text')!.getBoundingClientRect();
		const circle = el.querySelector('.circle')!.getBoundingClientRect();
		return { left: text.left - box.left, right: box.right - circle.right };
	});
	expect(at.right, 'arrow at the right edge').toBeLessThan(12);
	expect(at.left, 'label at the left').toBeLessThan(40);
});

// Rue, gate 7 re-verify: beside the two-line Authors box the Year field stretched into a tall pill.
test('Scenario: Fields in a row keep their own height', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop');
	await open(page, '/add/book?manual=1');
	const measure = (name: string) =>
		page.getByLabel(name, { exact: true }).evaluate((el) => {
			const label = document.querySelector(`label[for="${el.id}"]`)!.getBoundingClientRect();
			const box = el.getBoundingClientRect();
			return { top: box.top, height: box.height, gap: box.top - label.bottom, labelTop: label.top };
		});
	const [title, authors, year] = [await measure('Title'), await measure('Authors'), await measure('Year')];
	// Year sits beside Authors, so the row is as tall as the Authors box
	expect(Math.abs(year.labelTop - authors.labelTop)).toBeLessThan(1);
	expect(authors.height).toBeGreaterThan(title.height);
	expect(year.height).toBeCloseTo(title.height, 0);
	expect(year.gap).toBeCloseTo(title.gap, 0);
});
