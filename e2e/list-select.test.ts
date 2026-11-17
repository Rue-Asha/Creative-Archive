import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, cardTitles, cards, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const bar = (page: Page) => page.getByRole('region', { name: 'Selection', exact: true });
const select = (page: Page) => page.locator('main').getByRole('button', { name: 'Select', exact: true });
const toggle = (page: Page, title: string) => page.getByRole('button', { name: title, exact: true });
const toast = (page: Page, text: string) => page.getByRole('status').filter({ hasText: text });
const dialog = (page: Page) => page.getByRole('dialog');

async function enter(page: Page) {
	await select(page).click();
	await expect(bar(page)).toBeVisible();
}

// Desktop: the bar's own button. Phone: the main action is a button, the rest sit behind "More".
async function run(page: Page, name: string) {
	const direct = bar(page).getByRole('button', { name, exact: true });
	if ((await direct.count()) > 0) return direct.click();
	await bar(page).getByRole('button', { name: 'More', exact: true }).click();
	await page.getByRole('menuitem', { name, exact: true }).click();
}

// the actions offered, whichever posture shows them
async function offered(page: Page): Promise<string[]> {
	const names = (await bar(page).getByRole('button').allTextContents()).map((t) => t.trim()).filter((t) => t && t !== 'Done');
	if (!names.includes('More')) return names;
	await bar(page).getByRole('button', { name: 'More', exact: true }).click();
	const more = await page.getByRole('menuitem').allTextContents();
	await page.keyboard.press('Escape');
	return [...names.filter((n) => n !== 'More'), ...more.map((t) => t.trim())];
}

const albums = (statuses: ('done' | 'want' | undefined)[]) => ({
	entries: statuses.map((status, i) => ({
		type: 'album' as const,
		title: `Album ${i + 1}`,
		status,
		createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 100 - i)).toISOString()
	}))
});

test('Scenario: Set status on several entries', async ({ page, request }) => {
	await seed(request, albums(['want', 'want', 'want', 'want']));
	await open(page, '/music/albums');
	await enter(page);
	for (const title of ['Album 1', 'Album 2', 'Album 3']) await toggle(page, title).click();
	await run(page, 'Set status');
	await dialog(page).getByRole('list', { name: 'Status' }).getByRole('button', { name: 'Listened', exact: true }).click();

	await expect(toast(page, 'Status set to Listened for 3 entries')).toBeVisible();
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(cards(page).filter({ hasText: 'Listened' })).toHaveCount(3);
	await expect(cards(page).filter({ hasText: 'Want to listen' })).toHaveText(/Album 4/);
});

test('Scenario: Add and remove a tag on several entries', async ({ page, request }) => {
	await seed(request, {
		entries: ['Book 1', 'Book 2', 'Book 3'].map((title, i) => ({
			type: 'book' as const,
			title,
			createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, 100 - i)).toISOString()
		}))
	});
	await open(page, '/books/books');
	await enter(page);
	for (const title of ['Book 1', 'Book 2', 'Book 3']) await toggle(page, title).click();
	await run(page, 'Add tag');
	await dialog(page).getByRole('textbox', { name: 'Tag' }).fill('Summer');
	await dialog(page).getByRole('textbox', { name: 'Tag' }).press('Enter');
	await expect(toast(page, 'Tag added to 3 entries')).toBeVisible();

	await toggle(page, 'Book 3').click();
	await expect(bar(page)).toContainText('2 selected');
	await run(page, 'Remove tag');
	await dialog(page).getByRole('list', { name: 'Tags on the selection' }).getByRole('button', { name: /Summer/ }).click();
	await expect(toast(page, 'Tag removed from 2 entries')).toBeVisible();

	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await page.getByRole('combobox', { name: 'Tag', exact: true }).selectOption({ label: 'Summer' });
	await expect(cardTitles(page)).toHaveText(['Book 3']);
});

test('Scenario: Shift-click selects a range on the desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'shift-click is a desktop pointer gesture');
	await page.setViewportSize({ width: 1280, height: 800 });
	await seed(request, albums([undefined, undefined, undefined, undefined, undefined, undefined]));
	await open(page, '/music/albums');
	await enter(page);
	await toggle(page, 'Album 2').click();
	await toggle(page, 'Album 5').click({ modifiers: ['Shift'] });

	await expect(bar(page)).toContainText('4 selected');
	const pressed = cards(page).getByRole('button', { pressed: true });
	await expect(pressed).toHaveText(['Album 2', 'Album 3', 'Album 4', 'Album 5']);
});

