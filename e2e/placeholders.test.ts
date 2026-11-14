import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: HeroSlot error uses the error token', async ({ page }) => {
	await open(page, '/settings');
	const slot = page.getByRole('region', { name: 'Books' });
	await slot.getByLabel(/photo file$/).setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });

	const error = slot.getByRole('alert');
	await expect(error).toHaveText('Unsupported image type');
	const colours = await error.evaluate((el) => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--error)';
		el.append(probe);
		const token = getComputedStyle(probe).color;
		probe.remove();
		return { token, error: getComputedStyle(el).color };
	});
	expect(colours.error).toBe(colours.token);
});

test('Scenario: Placeholders have no rim', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'book', title: 'Kitchen Confidential' }] });
	await open(page, '/books/books');

	const radials = await page.getByRole('img', { name: 'Kitchen Confidential' }).evaluate((el) => getComputedStyle(el).backgroundImage.split('radial-gradient').length - 1);
	expect(radials).toBe(0);

	await open(page, '/settings');
	const slot = page.getByRole('region', { name: 'Music' });
	await expect(slot.getByText('No photo yet')).toBeVisible();
	const empty = await slot.evaluate((el) =>
		[el, ...el.querySelectorAll('*')].filter((node) => getComputedStyle(node).backgroundImage.includes('radial-gradient')).length
	);
	expect(empty).toBe(0);
});
