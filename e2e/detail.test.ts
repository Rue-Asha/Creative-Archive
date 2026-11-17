import { expect, test } from '@playwright/test';
import { calm, expectCurrent, expectWorld, open, openEntryMenu, reset, seed } from './helpers.ts';

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
	await expect(page.getByRole('link', { name: 'brand.example/coat' })).toHaveAttribute('href', 'https://brand.example/coat');
	await expect(page.getByText('240 EUR')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Status: Owned' })).toBeVisible();
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

	await expectWorld(page, 'books');
});

test('Scenario: Entry pages mark their domain', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'manga', title: 'Vagabond' }] });
	await open(page, `/entries/${id}`);

	await expectCurrent(page.getByRole('navigation', { name: 'Main' }), 'Animanga');
});

test('Scenario: Fashion entries without status or rating show no controls', async ({ page, request }) => {
	const {
		entries: [brand, magazine, look]
	} = await seed(request, {
		entries: [
			{ type: 'brand', title: 'Maison Example', kind: 'brand' },
			{ type: 'magazine', title: 'Vestoj' },
			{ type: 'look', title: 'Autumn layers' }
		]
	});

	for (const id of [brand, magazine, look]) {
		await open(page, `/entries/${id}`);

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByRole('button', { name: /^Status/ })).toHaveCount(0);
		await expect(page.getByRole('spinbutton')).toHaveCount(0);
		await expect(page.getByRole('group', { name: /Episodes|Chapters|Volumes/ })).toHaveCount(0);
	}
});

test('the cover shows the photo, or a placeholder with initials, and Edit links to the edit page', async ({ page, request }) => {
	const {
		entries: [withImage, without]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'album', title: 'Nikes Remixed' }
		]
	});

	await open(page, `/entries/${withImage}`);
	await expect(page.getByRole('img', { name: 'Blonde', exact: true })).toHaveAttribute('src', /^\/images\/\d+$/);
	await openEntryMenu(page);
	await expect(page.getByRole('menuitem', { name: 'Edit' })).toHaveAttribute('href', `/entries/${withImage}/edit`);

	await open(page, `/entries/${without}`);
	await expect(page.getByRole('img', { name: 'Nikes Remixed' })).not.toHaveAttribute('src');
	await expect(page.getByRole('img', { name: 'Nikes Remixed' }).getByText('NR')).toBeVisible();
});

test('detail shows the cover beside the facts on desktop, above them on the phone, and never overflows sideways', async ({ page, request }, info) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true, details: { year: 2016 } }] });
	await open(page, `/entries/${id}`);
	const cover = (await page.getByRole('img', { name: 'Blonde', exact: true }).boundingBox())!;
	const panel = (await page.getByRole('region', { name: 'Album', exact: true }).boundingBox())!;
	const facts = (await page.getByText('Year', { exact: true }).boundingBox())!;

	if (info.project.name === 'desktop') {
		expect(facts.x).toBeGreaterThan(cover.x + cover.width - 1);
		expect(cover.width).toBeLessThanOrEqual(401);
	} else expect(facts.y).toBeGreaterThan(cover.y + cover.height - 1);
	expect(panel.x).toBeLessThanOrEqual(cover.x);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
});
