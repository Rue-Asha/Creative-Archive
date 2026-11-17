import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, openEntryMenu, openSection, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const insideDialog = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('dialog, [role="dialog"], [role="alertdialog"]'));

// Tab twice (more than the dialog has controls would wrap), then Shift+Tab: focus must stay inside the open dialog.
async function trapsFocus(page: Page) {
	expect(await insideDialog(page)).toBe(true);
	for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab']) {
		await page.keyboard.press(key);
		expect(await insideDialog(page), key).toBe(true);
	}
}

test('Scenario: Every dialog traps focus and returns it', async ({ page, request }) => {
	const {
		entries: [album],
		collections: [collection]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [{ name: 'Moodboard', entries: [0] }]
	});

	await open(page, `/entries/${album}`);
	await openEntryMenu(page);
	const del = page.getByRole('menuitem', { name: 'Delete', exact: true });
	await del.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('alertdialog', { name: /Delete this/ })).toBeVisible();
	await trapsFocus(page);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('alertdialog')).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Entry menu' })).toBeFocused();

	const add = page.getByRole('button', { name: 'Add to collection' });
	await add.focus();
	await page.keyboard.press('Enter');
	await page.getByRole('menuitem', { name: 'New collection' }).click();
	await expect(page.getByRole('dialog', { name: 'New collection' }).getByLabel('Name')).toBeFocused();
	await trapsFocus(page);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(add).toBeFocused();

	await open(page, `/collections/${collection}`);
	const delCollection = page.getByRole('button', { name: 'Delete collection' });
	await delCollection.focus();
	await page.keyboard.press('Enter');
	await expect(page.getByRole('alertdialog', { name: 'Delete this collection?' })).toBeVisible();
	await trapsFocus(page);
	await page.keyboard.press('Escape');
	await expect(page.getByRole('alertdialog')).toHaveCount(0);
	await expect(delCollection).toBeFocused();

	await open(page, '/add/book?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Half written');
	await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
	await openSection(page, 'Music');
	const alert = page.getByRole('alertdialog', { name: 'Discard changes?' });
	await expect(alert).toBeVisible();
	await trapsFocus(page);
	await page.keyboard.press('Escape');
	await expect(alert).toHaveCount(0);
	await expect(page).toHaveURL(/\/add\/book/);
	await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Half written');
});

test('Scenario: Delete confirmations are alert sheets', async ({ page, request }, info) => {
	const {
		entries: [album],
		collections: [collection]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [{ name: 'Moodboard', entries: [0] }]
	});
	const shape = (sheet: Locator) =>
		sheet.evaluate((el) => {
			const r = el.getBoundingClientRect();
			const s = getComputedStyle(el);
			return {
				left: Math.round(r.left),
				right: Math.round(innerWidth - r.right),
				bottom: Math.round(innerHeight - r.bottom),
				top: [s.borderTopLeftRadius, s.borderTopRightRadius].map(parseFloat),
				foot: [s.borderBottomLeftRadius, s.borderBottomRightRadius].map(parseFloat)
			};
		});
	const check = async (sheet: Locator) => {
		const got = await shape(sheet);
		expect(got.top.every((r) => r > 0), 'top corners rounded').toBe(true);
		if (info.project.name === 'phone') {
			expect([got.left, got.right, got.bottom]).toEqual([0, 0, 0]);
			expect(got.foot).toEqual([0, 0]);
		} else {
			expect(Math.abs(got.left - got.right), 'centred').toBeLessThanOrEqual(1);
			expect(got.left).toBeGreaterThan(0);
			expect(got.foot.every((r) => r > 0), 'bottom corners rounded').toBe(true);
		}
	};

	await open(page, `/entries/${album}`);
	await openEntryMenu(page);
	await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
	const entry = page.getByRole('alertdialog', { name: 'Delete this album?' });
	await expect(entry).toBeVisible();
	await check(entry);
	await page.keyboard.press('Escape');
	await expect(entry).toHaveCount(0);

	await open(page, `/collections/${collection}`);
	await page.getByRole('button', { name: 'Delete collection' }).click();
	const sheet = page.getByRole('alertdialog', { name: 'Delete this collection?' });
	await expect(sheet).toBeVisible();
	await check(sheet);
});

