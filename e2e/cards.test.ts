import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';
import { accents, schemes } from '../src/lib/styles/tokens.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';

const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const card = (page: Page, title: string) => page.locator('[data-card]').filter({ hasText: title });

test('Scenario: Long title truncates on cards', async ({ page, request }) => {
	const title = 'Extraordinarily '.repeat(11).trim();
	await seed(request, { entries: [{ type: 'album', title }] });
	await open(page, '/music/albums');

	const metrics = await page.locator('[data-card-title]').evaluate((el) => {
		const style = getComputedStyle(el);
		return {
			height: el.getBoundingClientRect().height,
			line: parseFloat(style.lineHeight),
			clamp: style.getPropertyValue('-webkit-line-clamp'),
			clipped: el.scrollHeight > el.clientHeight
		};
	});
	expect(metrics.clamp).toBe('2');
	expect(Math.abs(metrics.height - 2 * metrics.line)).toBeLessThan(1.5);
	expect(metrics.clipped).toBe(true);
});

test('Scenario: Entry without image shows a tinted placeholder with initials', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'book', title: 'Kitchen Confidential' }] });
	await open(page, '/books/books');

	const placeholder = card(page, 'Kitchen Confidential').getByRole('img', { name: 'Kitchen Confidential' });
	await expect(placeholder).toHaveText('KC');
	const { scheme, accent } = WORLDS.books;
	const soft = rgb(accents[accent][scheme]['accent-soft']);
	const background = await placeholder.evaluate((el) => getComputedStyle(el).backgroundImage);
	expect(background).toContain(`linear-gradient(160deg, ${soft},`);
	await expect(card(page, 'Kitchen Confidential').locator('img')).toHaveCount(0);
});

test('Scenario: Rated entries show stars on cards', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Rated One', rating: 3.5 }] });
	await open(page, '/music/albums');

	await expect(card(page, 'Rated One').getByRole('img', { name: '3.5 of 5' })).toBeVisible();
});

test('Scenario: Unrated entries show no stars on cards', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Plain One' }] });
	await open(page, '/music/albums');

	await expect(card(page, 'Plain One')).toBeVisible();
	await expect(card(page, 'Plain One').getByRole('img', { name: /of 5$/ })).toHaveCount(0);
	await expect(card(page, 'Plain One').locator('.stars')).toHaveCount(0);
});

const group = (scope: Page | Locator, label: string) => scope.getByRole('group', { name: label, exact: true });

test('Scenario: Progress on the card', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 5, total: 28 } } },
			{ type: 'anime', title: 'Planned', status: 'want', progress: { episodes: { current: 0, total: 12 } } }
		]
	});
	const saved = countSaves(page);
	await open(page, '/animanga/anime');
	const frieren = card(page, 'Frieren');
	await expect(group(page, 'Episodes')).toHaveCount(1);
	await expect(group(frieren, 'Episodes').getByRole('textbox')).toHaveValue('5');
	await frieren.getByRole('button', { name: 'Episodes: one more', exact: true }).click();

	await expect(group(frieren, 'Episodes').getByRole('textbox')).toHaveValue('6');
	await expect(group(frieren, 'Episodes')).toContainText('/ 28');
	await saved(1);
	await page.reload();
	await expect(group(card(page, 'Frieren'), 'Episodes').getByRole('textbox')).toHaveValue('6');
	await open(page, `/entries/${id}`);
	await expect(group(page, 'Episodes').getByRole('textbox')).toHaveValue('6');
});

test('a manga card steps chapters and an unknown total reads "n / ?"', async ({ page, request }) => {
	await seed(request, {
		entries: [{ type: 'manga', title: 'Vagabond', status: 'progress', progress: { chapters: { current: 40, total: null }, volumes: { current: 4, total: null } } }]
	});
	await open(page, '/animanga/manga');
	const vagabond = card(page, 'Vagabond');
	await expect(group(vagabond, 'Chapters')).toContainText('/ ?');
	await expect(group(vagabond, 'Volumes')).toHaveCount(0);
	await vagabond.getByRole('button', { name: 'Chapters: one more', exact: true }).click();

	await expect(group(vagabond, 'Chapters').getByRole('textbox')).toHaveValue('41');
});

test('a card control sits only on in-progress anime and manga', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Done One', status: 'done', progress: { episodes: { current: 12, total: 12 } } },
			{ type: 'album', title: 'Listening', status: 'progress' }
		]
	});
	await open(page, '/animanga/anime');
	await expect(page.locator('[data-card]')).toHaveCount(1);
	await expect(page.locator('[data-card]').getByRole('group')).toHaveCount(0);
	await open(page, '/music/albums');
	await expect(card(page, 'Listening')).toBeVisible();
	await expect(page.locator('[data-card]').getByRole('group')).toHaveCount(0);
});

const transformOf = (page: Page, title: string) =>
	card(page, title).evaluate((el) => getComputedStyle(el).transform);

test('Scenario: Cards lift on hover on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'hover is desktop-only');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await seed(request, { entries: [{ type: 'album', title: 'Lifted' }, { type: 'album', title: 'Resting' }] });
	await open(page, '/music/albums');
	expect(await transformOf(page, 'Lifted')).toBe('none');
	const box = (await card(page, 'Lifted').boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);

	await expect.poll(() => transformOf(page, 'Lifted')).not.toBe('none');
	// the tilt toward the pointer is a 3D transform (perspective + rotate), not only the CSS lift
	await expect.poll(() => transformOf(page, 'Lifted')).toContain('matrix3d');
	expect(await transformOf(page, 'Resting')).toBe('none');
	await page.mouse.move(0, 0);
	await expect.poll(() => transformOf(page, 'Lifted')).toBe('none');
});

test('Scenario: Cards do not tilt on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone has no hover');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await seed(request, { entries: [{ type: 'album', title: 'Touched' }] });
	await open(page, '/music/albums');
	const box = (await card(page, 'Touched').boundingBox())!;
	const x = box.x + box.width / 2;
	const y = box.y + box.height / 2;
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
	await page.waitForTimeout(500);

	expect(await transformOf(page, 'Touched')).toBe('none');
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
});

test('Scenario: Reduced motion cards do not tilt', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'hover is desktop-only');
	await seed(request, { entries: [{ type: 'album', title: 'Calm' }] });
	await open(page, '/music/albums');
	const box = (await card(page, 'Calm').boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
	await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
	await page.waitForTimeout(500);

	expect(await transformOf(page, 'Calm')).toBe('none');
});

test('Scenario: Failed save on the card shows a toast and reverts', async ({ page, request }) => {
	await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 5, total: 28 } } }]
	});
	const saved = countSaves(page);
	let fail = true;
	await page.route(/\?\/progress$/, (route) => {
		if (!fail) return route.fallback();
		fail = false;
		return route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
	});
	await open(page, '/animanga/anime');
	const episodes = () => group(card(page, 'Frieren'), 'Episodes');
	const more = () => card(page, 'Frieren').getByRole('button', { name: 'Episodes: one more', exact: true });
	await more().click();

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(episodes().getByRole('textbox')).toHaveValue('5');
	await more().click();

	await expect(episodes().getByRole('textbox')).toHaveValue('6');
	await saved(2);
	await page.reload();
	await expect(group(card(page, 'Frieren'), 'Episodes').getByRole('textbox')).toHaveValue('6');
});
