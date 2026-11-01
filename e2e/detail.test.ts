import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Detail shows every filled field', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, {
		entries: [
			{
				type: 'piece',
				title: 'Wool Coat',
				status: 'owned',
				details: { brand: 'Maison Example', url: 'https://brand.example/coat', price: '240 EUR' },
				tags: ['winter', 'Ästhetik'],
				note: 'Bought in Paris, runs large.'
			}
		]
	});
	await open(page, `/entries/${id}`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wool Coat');
	await expect(page.getByText('Maison Example')).toBeVisible();
	await expect(page.locator('a[href="https://brand.example/coat"]')).toBeVisible();
	await expect(page.getByText('240 EUR')).toBeVisible();
	await expect(page.getByText('Owned', { exact: true })).toBeVisible();
	await expect(page.getByText('winter', { exact: true })).toBeVisible();
	await expect(page.getByText('Ästhetik', { exact: true })).toBeVisible();
	await expect(page.getByText('Bought in Paris, runs large.')).toBeVisible();
});

test('Scenario: Long title shows in full on detail', async ({ page, request }) => {
	const title = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ').slice(0, 180);
	expect(title).toHaveLength(180);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title }] });
	await open(page, `/entries/${id}`);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
});

test('Scenario: Unknown entry answers 404', async ({ page }) => {
	const missing = await page.goto('/entries/999999');
	expect(missing?.status()).toBe(404);

	const garbage = await page.goto('/entries/abc');
	expect(garbage?.status()).toBe(404);
});

test("Scenario: Detail pages use their type's domain world", async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood' }] });
	await open(page, `/entries/${id}`);
	const wrapper = page.locator('[data-world]');

	await expect(wrapper).toHaveAttribute('data-world', 'books');
	await expect(wrapper).toHaveAttribute('data-scheme', WORLDS.books.scheme);
	await expect(wrapper).toHaveAttribute('data-accent', WORLDS.books.accent);
});

test('Scenario: Entry pages mark their domain', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'manga', title: 'Vagabond' }] });
	await open(page, `/entries/${id}`);

	await expect(page.getByRole('navigation', { name: 'Main' }).locator('[aria-current="page"]')).toHaveText('Animanga');
});

test('Scenario: Fashion entries without status or rating show no controls', async ({ page, request }) => {
	const {
		entries: [brand, look]
	} = await seed(request, {
		entries: [
			{ type: 'brand', title: 'Maison Example', kind: 'brand' },
			{ type: 'look', title: 'Autumn layers' }
		]
	});

	for (const id of [brand, look]) {
		await open(page, `/entries/${id}`);

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.locator('[data-status-label]')).toHaveCount(0);
		await expect(page.getByRole('button', { name: /^Status/ })).toHaveCount(0);
		await expect(page.getByRole('slider')).toHaveCount(0);
		await expect(page.getByRole('group', { name: /Episodes|Chapters|Volumes/ })).toHaveCount(0);
	}
});

test('the cover carries data-cover-id, or a placeholder with initials, and Edit links to the edit page', async ({ page, request }) => {
	const {
		entries: [withImage, without]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'album', title: 'Nikes Remixed' }
		]
	});

	await open(page, `/entries/${withImage}`);
	await expect(page.locator(`[data-cover-id="${withImage}"] img`)).toBeVisible();
	await expect(page.getByRole('link', { name: 'Edit' })).toHaveAttribute('href', `/entries/${withImage}/edit`);

	await open(page, `/entries/${without}`);
	await expect(page.locator(`[data-cover-id="${without}"]`).getByRole('img', { name: 'Nikes Remixed' })).toBeVisible();
	await expect(page.locator(`[data-cover-id="${without}"]`).getByText('NR')).toBeVisible();
});

test('detail lays out as a cover and a panel side by side on desktop and stacks on phone', async ({ page, request }, info) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, `/entries/${id}`);
	const cover = (await page.locator(`[data-cover-id="${id}"]`).boundingBox())!;
	const panel = (await page.locator('[data-detail-panel]').boundingBox())!;

	if (info.project.name === 'desktop') {
		expect(panel.x).toBeGreaterThan(cover.x + cover.width - 1);
		expect(cover.width).toBeLessThanOrEqual(401);
	} else {
		expect(panel.y).toBeGreaterThan(cover.y + cover.height - 1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	}
});