test('Scenario: Only valid actions are offered', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'brand', title: 'Maison', createdAt: '2026-01-02T10:00:00.000Z' },
			{ type: 'site', title: 'Web Zine', kind: 'site', createdAt: '2026-01-01T10:00:00.000Z' },
			{ type: 'piece', title: 'Coat', status: 'owned', createdAt: '2026-01-02T10:00:00.000Z' },
			{ type: 'piece', title: 'Scarf', status: 'wishlist', createdAt: '2026-01-01T10:00:00.000Z' }
		]
	});
	await open(page, '/fashion/brands-shops');
	await enter(page);
	await toggle(page, 'Maison').click();
	await toggle(page, 'Web Zine').click();
	const sorted = (await offered(page)).sort();
	expect(sorted).toEqual(['Add tag', 'Remove tag']);

	await open(page, '/fashion/pieces');
	await enter(page);
	await toggle(page, 'Coat').click();
	await toggle(page, 'Scarf').click();
	expect(await offered(page)).toContain('Set status');
	await run(page, 'Set status');
	await expect(dialog(page).getByRole('list', { name: 'Status' }).getByRole('button')).toHaveText(['Wishlist', 'Owned', 'Gone']);
});

test('Scenario: Nothing selected disables the actions', async ({ page, request }) => {
	await seed(request, albums(['want', 'want']));
	await open(page, '/music/albums');
	await enter(page);

	await expect(bar(page)).toContainText('0 selected');
	const actions = bar(page).getByRole('button').filter({ hasNotText: 'Done' });
	expect(await actions.count()).toBeGreaterThan(0);
	for (const action of await actions.all()) await expect(action).toBeDisabled();
	await expect(bar(page).getByRole('button', { name: 'Done', exact: true })).toBeEnabled();
});

test('Scenario: Failed bulk action keeps every value', async ({ page, request }) => {
	await seed(request, albums(['want', 'want', 'want']));
	await page.route(/\?\/bulkStatus/, (route) =>
		route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ type: 'failure', status: 400, data: '[{"errors":1},{"status":2},"Invalid status"]' }) })
	);
	await open(page, '/music/albums');
	await enter(page);
	for (const title of ['Album 1', 'Album 2', 'Album 3']) await toggle(page, title).click();
	await run(page, 'Set status');
	await dialog(page).getByRole('list', { name: 'Status' }).getByRole('button', { name: 'Listened', exact: true }).click();

	await expect(toast(page, "Couldn't update 3 entries — try again")).toBeVisible();
	await expect(bar(page)).toContainText('3 selected');
	await page.unroute(/\?\/bulkStatus/);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	await expect(cards(page).filter({ hasText: 'Want to listen' })).toHaveCount(3);
});

test('Scenario: Escape and Done leave Select mode by keyboard', async ({ page, request }) => {
	await seed(request, albums(['want', 'want', 'want']));
	for (const leave of ['Escape', 'Done']) {
		await open(page, '/music/albums');
		await page.locator('main').getByRole('button', { name: 'Select', exact: true }).focus();
		await page.keyboard.press('Enter');
		await expect(bar(page)).toBeVisible();
		await toggle(page, 'Album 1').focus();
		await page.keyboard.press('Space');
		await toggle(page, 'Album 2').focus();
		await page.keyboard.press('Space');
		await expect(bar(page)).toContainText('2 selected');

		if (leave === 'Escape') await page.keyboard.press('Escape');
		else {
			await bar(page).getByRole('button', { name: 'Done', exact: true }).focus();
			await page.keyboard.press('Enter');
		}
		await expect(bar(page)).toHaveCount(0);
		await expect(cards(page).getByRole('button', { pressed: true })).toHaveCount(0);
		await cards(page).getByRole('link', { name: 'Album 1', exact: true }).click();
		await expect(page).toHaveURL(/\/entries\/\d+$/);
	}
});

