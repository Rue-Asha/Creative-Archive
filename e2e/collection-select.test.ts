import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, recordSaves, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const bar = (page: Page) => page.getByRole('region', { name: 'Selection', exact: true });
const rows = (page: Page) => page.getByRole('region', { name: 'In order' }).getByRole('listitem');
const toast = (page: Page, text: string) => page.getByRole('status').filter({ hasText: text });
const pick = (page: Page, title: string) => page.getByRole('region', { name: 'In order' }).getByRole('button', { name: title, exact: true });

async function reloaded(page: Page) {
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	return rows(page).getByRole('link').allTextContents();
}

async function enter(page: Page, titles = ['A', 'B', 'C', 'D', 'E']) {
	const result = await seed(page.context().request, {
		entries: titles.map((title) => ({ type: 'album' as const, title })),
		collections: [{ name: 'Moodboard', entries: titles.map((_, i) => i) }]
	});
	await open(page, `/collections/${result.collections[0]}`);
	await page.locator('main').getByRole('button', { name: 'Select', exact: true }).click();
	await expect(bar(page)).toBeVisible();
	return result;
}

// Desktop: the bar's own button. Phone: the main action is a button, the rest sit behind "More".
async function run(page: Page, name: string) {
	const direct = bar(page).getByRole('button', { name, exact: true });
	if ((await direct.count()) > 0) return direct.click();
	await bar(page).getByRole('button', { name: 'More', exact: true }).click();
	await page.getByRole('menuitem', { name, exact: true }).click();
}

test('Scenario: Move several to the top keeps their order', async ({ page }) => {
	const saved = countSaves(page);
	const sent = recordSaves(page);
	await enter(page);
	await pick(page, 'D').click();
	await pick(page, 'B').click();
	await expect(bar(page)).toContainText('2 selected');
	await run(page, 'Move to top');

	await expect(toast(page, '2 entries moved to the top')).toBeVisible();
	await saved(1);
	expect(sent()).toHaveLength(1);
	expect(sent()[0]).toMatch(/^reorder ids=\d+,\d+,\d+,\d+,\d+$/);
	expect(await reloaded(page)).toEqual(['B', 'D', 'A', 'C', 'E']);
});

test("Scenario: A move's toast waits for its save", async ({ page }) => {
	const statuses: number[] = [];
	page.on('response', (res) => res.url().includes('?/reorder') && statuses.push(res.status()));
	const { entries, collections } = await enter(page);
	await page.request.post(`/collections/${collections[0]}?/removeMany`, {
		form: { ids: String(entries[4]) },
		headers: { accept: 'application/json', 'x-sveltekit-action': 'true', origin: new URL(page.url()).origin }
	});
	await pick(page, 'B').click();
	await pick(page, 'D').click();
	// a later toast can replace an earlier one, so every text the page ever announced is kept
	await page.evaluate(() => {
		const said: string[] = [];
		(window as unknown as { __said: string[] }).__said = said;
		new MutationObserver(() => document.querySelectorAll('[role="status"], [aria-live]').forEach((n) => said.push(n.textContent ?? ''))).observe(document.body, {
			subtree: true,
			childList: true,
			characterData: true
		});
	});
	await run(page, 'Move to top');

	await expect(toast(page, 'This collection changed in another tab — reloaded')).toBeVisible();
	expect(statuses).toEqual([409]);
	await page.waitForTimeout(400);
	const said = await page.evaluate(() => (window as unknown as { __said: string[] }).__said.join('|'));
	expect(said).toContain('This collection changed in another tab');
	expect(said).not.toContain('moved to the top');
});

test('Scenario: Select mode in a collection moves focus in and back out', async ({ page, request }) => {
	const { collections } = await seed(request, {
		entries: ['A', 'B', 'C'].map((title) => ({ type: 'album' as const, title })),
		collections: [{ name: 'Moodboard', entries: [0, 1, 2] }]
	});
	await open(page, `/collections/${collections[0]}`);
	const select = page.locator('main').getByRole('button', { name: 'Select', exact: true });
	await select.focus();
	await page.keyboard.press('Enter');
	await expect(bar(page)).toBeVisible();
	await expect(pick(page, 'A')).toBeFocused();
	await page.keyboard.press('Escape');
	await expect(bar(page)).toHaveCount(0);
	await expect(select).toBeFocused();
});

test('Scenario: Move several before another entry', async ({ page }) => {
	const saved = countSaves(page);
	await enter(page);
	await pick(page, 'A').click();
	await pick(page, 'E').click();
	await run(page, 'Move before…');
	const chooser = page.getByRole('dialog', { name: 'Move 2 entries before…' });
	await expect(chooser.getByRole('button', { name: /^\d+ A$/ })).toHaveCount(0);
	await chooser.getByRole('list', { name: 'Target entry' }).getByRole('button', { name: /C$/ }).click();

	await expect(page.getByRole('dialog')).toHaveCount(0);
	await expect(toast(page, '2 entries moved')).toBeVisible();
	await saved(1);
	expect(await reloaded(page)).toEqual(['B', 'A', 'E', 'C', 'D']);
});

test('Scenario: Move to bottom with everything selected', async ({ page }) => {
	const saved = countSaves(page);
	await enter(page, ['A', 'B', 'C']);
	for (const title of ['A', 'B', 'C']) await pick(page, title).click();
	await expect(bar(page)).toContainText('3 selected');
	await run(page, 'Move to bottom');

	await expect(toast(page, '3 entries moved to the bottom')).toBeVisible();
	await saved(1);
	expect(await reloaded(page)).toEqual(['A', 'B', 'C']);
});

test('Scenario: Remove several from the collection', async ({ page, request }) => {
	const saved = countSaves(page);
	const sent = recordSaves(page);
	const { entries } = await enter(page, ['A', 'B', 'C']);
	await pick(page, 'B').click();
	await pick(page, 'C').click();
	await run(page, 'Remove from collection');

	await expect(toast(page, '2 entries removed from this collection')).toBeVisible();
	await expect(page.getByLabel('1 entry', { exact: true })).toHaveText('1');
	await saved(1);

	await pick(page, 'A').click();
	await run(page, 'Remove from collection');
	await expect(page.getByLabel('0 entries', { exact: true })).toHaveText('0');
	await expect(page.getByRole('heading', { name: 'Nothing in here yet' })).toBeVisible();
	await saved(2);
	expect(sent()).toEqual([`removeMany ids=${entries[1]},${entries[2]}`, `removeMany ids=${entries[0]}`]);
	for (const entry of entries) expect((await request.get(`/entries/${entry}`)).status()).toBe(200);
});
