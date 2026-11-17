import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, cardOf, cardTitles, cards, countSaves, editProgress, open, progressGroup, progressValue, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const card = cardOf;

test('Scenario: Long title truncates on cards', async ({ page, request }) => {
	const title = 'Extraordinarily '.repeat(11).trim();
	await seed(request, { entries: [{ type: 'album', title }] });
	await open(page, '/music/albums');

	const metrics = await cardTitles(page).evaluate((el) => {
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
	// the fingerprint's plate colour, never a gradient
	const { colour, gradient } = await placeholder.evaluate((el) => {
		const style = getComputedStyle(el);
		return { colour: style.backgroundColor, gradient: style.backgroundImage };
	});
	expect(gradient).toBe('none');
	expect(colour).not.toBe('rgba(0, 0, 0, 0)');
	await expect(card(page, 'Kitchen Confidential').locator('img')).toHaveCount(0);
});

test('Scenario: Rated entries show their rating on cards', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Rated One', rating: 7.5 }] });
	await open(page, '/music/albums');

	await expect(card(page, 'Rated One')).toContainText('7.5 / 10');
	await expect(card(page, 'Rated One').getByText('7.5 of 10', { exact: true })).toHaveCount(1);
});

test('Scenario: Unrated entries show no rating on cards', async ({ page, request }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Plain One' }] });
	await open(page, '/music/albums');

	await expect(card(page, 'Plain One')).toBeVisible();
	await expect(card(page, 'Plain One').getByText(/\/ 10$/)).toHaveCount(0);
	await expect(card(page, 'Plain One').getByText(/ of 10$/)).toHaveCount(0);
});

const group = progressGroup;

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
	await expect(cards(page).getByRole('group')).toHaveCount(1);
	await expect(page.getByRole('group', { name: 'Episodes, Frieren', exact: true })).toHaveCount(1);
	await expect(group(frieren, 'Episodes', 'Frieren')).toContainText('5 / 28');
	await frieren.getByRole('button', { name: 'Episodes: one more', exact: true }).click();

	await expect(group(frieren, 'Episodes', 'Frieren')).toContainText('6 / 28');
	await saved(1);
	await page.reload();
	await expect(group(card(page, 'Frieren'), 'Episodes', 'Frieren')).toContainText('6 / 28');
	await open(page, `/entries/${id}`);
	await expect(group(page, 'Episodes')).toContainText('6 / 28');
});

test('a manga card steps chapters and an unknown total reads "n / ?"', async ({ page, request }) => {
	await seed(request, {
		entries: [{ type: 'manga', title: 'Vagabond', status: 'progress', progress: { chapters: { current: 40, total: null }, volumes: { current: 4, total: null } } }]
	});
	await open(page, '/animanga/manga');
	const vagabond = card(page, 'Vagabond');
	await expect(group(vagabond, 'Chapters', 'Vagabond')).toContainText('/ ?');
	await expect(vagabond.getByRole('group', { name: /^Volumes/ })).toHaveCount(0);
	await vagabond.getByRole('button', { name: 'Chapters: one more', exact: true }).click();

	await expect(group(vagabond, 'Chapters', 'Vagabond')).toContainText('41 / ?');
});

test('a card control sits only on in-progress anime and manga', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Done One', status: 'done', progress: { episodes: { current: 12, total: 12 } } },
			{ type: 'album', title: 'Listening', status: 'progress' }
		]
	});
	await open(page, '/animanga/anime');
	await expect(cards(page)).toHaveCount(1);
	await expect(cards(page).getByRole('group')).toHaveCount(0);
	await open(page, '/music/albums');
	await expect(card(page, 'Listening')).toBeVisible();
	await expect(cards(page).getByRole('group')).toHaveCount(0);
});

const transformOf = (page: Page, title: string) =>
	card(page, title).evaluate((el) => getComputedStyle(el).transform);

test('Scenario: Cards do not move on hover on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'hover is desktop-only');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await seed(request, { entries: [{ type: 'album', title: 'Steady', image: true }] });
	await open(page, '/music/albums');
	const cover = card(page, 'Steady').locator('img').first();
	await expect(cover).toBeVisible();
	// the cards settle into place on a full load; measure once they have
	await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
	const box = (await card(page, 'Steady').boundingBox())!;
	await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.2);
	await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.3);
	await page.waitForTimeout(400);

	expect(await transformOf(page, 'Steady')).toBe('none');
	expect(await cover.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
	expect(await card(page, 'Steady').boundingBox()).toEqual(box);
});

