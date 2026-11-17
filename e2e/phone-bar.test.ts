import { expect, test, type Page } from '@playwright/test';
import { calm, open } from './helpers.ts';

const dock = (page: Page) => page.locator('.dock');
const PILLS = ['Home', 'Music', 'Animanga', 'Books', 'Fashion'];

test.beforeEach(({ page }) => calm(page));

test('Scenario: Phone bar shows five pills and the round add button', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone bar');
	await open(page, '/');
	const main = page.getByRole('navigation', { name: 'Main' });

	await expect(main.getByRole('link')).toHaveText(PILLS);
	await expect(main.getByRole('button', { name: 'Add', exact: true })).toBeVisible();
	await expect(main.getByRole('link', { name: /Collections|Settings/ })).toHaveCount(0);
	const add = (await main.getByRole('button', { name: 'Add' }).boundingBox())!;
	const last = (await main.getByRole('link').last().boundingBox())!;
	expect(add.x).toBeGreaterThanOrEqual(last.x + last.width);
});

test('Scenario: Current section pill is marked on the phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone bar');
	for (const [path, label] of [['/animanga/manga', 'Animanga'], ['/collections', 'Home'], ['/settings', 'Home']]) {
		await open(page, path);

		const current = dock(page).locator('[aria-current="page"]');
		await expect(current, path).toHaveCount(1);
		await expect(current, path).toHaveText(label);
	}
});

test('Scenario: Phone bar fits at 320 px', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'sets its own viewports');
	for (const [width, height] of [[320, 640], [844, 390]]) {
		await page.setViewportSize({ width, height });
		await open(page, '/fashion');
		const label = `${width}`;
		const items = [...(await dock(page).getByRole('link').all()), ...(await dock(page).getByRole('button').all())];
		const rects = await Promise.all(items.map(async (i) => (await i.boundingBox())!));

		expect(rects, label).toHaveLength(6);
		for (const r of rects) {
			expect(r.width, label).toBeGreaterThanOrEqual(44);
			expect(r.height, label).toBeGreaterThanOrEqual(44);
			expect(r.x + r.width, label).toBeLessThanOrEqual(width);
		}
		for (const [i, a] of rects.entries())
			for (const b of rects.slice(i + 1)) expect(a.x + a.width <= b.x + 1 || b.x + b.width <= a.x + 1, label).toBe(true);
		const box = (await dock(page).boundingBox())!;
		expect(box.x + box.width, label).toBeLessThanOrEqual(width);
		for (const name of PILLS) await expect(dock(page).getByRole('link', { name, exact: true }), label).toHaveCount(1);
		expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), label).toBeLessThanOrEqual(0);
	}
});

test('Scenario: Pills are icon-only below 360 px and labelled from 360 px', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'sets its own viewports');
	for (const [width, height] of [[320, 640], [359, 640], [360, 640], [390, 844]]) {
		await page.setViewportSize({ width, height });
		await open(page, '/');
		for (const name of PILLS) {
			const pill = dock(page).getByRole('link', { name, exact: true });
			const text = pill.locator('span');
			const label = `${width} ${name}`;
			await expect(pill, label).toBeVisible();
			if (width < 360) expect((await text.boundingBox())!.width, label).toBeLessThanOrEqual(1);
			else {
				await expect(text, label).toBeVisible();
				const fits = await pill.evaluate((el) => {
					const span = el.querySelector('span')!;
					return span.scrollWidth <= span.clientWidth;
				});
				expect(fits, label).toBe(true);
			}
		}
	}
});

test('Scenario: Phone bar hides while a text field has focus', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone bar');
	await open(page, '/add/book?manual=1');
	await expect(dock(page)).toBeVisible();

	await page.getByLabel('Title').first().focus();
	await expect(dock(page)).toHaveAttribute('data-hidden', '');
	await expect(dock(page)).toBeHidden();
	await expect(dock(page)).toHaveCount(1);
	await page.getByLabel('Title').first().blur();

	await expect(dock(page)).toBeVisible();
	await expect(dock(page)).not.toHaveAttribute('data-hidden');
});
