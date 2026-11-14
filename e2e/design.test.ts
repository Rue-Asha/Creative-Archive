import { expect, test } from '@playwright/test';
import { calm, open } from './helpers.ts';

test.describe('components page', () => {
	test.beforeEach(async ({ page }) => {
		await calm(page);
		await open(page, '/__mockups/components');
	});

	test('Scenario: Card follows the Swap layout', async ({ page }) => {
		const card = page.getByRole('region', { name: 'light scheme' }).getByRole('article').filter({ hasText: 'Blonde' });
		await card.scrollIntoViewIfNeeded();
		const box = (await card.boundingBox())!;
		const photo = (await card.locator('img').boundingBox())!;
		const centre = async (part: ReturnType<typeof card.getByText>) => {
			const b = (await part.boundingBox())!;
			return { x: b.x + b.width / 2 - box.x, y: b.y + b.height / 2 - box.y };
		};

		expect(Math.abs(photo.x - box.x)).toBeLessThanOrEqual(1);
		expect(Math.abs(photo.y - box.y)).toBeLessThanOrEqual(1);
		expect(Math.abs(photo.width - box.width)).toBeLessThanOrEqual(1);
		expect(Math.abs(photo.height - box.height)).toBeLessThanOrEqual(1);
		const chip = await centre(card.getByText('Album', { exact: true }));
		expect(chip.x).toBeLessThan(box.width / 2);
		expect(chip.y).toBeLessThan(box.height / 2);
		const title = await centre(card.getByRole('heading', { level: 3 }));
		expect(title.x).toBeLessThan(box.width / 2);
		expect(title.y).toBeGreaterThan(box.height / 2);
	});

	test('Scenario: Star rating shows half stars', async ({ page }) => {
		await expect(page.getByRole('region', { name: 'light scheme' }).getByRole('img', { name: '3.5 of 5', exact: true })).toBeVisible();
	});

	test('Scenario: Status split-pill opens its choices', async ({ page }) => {
		const pane = page.getByRole('region', { name: 'light scheme' });
		await pane.getByRole('button', { name: 'Status: Watching' }).click();
		const menu = pane.getByRole('menu', { name: 'Status' });

		await expect(menu.getByRole('menuitemradio')).toHaveText(['No status', 'Plan to watch', 'Watching', 'Watched', 'Dropped']);
		await menu.getByRole('menuitemradio', { name: 'Watched' }).click();
		await expect(menu).toHaveCount(0);
		await expect(pane.getByRole('button', { name: 'Status: Watched' })).toBeFocused();
	});

	test('rating input steps by halves with the arrow keys and clears with Delete', async ({ page }) => {
		const slider = page.getByRole('region', { name: 'light scheme' }).getByRole('slider', { name: 'Your rating' });
		await slider.focus();
		await page.keyboard.press('ArrowRight');
		await expect(slider).toHaveAttribute('aria-valuenow', '4.5');
		await page.keyboard.press('ArrowLeft');
		await page.keyboard.press('ArrowLeft');
		await expect(slider).toHaveAttribute('aria-valuetext', '3.5 of 5');
		await page.keyboard.press('Delete');
		await expect(slider).toHaveAttribute('aria-valuetext', 'Not rated');
	});

	test('progress shows an unknown total as ?', async ({ page }) => {
		const progress = page.getByRole('region', { name: 'light scheme' }).getByRole('group', { name: 'Chapters' });
		await expect(progress).toContainText('/ ?');
		await progress.getByRole('button', { name: 'Chapters: one more' }).click();
		await expect(progress.getByRole('button', { name: 'Chapters 215 of unknown' })).toBeVisible();
	});

	test('both schemes render side by side with their own tokens', async ({ page }) => {
		const ground = (scheme: string) =>
			page.getByRole('region', { name: `${scheme} scheme` }).evaluate((el) => getComputedStyle(el).backgroundColor);
		expect(await ground('light')).toBe('rgb(236, 234, 230)');
		expect(await ground('dark')).toBe('rgb(13, 13, 16)');
	});
});

const pairings = {
	a: { families: ['Bricolage Grotesque', 'Figtree'], files: ['/fonts/bricolage-grotesque-latin-opsz-normal.woff2', '/fonts/figtree-latin-wght-normal.woff2'] },
	b: { families: ['Syne', 'Manrope'], files: ['/fonts/syne-latin-wght-normal.woff2', '/fonts/manrope-latin-wght-normal.woff2'] },
	c: { families: ['Bodoni Moda', 'Hanken Grotesk'], files: ['/fonts/bodoni-moda-latin-opsz-normal.woff2', '/fonts/hanken-grotesk-latin-wght-normal.woff2'] }
};

for (const [name, pairing] of Object.entries(pairings)) {
	test(`Scenario: Display and text fonts load from the app (pairing ${name})`, async ({ page, baseURL }) => {
		const fontRequests: string[] = [];
		page.on('request', (request) => {
			if (request.resourceType() === 'font') fontRequests.push(request.url());
		});
		await open(page, `/__mockups/music/dark?font=${name}`);
		await page.evaluate(() => document.fonts.ready);
		const display = await page.getByRole('heading', { level: 1 }).first().evaluate((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, ''));
		const loaded = await page.evaluate(async () => {
			await document.fonts.ready;
			return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
		});

		expect(display).toBe(pairing.families[0]);
		expect(loaded).toEqual(expect.arrayContaining(pairing.families));
		for (const url of fontRequests) expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
		expect(fontRequests.map((u) => new URL(u).pathname)).toEqual(expect.arrayContaining(pairing.files));
	});
}

test('the components page compares the three pairings', async ({ page }) => {
	await calm(page);
	await open(page, '/__mockups/components');
	const families = await page
		.getByRole('region', { name: 'Type pairings' })
		.getByRole('heading', { level: 2 })
		.evaluateAll((els) => els.map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/['"]/g, '')));
	expect(families).toEqual(['Bricolage Grotesque', 'Syne', 'Bodoni Moda']);
});

test('Scenario: Controls are at least 44px on phone (components)', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the 44px rule is for phone');
	await calm(page);
	await open(page, '/__mockups/components');
	const small = await page.evaluate(() =>
		[...document.querySelectorAll('button, a[href], input, select, [role="slider"]')]
			.filter((el) => {
				const r = el.getBoundingClientRect();
				return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
			})
			// a card's title link is stretched over the whole card by a pseudo-element
			.filter((el) => !el.closest('article h3'))
			.map((el) => {
				const r = el.getBoundingClientRect();
				return { control: el.outerHTML.slice(0, 100), width: Math.round(r.width), height: Math.round(r.height) };
			})
			.filter((c) => c.width < 44 || c.height < 44)
	);

	expect(small).toEqual([]);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
