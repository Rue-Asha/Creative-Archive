import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';

declare global {
	interface Window {
		__overlayAnims: { tag: string; keys: string[]; text?: string; id?: string }[];
	}
}

test.beforeEach(async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'motion timing is the same on every width; the desktop has the Move buttons');
	await reset(request);
	await page.emulateMedia({ reducedMotion: 'no-preference' });
});

// what runs on an element right now: CSS transitions by property, CSS and script animations by their keyframes
const running = (locator: Locator) =>
	locator.evaluate((el) =>
		el.getAnimations().map((a) => ({
			property: (a as CSSTransition).transitionProperty ?? null,
			duration: Number(a.effect?.getComputedTiming().duration ?? 0),
			keys: [...new Set((a.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)))].filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k))
		}))
	);

// --motion-quick in ms; the browser may serialise it as "0.16s"
const quick = (page: Page) =>
	page.evaluate(() => {
		const raw = getComputedStyle(document.documentElement).getPropertyValue('--motion-quick').trim();
		return parseFloat(raw) * (/\ds$/.test(raw) ? 1000 : 1);
	});

// script animations (Svelte's transitions and animate:) leave no trace once done, so record them as they start
async function recordAnimate(page: Page) {
	await page.addInitScript(() => {
		window.__overlayAnims = [];
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, frames, options) {
			const list = Array.isArray(frames) ? frames : [];
			const keys = [...new Set(list.flatMap((k) => Object.keys(k as object)))].filter((k) => !['offset', 'easing', 'composite'].includes(k));
			if (keys.length) window.__overlayAnims.push({ tag: this.tagName, keys, text: this.textContent?.trim(), id: this.id });
			return animate.call(this, frames, options);
		};
	});
}

async function album(page: Page) {
	const {
		entries: [id]
	} = await seed(page.request, { entries: [{ type: 'album', title: 'Blonde', status: 'done' }] });
	await open(page, `/entries/${id}`);
}

test('Scenario: Menus open and close softly', async ({ page }) => {
	await album(page);
	await page.getByRole('button', { name: 'Entry menu' }).click();
	const menu = page.getByRole('menu', { name: 'Entry menu' });
	await expect(menu).toBeVisible();
	const opening = await running(menu);
	const ms = await quick(page);
	for (const property of ['opacity', 'transform']) expect(opening.find((a) => a.property === property)?.duration, property).toBe(ms);

	await expect.poll(() => running(menu)).toEqual([]);
	const closing = page.locator('[popover][aria-label="Entry menu"]');
	await closing.evaluate((el) => {
		window.__overlayAnims = [];
		el.addEventListener('transitionrun', (e) => window.__overlayAnims.push({ tag: el.tagName, keys: [(e as TransitionEvent).propertyName] }));
	});
	await page.keyboard.press('Escape');
	await expect.poll(() => closing.evaluate((el) => ({ hidden: el.getAttribute('aria-hidden'), inert: (el as HTMLElement).inert }))).toEqual({ hidden: 'true', inert: true });
	await expect.poll(() => page.evaluate(() => window.__overlayAnims.flatMap((a) => a.keys))).toContain('opacity');
	await expect(page.getByRole('button', { name: 'Entry menu' })).toBeFocused();
});

