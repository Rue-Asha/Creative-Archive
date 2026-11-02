import { expect, test, type Locator } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const rim = (placeholder: Locator) =>
	placeholder.evaluate((el) => {
		const tint = el.querySelector('[data-tint]');
		const mask = tint ? getComputedStyle(tint).maskImage : '';
		return {
			hasTint: tint !== null,
			stops: (mask.match(/rgba?\(/g) ?? []).length,
			radials: [el, tint].flatMap((node) => (node ? [getComputedStyle(node).backgroundImage] : [])).filter((image) => image.includes('radial-gradient')).length
		};
	});

test('Scenario: Placeholders have no rim', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'book', title: 'Kitchen Confidential' }] });

	await open(page, '/books/books');
	const card = await rim(page.getByRole('img', { name: 'Kitchen Confidential' }));
	expect(card.hasTint).toBe(true);
	expect(card.stops).toBeGreaterThanOrEqual(5);
	expect(card.radials).toBe(0);

	await open(page, '/settings');
	const slot = page.getByRole('region', { name: 'Music' });
	await expect(slot.getByText('No photo yet')).toBeVisible();
	const empty = await rim(slot.locator('.frame'));
	expect(empty.hasTint).toBe(true);
	expect(empty.stops).toBeGreaterThanOrEqual(5);
	expect(empty.radials).toBe(0);
});

test('Scenario: HeroSlot error uses the error token', async ({ page }) => {
	await open(page, '/settings');
	const slot = page.getByRole('region', { name: 'Books' });
	await slot.locator('input[type="file"]').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });

	const error = slot.getByRole('alert');
	await expect(error).toHaveText('Unsupported image type');
	const colours = await page.evaluate(() => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--error)';
		document.querySelector('[data-world]')!.append(probe);
		const token = getComputedStyle(probe).color;
		probe.remove();
		return { token, error: getComputedStyle(document.querySelector('[role="alert"]')!).color };
	});
	expect(colours.error).toBe(colours.token);
});
