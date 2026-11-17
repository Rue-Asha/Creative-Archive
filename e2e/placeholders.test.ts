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
		probe.style.color = 'var(--danger)';
		el.append(probe);
		const token = getComputedStyle(probe).color;
		probe.remove();
		return { token, error: getComputedStyle(el).color };
	});
	expect(colours.error).toBe(colours.token);
});

test('Scenario: Placeholder plate shows the entry year', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', details: { year: 2023 } },
			{ type: 'book', title: 'Kitchen Confidential' }
		]
	});
	await open(page, '/animanga/anime');
	await expect(page.getByRole('img', { name: 'Frieren' })).toContainText('2023');
	await open(page, '/books/books');
	await expect(page.getByRole('img', { name: 'Kitchen Confidential' })).toHaveText('KC');
});