test('Scenario: A menu above its button grows from its bottom edge', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 500 });
	const {
		entries: [first],
		collections: [id]
	} = await seed(page.request, {
		entries: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((title) => ({ type: 'album' as const, title })),
		collections: [{ name: 'Moodboard', entries: [0, 1, 2, 3, 4, 5, 6, 7] }]
	});
	// where the menu lies against its button, and the vertical transform origin as a share of the menu's height, as the
	// first painted frame has them (a check can land between the click and that frame)
	const placed = async (button: Locator, menu: Locator) => {
		await expect(menu).toBeVisible();
		await menu.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
		const [b, m] = [(await button.boundingBox())!, (await menu.boundingBox())!];
		const origin = await menu.evaluate((el) => parseFloat(getComputedStyle(el).transformOrigin.split(' ')[1]) / (el as HTMLElement).offsetHeight);
		return { above: m.y + m.height <= b.y + 1, origin: Math.round(origin * 100) / 100 };
	};

	await open(page, `/entries/${first}`);
	const entryButton = page.getByRole('button', { name: 'Entry menu' });
	await entryButton.click();
	expect(await placed(entryButton, page.getByRole('menu', { name: 'Entry menu' }))).toEqual({ above: false, origin: 0 });

	// the row's "…" shows at phone widths, where the Move buttons give way to it
	await page.setViewportSize({ width: 390, height: 500 });
	await open(page, `/collections/${id}`);
	const rowButton = page.getByRole('button', { name: 'Actions for H' });
	// the rows rise into place; a click that lands on a moving button is retried with the page scrolled to its end
	await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
	await rowButton.evaluate((el) => el.scrollIntoView({ block: 'end' }));
	expect((await rowButton.boundingBox())!.y, 'the button sits near the bottom edge').toBeGreaterThan(330);
	await rowButton.click();
	const rowMenu = page.getByRole('menu', { name: 'Actions for H' });
	expect(await placed(rowButton, rowMenu)).toEqual({ above: true, origin: 1 });
});

test('Scenario: Dialogs open softly', async ({ page }) => {
	await album(page);
	await page.getByRole('button', { name: 'Entry menu' }).click();
	await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
	const dialog = page.getByRole('alertdialog', { name: /Delete this/ });
	await expect(dialog).toBeVisible();
	const ms = await quick(page);
	const anims = await running(dialog);
	expect(anims.length).toBeGreaterThan(0);
	for (const a of anims) {
		expect(a.duration).toBeLessThanOrEqual(ms);
		expect(a.keys.every((k) => ['opacity', 'transform'].includes(k)), a.keys.join()).toBe(true);
	}
});

test('Scenario: Reduced motion opens menus and dialogs at once', async ({ page }) => {
	await calm(page);
	await album(page);
	await page.getByRole('button', { name: 'Entry menu' }).click();
	const menu = page.getByRole('menu', { name: 'Entry menu' });
	await expect(menu).toBeVisible();
	expect(await running(menu)).toEqual([]);
	await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
	const dialog = page.getByRole('alertdialog', { name: /Delete this/ });
	await expect(dialog).toBeVisible();
	expect(await running(dialog)).toEqual([]);
	await page.keyboard.press('Escape');
	await expect(dialog).toBeHidden();
});

test('Scenario: A new collection rises into the list', async ({ page }) => {
	await recordAnimate(page);
	await seed(page.request, { collections: [{ name: 'Winter', entries: [] }] });
	await open(page, '/collections');
	await page.getByRole('button', { name: 'New collection' }).click();
	await page.getByLabel('Name').fill('Summer');
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(page.getByRole('list', { name: 'Collections' }).getByRole('link', { name: 'Summer' })).toBeVisible();
	const summer = () => page.evaluate(() => window.__overlayAnims.filter((a) => a.tag === 'LI' && a.text?.includes('Summer')));
	await expect.poll(summer).not.toEqual([]);
	const rises = await summer();
	expect(rises.some((a) => a.keys.includes('opacity')), JSON.stringify(rises)).toBe(true);
	for (const a of rises) expect(a.keys.every((k) => ['opacity', 'transform'].includes(k)), a.keys.join()).toBe(true);
});

test('Scenario: A new tag chip rises into the field', async ({ page }) => {
	await recordAnimate(page);
	const {
		entries: [id]
	} = await seed(page.request, { entries: [{ type: 'album', title: 'Blonde' }, { type: 'album', title: 'Nights', tags: ['summer'] }] });
	await open(page, `/entries/${id}/edit`);
	await page.getByRole('group', { name: 'Tag suggestions' }).getByRole('button', { name: 'summer' }).click();
	await expect(page.getByRole('list', { name: 'Selected tags' }).getByRole('listitem').filter({ hasText: 'summer' })).toBeVisible();
	const chip = () => page.evaluate(() => window.__overlayAnims.filter((a) => a.tag === 'LI' && a.text?.includes('summer')));
	await expect.poll(chip).not.toEqual([]);
	const rises = await chip();
	expect(rises.some((a) => a.keys.includes('opacity')), JSON.stringify(rises)).toBe(true);
	for (const a of rises) expect(a.keys.every((k) => ['opacity', 'transform'].includes(k)), a.keys.join()).toBe(true);
});

