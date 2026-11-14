import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const tabs = (page: Page) => page.getByRole('navigation', { name: 'Sub-types' });
const box = async (loc: Locator) => (await loc.boundingBox())!;
const captions = (page: Page) => tabs(page).getByText(/^(My things|Discover)$/);

test('Scenario: Fashion tabs come in two labelled groups', async ({ page }) => {
	await open(page, '/fashion');

	const mine = tabs(page).getByRole('group', { name: 'My things' });
	const discover = tabs(page).getByRole('group', { name: 'Discover' });
	await expect(mine.getByRole('link')).toHaveText(['Wardrobe', 'Pieces', 'Looks']);
	await expect(discover.getByRole('link')).toHaveText(['Brands', 'Shops', 'Influencers', 'Magazines']);
	await expect(captions(page)).toHaveText(['My things', 'Discover']);
	await expect(captions(page).first()).toBeVisible();
	await expect(captions(page).last()).toBeVisible();
	await expect(tabs(page).getByRole('link').getByText(/^(My things|Discover)$/)).toHaveCount(0);
	await expect(tabs(page).getByRole('separator')).toHaveCount(1);
});

test('Scenario: Other domains keep a flat tab bar', async ({ page }) => {
	for (const domain of ['music', 'animanga', 'books']) {
		await open(page, `/${domain}`);

		await expect(tabs(page).getByRole('group').or(tabs(page).getByRole('separator')).or(captions(page)), domain).toHaveCount(0);
	}
});

test('Scenario: Group captions use the type scale and colour tokens', async ({ page }) => {
	await open(page, '/fashion');

	const small = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--t-small').trim());
	const eyebrow = await page.getByText('Domain', { exact: true }).evaluate((el) => getComputedStyle(el).color);
	expect(small).toBe('13px');
	await expect(captions(page)).toHaveCount(2);
	for (const caption of await captions(page).all()) {
		const style = await caption.evaluate((el) => {
			const s = getComputedStyle(el);
			return { size: s.fontSize, color: s.color, transform: s.textTransform, transition: s.transitionProperty };
		});
		expect(style.size).toBe(small);
		expect(style.color).toBe(eyebrow);
		expect(style.transform).toBe('none');
		expect(style.transition).not.toContain('clip-path');
	}
});

test('Scenario: Grouped tabs keep the chip style', async ({ page }) => {
	const read = (links: Locator) =>
		links.evaluateAll((els) =>
			els.map((el) => {
				const s = getComputedStyle(el);
				return {
					size: s.fontSize,
					min: s.minHeight,
					radius: s.borderRadius,
					backdrop: s.backdropFilter,
					current: el.getAttribute('aria-current'),
					height: el.getBoundingClientRect().height
				};
			})
		);
	await open(page, '/music');
	const [reference] = await read(tabs(page).getByRole('link'));
	await open(page, '/fashion');

	for (const tab of await read(tabs(page).getByRole('link'))) {
		expect([tab.size, tab.min, tab.radius, tab.backdrop]).toEqual([reference.size, reference.min, reference.radius, reference.backdrop]);
		expect(tab.height).toBeGreaterThanOrEqual(40);
		expect(tab.current).toBeNull();
	}
});

test('Scenario: Grouped tabs fit the phone', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone');
	await open(page, '/fashion');

	expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
	expect(await tabs(page).evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
	const mine = await box(tabs(page).getByRole('group', { name: 'My things' }));
	const discover = await box(tabs(page).getByRole('group', { name: 'Discover' }));
	const divider = await box(tabs(page).getByRole('separator'));
	const viewport = page.viewportSize()!;
	expect(discover.y).toBeGreaterThanOrEqual(mine.y + mine.height);
	expect(divider.width).toBeGreaterThan(divider.height);
	expect(divider.y).toBeGreaterThanOrEqual(mine.y + mine.height - 1);
	expect(divider.y + divider.height).toBeLessThanOrEqual(discover.y + 1);
	for (const [name, group] of [['My things', mine], ['Discover', discover]] as const)
		for (const link of await tabs(page).getByRole('group', { name }).getByRole('link').all()) {
			const b = await box(link);
			expect(b.x, name).toBeGreaterThanOrEqual(group.x - 1);
			expect(b.x + b.width, name).toBeLessThanOrEqual(Math.min(group.x + group.width, viewport.width) + 1);
			expect(b.y, name).toBeGreaterThanOrEqual(group.y - 1);
			expect(b.y + b.height, name).toBeLessThanOrEqual(group.y + group.height + 1);
			expect(b.height, name).toBeGreaterThanOrEqual(40);
		}
});

test('Scenario: Grouped tabs sit in one row on desktop', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop');
	await open(page, '/fashion');

	const links = await tabs(page).getByRole('link').all();
	expect(links).toHaveLength(7);
	const boxes = await Promise.all(links.map(box));
	for (const b of boxes) expect(Math.abs(b.y - boxes[0].y)).toBeLessThanOrEqual(1);
	const mine = await box(tabs(page).getByRole('group', { name: 'My things' }));
	const discover = await box(tabs(page).getByRole('group', { name: 'Discover' }));
	const divider = await box(tabs(page).getByRole('separator'));
	expect(discover.x).toBeGreaterThanOrEqual(mine.x + mine.width);
	expect(divider.height).toBeGreaterThan(divider.width);
	expect(divider.x).toBeGreaterThanOrEqual(mine.x + mine.width - 1);
	expect(divider.x + divider.width).toBeLessThanOrEqual(discover.x + 1);
	const add = await box(page.getByRole('button', { name: 'Add' }));
	const centre = (b: { y: number; height: number }) => b.y + b.height / 2;
	expect(Math.abs(centre(add) - centre(boxes[0]))).toBeLessThanOrEqual(2);
	expect(await tabs(page).evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});
