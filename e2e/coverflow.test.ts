import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed, type SeedEntry } from './helpers.ts';

const flow = (page: Page) => page.locator('[data-coverflow]');
const active = (page: Page) => flow(page).locator('[data-active]');
const counter = (page: Page) => flow(page).locator('.counter');
const next = (page: Page) => flow(page).getByRole('button', { name: 'Next entry' });
const prev = (page: Page) => flow(page).getByRole('button', { name: 'Previous entry' });

// Entry 1 is the oldest; createdAt follows the number
const entries = (n: number, image = true): SeedEntry[] =>
	Array.from({ length: n }, (_, i) => ({
		type: 'book',
		title: `Entry ${i + 1}`,
		image,
		createdAt: `2026-10-${String(i + 1).padStart(2, '0')}T12:00:00.000Z`
	}));

const rotation = (page: Page, which: 'active' | number) =>
	flow(page)
		.locator('[data-coverflow-card]')
		.nth(which === 'active' ? 0 : which)
		.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m13);

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Scenario: Coverflow shows the most recent entries with images', async ({ page, request }) => {
	await calm(page);
	await seed(request, { entries: entries(22) });
	await open(page, '/');

	await expect(counter(page)).toHaveText(/^01\s*\/\s*20$/);
	await expect(flow(page).locator('[data-coverflow-card]')).toHaveCount(20);
	await expect(active(page)).toContainText('Entry 22');
	await expect(flow(page).getByText('Entry 2', { exact: true })).toHaveCount(0);
});

test('Scenario: Coverflow tilts the neighbours', async ({ page, request }) => {
	await seed(request, { entries: entries(5) });
	await open(page, '/');

	await expect(counter(page)).toHaveText(/^01\s*\/\s*05$/);
	expect(await rotation(page, 'active')).toBe(0);
	expect(Math.abs(await rotation(page, 1))).toBeGreaterThan(0.1);
	expect(Math.abs(await rotation(page, 2))).toBeGreaterThan(0.1);
});

test('Scenario: Coverflow arrows step through entries', async ({ page, request }) => {
	await calm(page);
	await seed(request, { entries: entries(5) });
	await open(page, '/');

	await expect(prev(page)).toBeDisabled();
	await next(page).click();
	await next(page).click();
	await prev(page).click();
	await expect(counter(page)).toHaveText(/^02\s*\/\s*05$/);
	await expect(active(page)).toContainText('Entry 4');
});

test('Scenario: Arrow keys step the coverflow on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'keyboard arrows are the desktop path');
	await calm(page);
	await seed(request, { entries: entries(5) });
	await open(page, '/');

	await flow(page).locator('[data-coverflow-stage]').focus();
	await page.keyboard.press('ArrowRight');
	await expect(counter(page)).toHaveText(/^02\s*\/\s*05$/);
	await page.keyboard.press('ArrowLeft');
	await expect(counter(page)).toHaveText(/^01\s*\/\s*05$/);
});

async function swipeLeft(page: Page) {
	const box = (await active(page).boundingBox())!;
	const y = box.y + box.height / 2;
	const from = box.x + box.width * 0.8;
	const cdp = await page.context().newCDPSession(page);
	const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x: number) =>
		cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
	await touch('touchStart', from);
	for (let i = 1; i <= 8; i++) await touch('touchMove', from - i * 12);
	await touch('touchEnd', from - 96);
}

// Chromium sends no click for a tap that lands within ~200 ms of a pan ending, whatever the page does
const settled = (page: Page) => page.waitForTimeout(400);

test('Scenario: Swipe steps the coverflow on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'swipe is the touch path');
	await calm(page);
	await seed(request, { entries: entries(5) });
	await open(page, '/');
	await expect(counter(page)).toHaveText(/^01\s*\/\s*05$/);

	await swipeLeft(page);

	await expect(counter(page)).toHaveText(/^02\s*\/\s*05$/);
	await expect(active(page)).toContainText('Entry 4');
	await expect(page).toHaveURL(/\/$/);
});

test('a swipe does not swallow the next tap on the centre card', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'swipe is the touch path');
	await calm(page);
	const { entries: ids } = await seed(request, { entries: entries(5) });
	await open(page, '/');
	await swipeLeft(page);
	await expect(active(page)).toContainText('Entry 4');
	await settled(page);

	const box = (await active(page).boundingBox())!;
	await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);

	await expect(page).toHaveURL(`/entries/${ids[3]}`);
});

test('a swipe does not swallow the next tap on a side card', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'swipe is the touch path');
	await calm(page);
	await seed(request, { entries: entries(5) });
	await open(page, '/');
	await swipeLeft(page);
	await expect(counter(page)).toHaveText(/^02\s*\/\s*05$/);
	await settled(page);

	const side = (await flow(page).locator('[data-coverflow-card]').nth(2).boundingBox())!;
	// the centre of a side card sits under the centre one; its outer edge does not
	await page.touchscreen.tap(Math.min(side.x + side.width - 10, 380), side.y + side.height / 2);

	await expect(counter(page)).toHaveText(/^03\s*\/\s*05$/);
	await expect(page).toHaveURL(/\/$/);
});

test('Scenario: Single entry coverflow has no arrows', async ({ page, request }) => {
	await calm(page);
	await seed(request, { entries: entries(1) });
	await open(page, '/');

	await expect(flow(page).locator('[data-coverflow-card]')).toHaveCount(1);
	await expect(counter(page)).toHaveText(/^01\s*\/\s*01$/);
	await expect(next(page)).toHaveCount(0);
	await expect(prev(page)).toHaveCount(0);
});

test('Scenario: Coverflow is hidden without entries with images', async ({ page, request }) => {
	await calm(page);
	await seed(request, { entries: entries(3, false) });
	await open(page, '/');

	await expect(page.locator('[data-coverflow]')).toHaveCount(0);
});

test('Scenario: Reduced motion coverflow steps without tilt', async ({ page, request }) => {
	await calm(page);
	await seed(request, { entries: entries(5) });
	await open(page, '/');
	await expect(counter(page)).toHaveText(/^01\s*\/\s*05$/);

	await next(page).click();
	await expect(counter(page)).toHaveText(/^02\s*\/\s*05$/);
	await expect(active(page)).toContainText('Entry 4');
	const transforms = await flow(page)
		.locator('[data-coverflow-card]')
		.evaluateAll((els) => els.map((el) => new DOMMatrix(getComputedStyle(el).transform).m13));
	expect(transforms.every((m13) => m13 === 0)).toBe(true);
	const running = await flow(page)
		.locator('[data-coverflow-card]')
		.evaluateAll((els) => els.flatMap((el) => el.getAnimations()).length);
	expect(running).toBe(0);
});