test('Scenario: The new-collection form fades and the cards glide', async ({ page }) => {
	await recordAnimate(page);
	await seed(page.request, { collections: [{ name: 'Winter', entries: [] }, { name: 'Autumn', entries: [] }] });
	await open(page, '/collections');
	const list = page.getByRole('list', { name: 'Collections' });
	const form = () => page.evaluate(() => window.__overlayAnims.filter((a) => a.id === 'new-collection').map((a) => a.keys));
	const slides = () => page.evaluate(() => window.__overlayAnims.filter((a) => a.tag === 'UL').map((a) => a.keys));

	await page.getByRole('button', { name: 'New collection' }).click();
	await expect(page.getByLabel('Name')).toBeFocused();
	await expect.poll(async () => (await form()).length).toBeGreaterThan(0);
	await expect.poll(slides).toEqual([['transform']]);
	const opening = (await form()).length;

	await page.getByLabel('Name').fill('Summer');
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(list.getByRole('link', { name: 'Summer' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'New collection' })).toBeFocused();
	expect((await form()).length, 'the form fades out').toBeGreaterThan(opening);
	for (const keys of await form()) expect(keys).toEqual(['opacity']);
	expect(await slides()).toEqual([['transform'], ['transform']]);
});

test('Scenario: Reduced motion opens and closes the new-collection form at once', async ({ page }) => {
	await calm(page);
	await recordAnimate(page);
	await seed(page.request, { collections: [{ name: 'Winter', entries: [] }] });
	await open(page, '/collections');
	await page.getByRole('button', { name: 'New collection' }).click();
	await page.getByLabel('Name').fill('Summer');
	await page.getByRole('button', { name: 'Create' }).click();
	await expect(page.getByRole('button', { name: 'New collection' })).toBeFocused();
	expect(await page.evaluate(() => window.__overlayAnims)).toEqual([]);
});

test('Scenario: Moving to another entry does not raise its chips', async ({ page }) => {
	await recordAnimate(page);
	const {
		entries: [, album]
	} = await seed(page.request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean' },
			{ type: 'album', title: 'Blonde', artist: 0 }
		],
		collections: [
			{ name: 'Night drives', entries: [1] },
			{ name: 'Heroes', entries: [0] },
			{ name: 'Voices', entries: [0] }
		]
	});
	await open(page, `/entries/${album}`);
	const chips = page.getByRole('region', { name: 'In collections' }).getByRole('listitem');
	await expect(chips).toHaveText(['Night drives']);
	await page.evaluate(() => (window.__overlayAnims = []));

	await page.getByRole('main').getByRole('link', { name: 'Frank Ocean', exact: true }).click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Frank Ocean');
	await expect(chips).toHaveText(['Voices', 'Heroes']);
	await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
	expect(await page.evaluate(() => window.__overlayAnims.filter((a) => a.tag === 'LI'))).toEqual([]);
});

test('Scenario: Rows glide after a pointer move, a keyboard move jumps', async ({ page }) => {
	await recordAnimate(page);
	const {
		collections: [id]
	} = await seed(page.request, {
		entries: ['A', 'B', 'C'].map((title) => ({ type: 'album' as const, title })),
		collections: [{ name: 'Moodboard', entries: [0, 1, 2] }]
	});
	const saved = countSaves(page);
	await open(page, `/collections/${id}`);
	const glides = () => page.evaluate(() => window.__overlayAnims.filter((a) => a.tag === 'LI' && a.keys.includes('transform')).length);

	const order = () => page.locator('main ol > li').getByRole('link').allTextContents();
	await page.getByRole('button', { name: 'Move A down', exact: true }).click();
	await expect.poll(order).toEqual(['B', 'A', 'C']);
	await expect.poll(glides).toBeGreaterThan(0);
	// the reload after the save lands mid-glide and carries it on from where it is; count once that settled
	await saved(1);
	const after = await glides();

	await page.getByRole('button', { name: 'Move C up', exact: true }).focus();
	await page.keyboard.press('Enter');
	await expect.poll(order).toEqual(['B', 'C', 'A']);
	await saved(2);
	expect(await glides()).toBe(after);
});
