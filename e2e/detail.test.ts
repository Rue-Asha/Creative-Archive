import { expect, test, type Locator } from '@playwright/test';
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

const centreY = async (locator: Locator) => {
	const box = (await locator.boundingBox())!;
	return box.y + box.height / 2;
};

test('Scenario: Phone detail shows the title above the fold', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	const longTitle = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ').slice(0, 180);
	const {
		entries: [manga, long]
	} = await seed(request, {
		entries: [
			{ type: 'manga', title: 'Vagabond', image: true },
			{ type: 'book', title: longTitle, image: true }
		]
	});

	for (const id of [manga, long]) {
		await open(page, `/entries/${id}`);
		const cover = (await page.locator(`[data-cover-id="${id}"]`).boundingBox())!;
		const heading = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
		expect(cover.width).toBeLessThanOrEqual(240.5);
		expect(heading.y).toBeLessThan(844);
	}
});

test('Scenario: Desktop controls share one row', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	const {
		entries: [id]
	} = await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', rating: 4, progress: { episodes: { current: 3, total: 28 } } }]
	});
	await open(page, `/entries/${id}`);
	const panel = page.locator('[data-detail-panel]');

	const status = await centreY(panel.locator('.status'));
	const stars = await centreY(panel.getByRole('slider', { name: 'Rating' }));
	const progress = panel.getByRole('group', { name: 'Episodes', exact: true });
	const buttons = progress.getByRole('button');
	expect(await buttons.count()).toBeGreaterThan(1);
	expect(Math.abs(status - stars)).toBeLessThanOrEqual(2);
	for (const button of await buttons.all()) expect(Math.abs((await centreY(button)) - status)).toBeLessThanOrEqual(2);
});

test('Scenario: Detail without progress keeps its controls row', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'done', rating: 5 }] });
	await open(page, `/entries/${id}`);
	const panel = page.locator('[data-detail-panel]');

	const status = await centreY(panel.locator('.status'));
	const stars = await centreY(panel.getByRole('slider', { name: 'Rating' }));
	expect(Math.abs(status - stars)).toBeLessThanOrEqual(2);
});

test('Scenario: Delete is a quiet action on the actions row', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	const edit = (await page.getByRole('link', { name: 'Edit' }).boundingBox())!;
	const remove = page.getByRole('button', { name: 'Delete' });
	const box = (await remove.boundingBox())!;

	expect(Math.abs(box.y - edit.y)).toBeLessThanOrEqual(2);
	const style = await remove.evaluate((el) => {
		const s = getComputedStyle(el);
		return { bg: s.backgroundColor, border: s.borderTopWidth, style: s.borderTopStyle };
	});
	expect(style.bg).toBe('rgba(0, 0, 0, 0)');
	expect(style.border === '0px' || style.style === 'none').toBe(true);
});

test('Scenario: Detail backdrop fades out without a crease', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, `/entries/${id}`);

	const backdrop = await page.locator('.backdrop').evaluate((el) => {
		const mask = getComputedStyle(el).maskImage;
		const overlay = getComputedStyle(el, '::after');
		return { stops: (mask.match(/rgba?\(/g) ?? []).length, overlay: overlay.content, overlayImage: overlay.backgroundImage };
	});
	expect(backdrop.stops).toBeGreaterThanOrEqual(5);
	expect(backdrop.overlay).toBe('none');
	expect(backdrop.overlayImage).toBe('none');
});
