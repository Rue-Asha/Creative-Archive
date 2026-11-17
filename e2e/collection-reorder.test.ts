import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const csrf = { status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'Cross-site POST form submissions are forbidden' }) };
const rows = (page: Page) => page.getByRole('region', { name: 'In order' }).getByRole('listitem');
const order = (page: Page) => rows(page).getByRole('link').allTextContents();
const toast = (page: Page, text: string) => page.getByRole('status').filter({ hasText: text });
const wide = (page: Page) => page.viewportSize()!.width >= 1024;

async function seedAbc(request: Parameters<typeof seed>[0], titles = ['A', 'B', 'C']) {
	const result = await seed(request, {
		entries: titles.map((title) => ({ type: 'album' as const, title })),
		collections: [{ name: 'Moodboard', entries: titles.map((_, i) => i) }]
	});
	return result.collections[0];
}

// the desktop's Move button or, on narrower screens, the row menu's item
async function move(page: Page, title: string, dir: 'up' | 'down') {
	if (wide(page)) return page.getByRole('button', { name: `Move ${title} ${dir}`, exact: true }).click();
	await page.getByRole('button', { name: `Actions for ${title}`, exact: true }).click();
	await page.getByRole('menuitem', { name: `Move ${dir}`, exact: true }).click();
}

test('Scenario: Drag reorders on the desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'dragging needs a fine pointer');
	await page.setViewportSize({ width: 1280, height: 800 });
	const id = await seedAbc(request);
	const saved = countSaves(page);
	await open(page, `/collections/${id}`);
	const grip = rows(page).nth(2).locator('[data-grip]');
	const from = (await grip.boundingBox())!;
	const top = (await rows(page).nth(0).boundingBox())!;
	await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
	await page.mouse.down();
	await page.mouse.move(from.x + from.width / 2, top.y + 4, { steps: 12 });
	await page.mouse.up();

	await saved(1);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	expect(await order(page)).toEqual(['C', 'A', 'B']);
});

test('Scenario: Move up and down reorder by keyboard and touch', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'starts with a tap on the phone');
	const id = await seedAbc(request);
	const saved = countSaves(page);
	await open(page, `/collections/${id}`);
	await page.getByRole('button', { name: 'Actions for B', exact: true }).tap();
	await page.getByRole('menuitem', { name: 'Move down', exact: true }).tap();
	await expect.poll(() => order(page)).toEqual(['A', 'C', 'B']);
	await expect(page.getByRole('button', { name: 'Actions for B', exact: true })).toBeFocused();
	await saved(1);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	expect(await order(page)).toEqual(['A', 'C', 'B']);

	await page.setViewportSize({ width: 1280, height: 800 });
	const up = page.getByRole('button', { name: 'Move B up', exact: true });
	await up.focus();
	await page.keyboard.press('Enter');
	await expect.poll(() => order(page)).toEqual(['A', 'B', 'C']);
	await expect(page.getByRole('button', { name: 'Move B up', exact: true })).toBeFocused();
	await saved(2);
	await page.reload();
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
	expect(await order(page)).toEqual(['A', 'B', 'C']);
});

test('Scenario: Phone rows use a row menu and no drag handle', async ({ page, request }, info) => {
	const id = await seedAbc(request);
	const touch = info.project.name === 'phone';
	await open(page, `/collections/${id}`);
	await page.setViewportSize({ width: 390, height: 844 });
	for (const [title, items] of [
		['A', ['Move down', 'Remove']],
		['B', ['Move up', 'Move down', 'Remove']],
		['C', ['Move up', 'Remove']]
	] as const) {
		await expect(page.getByRole('button', { name: `Actions for ${title}`, exact: true })).toHaveCount(1);
		await page.getByRole('button', { name: `Actions for ${title}`, exact: true }).click();
		await expect(page.getByRole('menu', { name: `Actions for ${title}` }).getByRole('menuitem')).toHaveText([...items]);
		await page.keyboard.press('Escape');
	}
	await expect(page.getByRole('button', { name: /^Move .* (up|down)$/ })).toHaveCount(0);
	if (touch) await expect(page.locator('[data-grip]:visible')).toHaveCount(0);

	await page.setViewportSize({ width: 1280, height: 800 });
	await expect(page.getByRole('button', { name: /^Actions for/ })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Move A down', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Move A up', exact: true })).toHaveCount(0);
	await expect(page.getByRole('button', { name: 'Move C down', exact: true })).toHaveCount(0);
	if (!touch) await expect(page.locator('[data-grip]:visible')).toHaveCount(3);
});