async function keyboardModel(page: Page, trigger: Locator, menu: Locator, items: Locator, first: Locator) {
	await trigger.focus();
	await page.keyboard.press('Enter');
	await expect(menu).toBeVisible();
	await expect(first).toBeFocused();
	const count = await items.count();
	await page.keyboard.press('End');
	await expect(items.nth(count - 1)).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(items.nth(0)).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(items.nth(count - 1)).toBeFocused();
	await page.keyboard.press('Home');
	await expect(items.nth(0)).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
	await expect(trigger).toBeFocused();

	await page.keyboard.press('Enter');
	await expect(menu).toBeVisible();
	await expect(first).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(menu).toBeHidden();
}

test('Scenario: Menus keep the keyboard model', async ({ page, request }) => {
	const {
		entries: [album]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde', status: 'progress' }],
		collections: [
			{ name: 'Moodboard', entries: [] },
			{ name: 'Autumn', entries: [0] }
		]
	});
	await open(page, `/entries/${album}`);

	const status = page.getByRole('menu', { name: 'Status' });
	await keyboardModel(
		page,
		page.getByRole('button', { name: /^Status:/ }),
		status,
		status.getByRole('menuitemradio'),
		status.getByRole('menuitemradio', { checked: true })
	);

	const collections = page.getByRole('menu', { name: 'Add to collection' });
	await keyboardModel(
		page,
		page.getByRole('button', { name: 'Add to collection' }),
		collections,
		collections.getByRole('menuitemcheckbox').or(collections.getByRole('menuitem')),
		collections.getByRole('menuitemcheckbox', { checked: true })
	);

	await open(page, '/music');
	const domain = page.getByRole('menu', { name: 'Add to Music' });
	await keyboardModel(
		page,
		page.getByRole('main').getByRole('button', { name: 'Add', exact: true }),
		domain,
		domain.getByRole('menuitem'),
		domain.getByRole('menuitem').first()
	);
});

const inToast = (page: Page) => page.evaluate(() => !!document.activeElement?.closest('[role="status"], [role="alert"]'));

test('Scenario: Toasts are announced without taking focus', async ({ page, request }) => {
	await open(page, '/add/album?manual=1');
	await expect(page.locator('[role="status"][aria-live="polite"]')).toBeAttached();

	await page.getByLabel('Title', { exact: true }).fill('Ctrl');
	const save = page.getByRole('button', { name: 'Save' });
	await save.focus();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(/\/entries\/\d+$/);
	const saved = page.getByRole('status').filter({ hasText: 'Saved' });
	await expect(saved).toBeVisible();
	expect(await inToast(page)).toBe(false);

	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	await openEntryMenu(page);
	await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
	await page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click();
	await expect(page).toHaveURL(/\/music\/albums$/);
	await expect(page.getByRole('status').filter({ hasText: 'Deleted' })).toBeVisible();
	expect(await inToast(page)).toBe(false);

	await seed(request, { entries: [{ type: 'album', title: 'One', status: 'want' }, { type: 'album', title: 'Two', status: 'want' }] });
	await open(page, '/music/albums');
	await page.locator('main').getByRole('button', { name: 'Select', exact: true }).click();
	await page.getByRole('button', { name: 'One', exact: true }).click();
	await page.getByRole('button', { name: 'Two', exact: true }).click();
	const selection = page.getByRole('region', { name: 'Selection', exact: true });
	const direct = selection.getByRole('button', { name: 'Set status', exact: true });
	await direct.click();
	await page.getByRole('dialog').getByRole('button', { name: 'Listened', exact: true }).click();
	await expect(page.getByRole('status').filter({ hasText: 'Status set to Listened for 2 entries' })).toBeVisible();
	expect(await inToast(page)).toBe(false);
});