test('Scenario: Selection bar announces the count', async ({ page, request }) => {
	await seed(request, albums(['want', 'want', 'want']));
	await open(page, '/music/albums');
	await enter(page);
	const count = bar(page).getByRole('status');

	await expect(count).toHaveAttribute('role', 'status');
	await expect(count).toHaveText('0 selected');
	await toggle(page, 'Album 1').click();
	await expect(count).toHaveText('1 selected');
	await expect(toggle(page, 'Album 1')).toBeFocused();
	await toggle(page, 'Album 2').click();
	await expect(count).toHaveText('2 selected');

	// a bulk action's toast is a second polite region and does not take focus
	await run(page, 'Set status');
	await dialog(page).getByRole('list', { name: 'Status' }).getByRole('button', { name: 'Listened', exact: true }).click();
	const done = toast(page, 'Status set to Listened for 2 entries');
	await expect(done).toBeVisible();
	expect(await done.evaluate((el) => el.contains(document.activeElement))).toBe(false);
	await expect(count).toHaveText('2 selected');
});

test('Scenario: Selection bar docks on the phone', async ({ page, request }) => {
	await seed(request, albums(Array.from({ length: 14 }, () => 'want' as const)));
	await page.setViewportSize({ width: 390, height: 844 });
	await open(page, '/music/albums');
	await enter(page);
	for (const title of ['Album 1', 'Album 2', 'Album 3']) await toggle(page, title).click();
	await page.mouse.wheel(0, 600);
	await page.evaluate(() => window.scrollBy(0, 600));

	await expect(bar(page)).toContainText('3 selected');
	const box = (await bar(page).boundingBox())!;
	expect(box.y + box.height).toBeLessThanOrEqual(844);
	expect(box.y + box.height).toBeGreaterThan(844 - 40);
	await expect(bar(page).getByRole('button', { name: 'Set status', exact: true })).toBeVisible();
	await bar(page).getByRole('button', { name: 'More', exact: true }).click();
	const menu = page.getByRole('menu', { name: 'More actions' });
	await expect(menu.getByRole('menuitem')).toHaveText(['Add tag', 'Remove tag']);
	expect(await menu.evaluate((el) => !el.closest('.frame') && el.matches(':popover-open'))).toBe(true);
	await page.keyboard.press('Escape');

	await page.setViewportSize({ width: 1280, height: 800 });
	await expect(bar(page).getByRole('button', { name: 'More', exact: true })).toHaveCount(0);
	for (const name of ['Set status', 'Add tag', 'Remove tag']) await expect(bar(page).getByRole('button', { name, exact: true })).toBeVisible();
	expect(await bar(page).evaluate((el) => getComputedStyle(el.parentElement!).position)).toBe('sticky');
	await page.evaluate(() => window.scrollBy(0, 400));
	const top = (await bar(page).boundingBox())!.y;
	expect(top).toBeGreaterThanOrEqual(0);
	expect(top).toBeLessThan(140);
});

test('Selectable cards turn the title into a toggle with a charcoal ring and a check', async ({ page, request }) => {
	await seed(request, albums(['want', 'want']));
	await open(page, '/music/albums');
	const card = cards(page).filter({ hasText: 'Album 1' });
	await expect(card.getByRole('link', { name: 'Album 1', exact: true })).toHaveCount(1);
	await enter(page);

	await expect(card.getByRole('link')).toHaveCount(0);
	const title: Locator = card.getByRole('button', { name: 'Album 1', exact: true });
	await expect(title).toHaveAttribute('aria-pressed', 'false');
	await expect(card.locator('.tick svg')).toHaveCount(0);
	await title.click();
	await expect(title).toHaveAttribute('aria-pressed', 'true');
	await expect(card.locator('.tick svg')).toHaveCount(1);
	const ring = await card.evaluate((el) => {
		const s = getComputedStyle(el);
		const probe = document.createElement('span');
		probe.style.color = 'var(--ink)';
		el.append(probe);
		const ink = getComputedStyle(probe).color;
		probe.remove();
		return { style: s.outlineStyle, color: s.outlineColor, ink };
	});
	expect(ring.style).toBe('solid');
	expect(ring.color).toBe(ring.ink);
	await title.click();
	await expect(title).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Select mode moves focus in and back out', async ({ page, request }) => {
	await seed(request, albums(['want', 'want', 'want']));
	await open(page, '/music/albums');
	for (const leave of ['Escape', 'Done']) {
		await select(page).focus();
		await page.keyboard.press('Enter');
		await expect(bar(page)).toBeVisible();
		await expect(toggle(page, 'Album 1')).toBeFocused();
		if (leave === 'Escape') await page.keyboard.press('Escape');
		else await bar(page).getByRole('button', { name: 'Done', exact: true }).click();
		await expect(bar(page)).toHaveCount(0);
		await expect(select(page)).toBeFocused();
	}
});