test("Scenario: Select is the collection page's primary action", async ({ page, request }) => {
	const id = await seedAbc(request);
	await open(page, `/collections/${id}`);
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		const main = page.locator('main');
		await expect(main.locator('.btn.primary')).toHaveCount(1);
		const select = main.getByRole('button', { name: 'Select', exact: true });
		await expect(select).toHaveClass(/(^|\s)primary(\s|$)/);
		await expect(select).toHaveClass(/(^|\s)arrow(\s|$)/);
		await expect(main.getByRole('button', { name: 'Rename', exact: true })).toHaveClass(/secondary/);
		const del = main.getByRole('button', { name: 'Delete collection', exact: true });
		await expect(del).toHaveClass(/danger/);
		await expect(del).not.toBeFocused();
	}
});

test('Scenario: Failed reorder restores the order', async ({ page, request }) => {
	const id = await seedAbc(request);
	await page.route(/\?\/reorder$/, (route) => route.fulfill(csrf));
	await open(page, `/collections/${id}`);
	await move(page, 'A', 'down');

	await expect(toast(page, "Couldn't save — try again")).toBeVisible();
	await expect.poll(() => order(page)).toEqual(['A', 'B', 'C']);
});

test('Scenario: Changed elsewhere reloads politely', async ({ page, request }) => {
	const {
		entries: [, , , extra],
		collections: [id]
	} = await seed(request, {
		entries: ['A', 'B', 'C', 'D'].map((title) => ({ type: 'album' as const, title })),
		collections: [{ name: 'Moodboard', entries: [0, 1, 2] }]
	});
	const statuses: number[] = [];
	page.on('response', (res) => res.url().includes('?/reorder') && statuses.push(res.status()));
	await open(page, `/collections/${id}`);
	const added = await request.post(`/entries/${extra}?/collect`, { form: { collectionId: String(id) }, headers: { accept: 'application/json', 'x-sveltekit-action': 'true', origin: new URL(page.url()).origin } });
	expect(added.ok()).toBe(true);
	await move(page, 'A', 'down');

	await expect(toast(page, 'This collection changed in another tab — reloaded')).toBeVisible();
	await expect.poll(() => order(page)).toEqual(['A', 'B', 'C', 'D']);
	expect(statuses).toEqual([409]);
});

test('Scenario: A move is announced', async ({ page, request }) => {
	const id = await seedAbc(request);
	await page.setViewportSize({ width: 1280, height: 800 });
	await open(page, `/collections/${id}`);
	const down = page.getByRole('button', { name: 'Move B down', exact: true });
	await down.focus();
	await page.keyboard.press('Enter');

	await expect.poll(() => order(page)).toEqual(['A', 'C', 'B']);
	const said = page.locator('main [aria-live="polite"]').filter({ hasText: 'B moved to 3 of 3' });
	await expect(said).toHaveCount(1);
	await expect(said).toHaveText('B moved to 3 of 3');
	await expect(page.getByRole('button', { name: 'Move B up', exact: true })).toBeFocused();
});