async function pressed(page: Page, title: string): Promise<{ held: string; released: string }> {
	await seed(page.request, { entries: [{ type: 'album', title }] });
	await open(page, '/music/albums');
	const box = (await card(page, title).boundingBox())!;
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 4);
	await page.mouse.down();
	await page.waitForTimeout(400);
	const held = await transformOf(page, title);
	// leave the card before letting go, so the press does not open the entry
	await page.mouse.move(2, 2);
	await page.mouse.up();
	await page.waitForTimeout(400);
	return { held, released: await transformOf(page, title) };
}

test('Scenario: Cards press in', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'a held mouse press');
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	const { held, released } = await pressed(page, 'Touched');
	expect(held).toBe('matrix(0.97, 0, 0, 0.97, 0, 0)');
	expect(released).toBe('none');
});

test('Scenario: Reduced motion cards stay still when pressed', async ({ page }, info) => {
	test.skip(info.project.name !== 'desktop', 'a held mouse press');
	const { held } = await pressed(page, 'Touched');
	expect(held).toBe('none');
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
	const episodes = () => group(card(page, 'Frieren'), 'Episodes', 'Frieren');
	const more = () => card(page, 'Frieren').getByRole('button', { name: 'Episodes: one more', exact: true });
	await more().click();

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(episodes()).toContainText('5 / 28');
	await more().click();

	await expect(episodes()).toContainText('6 / 28');
	await saved(2);
	await page.reload();
	await expect(group(card(page, 'Frieren'), 'Episodes', 'Frieren')).toContainText('6 / 28');
});

test('Scenario: Activating the value on a card stays on the list', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 5, total: 28 } } }]
	});
	const saved = countSaves(page);
	await open(page, '/animanga/anime');
	await editProgress(card(page, 'Frieren'), 'Episodes', '6', 'Enter', 'Frieren');

	await expect(page).toHaveURL(/\/animanga\/anime$/);
	await expect(group(card(page, 'Frieren'), 'Episodes', 'Frieren')).toContainText('6');
	await saved(1);
	await open(page, `/entries/${id}`);
	await expect(group(page, 'Episodes')).toContainText('6 / 28');
});

const inProgress = (page: Page) => page.getByRole('region', { name: 'In progress', exact: true });

test('Scenario: Numeric keyboard opens only in edit mode', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the soft keyboard is phone-only');
	await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 5, total: 28 } } }]
	});
	await open(page, '/');
	const frieren = cardOf(inProgress(page), 'Frieren');
	await expect(frieren).toBeVisible();

	await expect(frieren.getByRole('textbox')).toHaveCount(0);
	await progressValue(frieren, 'Episodes', 'Frieren').tap();
	await expect(frieren.getByRole('textbox')).toBeFocused();
	await expect(frieren.getByRole('textbox')).toHaveAttribute('inputmode', 'numeric');
});

const inside = async (inner: Locator, outer: Locator) => {
	const [a, b] = [(await inner.boundingBox())!, (await outer.boundingBox())!];
	expect(a.x).toBeGreaterThanOrEqual(b.x - 0.5);
	expect(a.y).toBeGreaterThanOrEqual(b.y - 0.5);
	expect(a.x + a.width).toBeLessThanOrEqual(b.x + b.width + 0.5);
	expect(a.y + a.height).toBeLessThanOrEqual(b.y + b.height + 0.5);
};

const fits = async (page: Page, title: string, label: string) => {
	const frieren = cardOf(inProgress(page), title);
	await expect(frieren).toBeVisible();
	const controls = [
		frieren.getByRole('button', { name: `${label}: one less`, exact: true }),
		progressValue(frieren, label, title),
		frieren.getByRole('button', { name: `${label}: one more`, exact: true })
	];
	for (const control of controls) {
		const box = (await control.boundingBox())!;
		expect(box.width).toBeGreaterThanOrEqual(43.5);
		expect(box.height).toBeGreaterThanOrEqual(43.5);
		await inside(control, frieren);
	}
};