test('Scenario: Another list leaves Select mode', async ({ page, request }) => {
	await seed(request, { entries: [...albums(['want', 'want']).entries, { type: 'artist' as const, title: 'Artist 1' }] });
	await open(page, '/music/albums');
	await enter(page);
	await toggle(page, 'Album 1').click();
	await expect(bar(page)).toContainText('1 selected');

	const subTypes = page.getByRole('navigation', { name: 'Sub-types' });
	await subTypes.getByRole('link', { name: 'Artists', exact: true }).click();
	await expect(page).toHaveURL(/\/music\/artists$/);
	await expect(bar(page)).toHaveCount(0);
	await expect(select(page)).toBeVisible();
	await expect(cards(page).getByRole('link', { name: 'Artist 1', exact: true })).toBeVisible();

	await subTypes.getByRole('link', { name: 'Albums', exact: true }).click();
	await expect(page).toHaveURL(/\/music\/albums$/);
	await expect(bar(page)).toHaveCount(0);
	await expect(select(page)).toBeVisible();
	await expect(cards(page).getByRole('button', { pressed: true })).toHaveCount(0);
	await expect(cards(page).getByRole('link', { name: 'Album 1', exact: true })).toBeVisible();
});

test('Scenario: A filter drops the picks it hides', async ({ page, request }) => {
	await seed(request, albums(['done', 'want']));
	await open(page, '/music/albums');
	await enter(page);
	await toggle(page, 'Album 1').click();
	await toggle(page, 'Album 2').click();
	await expect(bar(page)).toContainText('2 selected');

	const status = page.getByRole('toolbar', { name: 'Filters' }).getByRole('combobox', { name: 'Status', exact: true });
	await status.selectOption({ label: 'Listened' });
	await expect(page).toHaveURL(/status=done/);
	await expect(cardTitles(page)).toHaveText(['Album 1']);
	await expect(bar(page)).toContainText('1 selected');

	await status.selectOption({ label: 'All' });
	await expect(cardTitles(page)).toHaveCount(2);
	await expect(bar(page)).toContainText('1 selected');
	await expect(toggle(page, 'Album 1')).toHaveAttribute('aria-pressed', 'true');
	await expect(toggle(page, 'Album 2')).toHaveAttribute('aria-pressed', 'false');
});

test('Scenario: Focused card clears the docked bar', async ({ page, request }) => {
	test.skip(test.info().project.name !== 'phone');
	await seed(request, albums(Array.from({ length: 12 }, () => 'want' as const)));
	await open(page, '/music/albums');
	await enter(page);
	await toggle(page, 'Album 1').click();
	const dock = (await bar(page).boundingBox())!;
	expect(dock.y + dock.height).toBeGreaterThan(700);

	for (let i = 2; i <= 12; i++) {
		await page.keyboard.press('Tab');
		const focused = toggle(page, `Album ${i}`);
		await expect(focused).toBeFocused();
		const card = (await cards(page).filter({ has: focused }).boundingBox())!;
		expect(card.y + card.height, `Album ${i}`).toBeLessThanOrEqual(dock.y);
	}

	// picked: an inner ring and a fill; focused but not picked: neither, the focus ring sits outside the card
	const look = (title: string) =>
		cards(page)
			.filter({ has: toggle(page, title) })
			.evaluate((el) => {
				const s = getComputedStyle(el);
				const after = getComputedStyle(el.querySelector('[data-pick]')!, '::after');
				return { ring: s.outlineStyle, inset: parseFloat(s.outlineOffset), fill: s.backgroundColor, focusRing: after.outlineStyle, focusOffset: parseFloat(after.outlineOffset) };
			});
	const picked = await look('Album 1');
	const focused = await look('Album 12');
	expect(picked.ring).toBe('solid');
	expect(picked.inset).toBeLessThan(0);
	expect(focused.ring).toBe('none');
	expect(focused.fill).not.toBe(picked.fill);
	expect(focused.focusRing).toBe('solid');
	expect(focused.focusOffset).toBeGreaterThan(0);
});