test('a retried move is announced again with the same words', async ({ page, request }) => {
	const id = await seedAbc(request);
	await page.setViewportSize({ width: 1280, height: 800 });
	let fail = true;
	await page.route(/\?\/reorder$/, (route) => {
		if (!fail) return route.fallback();
		fail = false;
		return route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ type: 'error', error: { message: 'Internal Error' } }) });
	});
	await open(page, `/collections/${id}`);
	// every text the live region shows, in order: a screen reader reads a change, never a text that stayed the same
	await page.locator('main [aria-live="polite"]').evaluate((el) => {
		const texts: string[] = [];
		(window as unknown as { said: string[] }).said = texts;
		new MutationObserver(() => texts.push(el.textContent ?? '')).observe(el, { childList: true, characterData: true, subtree: true });
	});
	const said = () => page.evaluate(() => (window as unknown as { said: string[] }).said);
	await page.getByRole('button', { name: 'Move B down', exact: true }).click();
	await expect(toast(page, "Couldn't save — try again")).toBeVisible();
	await expect.poll(() => order(page)).toEqual(['A', 'B', 'C']);
	await expect.poll(said).toEqual(['B moved to 3 of 3']);
	await page.getByRole('button', { name: 'Move B down', exact: true }).click();

	await expect.poll(() => order(page)).toEqual(['A', 'C', 'B']);
	await expect.poll(said).toEqual(['B moved to 3 of 3', '', 'B moved to 3 of 3']);
});

test('Scenario: A failed removal drops the moves queued behind it', async ({ page, request }) => {
	const id = await seedAbc(request);
	await page.setViewportSize({ width: 1280, height: 800 });
	const sent: string[] = [];
	page.on('request', (req) => req.method() === 'POST' && req.url().includes('?/') && sent.push(req.url().split('?/')[1]));
	let release!: () => void;
	const held = new Promise<void>((resolve) => (release = resolve));
	await page.route(/\?\/removeMany$/, async (route) => {
		await held;
		await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ type: 'error', error: { message: 'Internal Error' } }) });
	});
	await open(page, `/collections/${id}`);
	await page.getByRole('button', { name: 'Remove A', exact: true }).click();
	await expect.poll(() => order(page)).toEqual(['B', 'C']);
	await page.getByRole('button', { name: 'Move C up', exact: true }).click();
	await expect.poll(() => order(page)).toEqual(['C', 'B']);
	release();

	await expect(toast(page, "Couldn't save — try again")).toBeVisible();
	await expect.poll(() => order(page)).toEqual(['A', 'B', 'C']);
	await page.waitForTimeout(400);
	expect(sent).toEqual(['removeMany']);
	await expect(toast(page, 'This collection changed in another tab — reloaded')).toHaveCount(0);
});

test('Scenario: A hundred entries stay usable', async ({ page, request }) => {
	const titles = Array.from({ length: 100 }, (_, i) => `Album ${String(i + 1).padStart(3, '0')}`);
	const id = await seedAbc(request, titles);
	const saved = countSaves(page);
	let writes = 0;
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		await open(page, `/collections/${id}`);
		await expect(rows(page)).toHaveCount(100);
		const last = (await order(page))[99];
		await move(page, last, 'up');
		await saved(++writes);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
		await page.reload();
		await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
		expect((await order(page))[98]).toBe(last);
	}
});

test('Scenario: Reduced motion moves instantly', async ({ page, request }) => {
	const id = await seedAbc(request);
	await open(page, `/collections/${id}`);
	await page.evaluate(() => {
		const seen: string[] = [];
		(window as unknown as { __seen: string[] }).__seen = seen;
		new MutationObserver((records) => records.forEach((r) => seen.push(`${r.attributeName}:${(r.target as HTMLElement).getAttribute('style') ?? ''}`))).observe(document.querySelector('ol')!, { attributes: true, attributeFilter: ['style'], subtree: true });
	});
	await move(page, 'B', 'up');

	await expect.poll(() => order(page)).toEqual(['B', 'A', 'C']);
	const moving = await page.evaluate(() =>
		document
			.querySelector('ol')!
			.getAnimations({ subtree: true })
			.filter((a) => (a as CSSTransition).transitionProperty === 'transform' || (a.effect as KeyframeEffect).getKeyframes().some((k) => 'transform' in k || 'translate' in k))
			.length
	);
	expect(moving).toBe(0);
	const seen = await page.evaluate(() => (window as unknown as { __seen: string[] }).__seen);
	expect(seen.filter((s) => s.includes('transform'))).toEqual([]);
});