test('Scenario: Progress control fits a phone shelf card', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone shelf cards only');
	await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 12, total: 28 } } }]
	});
	await open(page, '/');
	const frieren = cardOf(inProgress(page), 'Frieren');
	await fits(page, 'Frieren', 'Episodes');

	await expect(inProgress(page)).toBeVisible();
	await expect(group(frieren, 'Episodes', 'Frieren').getByText('/ 28')).toBeHidden();
	const line = frieren.getByText('12 / 28 episodes', { exact: true });
	await expect(line).toBeVisible();
	expect((await line.boundingBox())!.y, 'the line sits above the steps').toBeLessThan((await group(frieren, 'Episodes', 'Frieren').boundingBox())!.y);
	await expect(progressValue(frieren, 'Episodes', 'Frieren')).toHaveAccessibleName('Episodes 12 of 28');
});

test('Scenario: Three-digit progress fits a phone shelf card', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'phone shelf cards only');
	await seed(request, {
		entries: [{ type: 'manga', title: 'Vagabond', status: 'progress', progress: { chapters: { current: 120, total: 327 }, volumes: { current: 4, total: null } } }]
	});
	await open(page, '/');
	await expect(progressValue(inProgress(page), 'Chapters', 'Vagabond')).toContainText('120');

	await fits(page, 'Vagabond', 'Chapters');
	const value = progressValue(cardOf(inProgress(page), 'Vagabond'), 'Chapters', 'Vagabond');
	expect(await value.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
});

test('Scenario: Desktop cards show the total', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop cards only');
	await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 5, total: 28 } } }]
	});
	await open(page, '/animanga/anime');

	await expect(group(card(page, 'Frieren'), 'Episodes', 'Frieren')).toContainText('5 / 28');
	await expect(group(card(page, 'Frieren'), 'Episodes', 'Frieren').getByText('/ 28')).toBeVisible();
});

test('Scenario: Rating and progress share one footer slot', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Watching', status: 'progress', progress: { episodes: { current: 5, total: 28 } } },
			{ type: 'anime', title: 'Finished', status: 'done', rating: 8.75 }
		]
	});
	await open(page, '/animanga/anime?view=shelves');
	const slotEnd = async (title: string, inner: Locator) => {
		const [c, i] = [(await card(page, title).boundingBox())!, (await inner.boundingBox())!];
		return { height: c.height, gap: Math.round(c.y + c.height - (i.y + i.height)) };
	};
	const progress = await slotEnd('Watching', group(card(page, 'Watching'), 'Episodes', 'Watching'));
	const rating = await slotEnd('Finished', card(page, 'Finished').getByRole('paragraph').filter({ hasText: '8.75' }));

	expect(rating.height).toBe(progress.height);
	expect(rating.gap).toBe(progress.gap);
});

// every heading on the page, in reading order, as its level
const outline = (page: Page) =>
	page.getByRole('heading').evaluateAll((els) => els.map((el) => Number(el.getAttribute('aria-level') ?? el.tagName.slice(1))));

const noSkips = (levels: number[], label: string) => {
	expect(levels[0], `${label} starts at h1`).toBe(1);
	levels.forEach((level, i) => i && expect(level, `${label} heading ${i}`).toBeLessThanOrEqual(levels[i - 1] + 1));
};

test('card headings sit one level under their section', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'done' },
			{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } } }
		]
	});
	await open(page, '/music/albums');
	const list = page.getByRole('region', { name: 'Albums list', exact: true });

	await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
	await expect(list.getByRole('heading', { level: 2, name: 'Albums list', exact: true })).toBeAttached();
	await expect(card(list, 'Blonde').getByRole('heading', { level: 3, name: 'Blonde', exact: true })).toBeVisible();
	noSkips(await outline(page), 'list');

	await open(page, '/');
	const recent = page.getByRole('region', { name: 'Recently added', exact: true });
	const music = recent.getByRole('region', { name: 'Music', exact: true });
	const inProgress = page.getByRole('region', { name: 'In progress', exact: true });
	await expect(recent.getByRole('heading', { level: 2, name: 'Recently added', exact: true })).toBeVisible();
	await expect(music.getByRole('heading', { level: 3, name: 'Music', exact: true })).toBeVisible();
	await expect(card(music, 'Blonde').getByRole('heading', { level: 4, name: 'Blonde', exact: true })).toBeVisible();
	await expect(inProgress.getByRole('heading', { level: 2, name: 'In progress', exact: true })).toBeVisible();
	await expect(card(inProgress, 'Frieren').getByRole('heading', { level: 3, name: 'Frieren', exact: true })).toBeAttached();
	noSkips(await outline(page), 'home');
});
