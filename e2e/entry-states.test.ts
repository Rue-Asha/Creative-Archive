import { expect, test, type Locator } from '@playwright/test';
import { calm, open, openEntryMenu, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

// the control is on top at its centre: nothing (the phone bar included) covers it
async function reachable(control: Locator) {
	await control.scrollIntoViewIfNeeded();
	const covered = await control.evaluate((el) => {
		const box = el.getBoundingClientRect();
		const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
		return !hit || !(el === hit || el.contains(hit) || hit.contains(el));
	});
	expect(covered).toBe(false);
}

test('Scenario: Phone detail keeps controls in reach with a long title', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	const title = Array.from({ length: 30 }, (_, i) => `word${i}`).join(' ').slice(0, 180);
	const {
		entries: [id]
	} = await seed(request, {
		entries: [{ type: 'manga', title, image: true, status: 'progress', rating: 7, progress: { chapters: { current: 3, total: 40 } } }]
	});
	await open(page, `/entries/${id}`);

	const heading = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
	expect(heading.y).toBeLessThan(844);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
	const main = page.getByRole('main');
	for (const control of [
		main.getByRole('button', { name: /^Status:/ }),
		main.getByRole('spinbutton', { name: 'Rating', exact: true }),
		main.getByRole('group', { name: 'Chapters', exact: true }).getByRole('button', { name: 'Chapters: one more' }),
		main.getByRole('button', { name: 'Add to collection' }),
		main.getByRole('button', { name: 'Entry menu' })
	])
		await reachable(control);
});

test('Scenario: Delete is never the primary action', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });

	for (const [width, height] of [
		[390, 844],
		[1280, 800]
	]) {
		await page.setViewportSize({ width, height });
		await open(page, `/entries/${id}`);
		await expect(page.getByRole('menuitem', { name: 'Delete' })).toBeHidden();
		await openEntryMenu(page);
		const remove = page.getByRole('menuitem', { name: 'Delete' });
		await expect(remove).toBeVisible();
		await expect(page.locator('.btn.primary:has-text("Delete")')).toHaveCount(0);
		const [color, danger] = await remove.evaluate((el) => {
			const probe = document.createElement('span');
			probe.style.color = 'var(--danger)';
			el.append(probe);
			const out = [getComputedStyle(el).color, getComputedStyle(probe).color];
			probe.remove();
			return out;
		});
		expect(color).toBe(danger);
		await expect(remove).not.toBeFocused();
		await remove.click();
		await expect(page.getByRole('alertdialog')).toContainText('Delete this album?');
		await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
	}
});

test('Scenario: Entry without cover shows the placeholder', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood' }] });
	const failed: string[] = [];
	page.on('response', (res) => {
		if (res.url().includes('/images/') && res.status() >= 400) failed.push(res.url());
	});
	page.on('requestfailed', (req) => failed.push(req.url()));
	await open(page, `/entries/${id}`);

	const plate = page.getByRole('img', { name: 'Norwegian Wood', exact: true });
	await expect(plate).toBeVisible();
	await expect(plate).toContainText('NW');
	await expect(page.getByRole('main').locator('img')).toHaveCount(0);
	expect(failed).toEqual([]);
});

test('Scenario: Artist with no works says so', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'artist', title: 'Frank Ocean' }] });
	await open(page, `/entries/${id}`);

	const works = page.getByRole('region', { name: 'Works' });
	await expect(works.getByRole('heading', { name: 'Works' })).toBeVisible();
	await expect(works).toContainText('No works yet');
	await expect(works.getByRole('link')).toHaveCount(0);
});

test('Scenario: Delete is a danger item in the entry menu', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	await openEntryMenu(page);

	const items = page.getByRole('menu', { name: 'Entry menu' }).getByRole('menuitem');
	await expect(items).toHaveText(['Edit', 'Delete']);
	await expect(items.first()).toHaveAttribute('href', `/entries/${id}/edit`);
	const menu = page.getByRole('menu', { name: 'Entry menu' });
	await expect(menu.getByRole('separator')).toHaveCount(1);
	// the menu's own order: Edit, the separator, Delete
	expect(await menu.locator(':scope > *').evaluateAll((els) => els.map((el) => el.getAttribute('role')))).toEqual(['menuitem', 'separator', 'menuitem']);
	const del = items.last();
	const look = await del.evaluate((el) => {
		const probe = document.createElement('span');
		probe.style.color = 'var(--danger)';
		document.body.append(probe);
		const danger = getComputedStyle(probe).color;
		probe.remove();
		const icon = el.querySelector('svg');
		return { color: getComputedStyle(el).color, danger, icon: !!icon && icon.checkVisibility({ visibilityProperty: true }) && icon.getBoundingClientRect().width >= 14 };
	});
	expect(look.color).toBe(look.danger);
	expect(look.icon).toBe(true);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: 'Entry menu' })).toBeFocused();
});

