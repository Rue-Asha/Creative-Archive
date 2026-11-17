import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';

declare global {
	interface Window {
		__anims: string[];
	}
}

// Svelte transitions and the components' own motion all go through Element.animate.
async function recordAnimations(page: Page) {
	await page.addInitScript(() => {
		window.__anims = [];
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, ...args: Parameters<typeof animate>) {
			window.__anims.push((this.textContent ?? '').trim());
			return animate.apply(this, args);
		};
	});
}

const labelAnimations = (page: Page, label: string) => page.evaluate((text) => window.__anims.filter((a) => a === text).length, label);
const pill = (page: Page, current: string) => page.getByRole('button', { name: `Status: ${current}`, exact: true });

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Set status from the detail page', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'want' }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await pill(page, 'Want to listen').click();
	await page.getByRole('menuitemradio', { name: 'Listened' }).click();

	await expect(pill(page, 'Listened')).toBeVisible();
	await saved(1);
	await page.reload();
	await expect(pill(page, 'Listened')).toBeVisible();
	await expect(pill(page, 'Listened')).toBeVisible();
});

test('Scenario: Set a piece status from the detail page', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'piece', title: 'Wool Coat', status: 'wishlist' }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await pill(page, 'Wishlist').click();
	await page.getByRole('menuitemradio', { name: 'Owned' }).click();

	await expect(pill(page, 'Owned')).toBeVisible();
	await saved(1);
	await page.reload();
	await expect(pill(page, 'Owned')).toBeVisible();
});

test('Scenario: Status labels follow the domain', async ({ page, request }) => {
	const { entries } = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'none' },
			{ type: 'anime', title: 'Frieren', status: 'none' },
			{ type: 'manga', title: 'Vagabond', status: 'none' },
			{ type: 'book', title: 'Norwegian Wood', status: 'none' }
		]
	});
	const labels = [
		['No status', 'Want to listen', 'Listening', 'Listened', 'Dropped'],
		['No status', 'Plan to watch', 'Watching', 'Watched', 'Dropped'],
		['No status', 'Want to read', 'Reading', 'Read', 'Dropped'],
		['No status', 'Want to read', 'Reading', 'Read', 'Dropped']
	];

	for (const [i, id] of entries.entries()) {
		await open(page, `/entries/${id}`);
		await pill(page, 'No status').click();

		await expect(page.getByRole('menu', { name: 'Status' }).getByRole('menuitemradio')).toHaveText(labels[i]);
	}
});

test('choosing the current status again changes nothing', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood', status: 'progress' }] });
	await open(page, `/entries/${id}`);
	await pill(page, 'Reading').click();
	await page.getByRole('menuitemradio', { name: 'Reading' }).click();

	await expect(pill(page, 'Reading')).toBeVisible();
});

test('the status action refuses a status the type does not have', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'piece', title: 'Wool Coat', status: 'wishlist' }] });
	await open(page, `/entries/${id}`);
	const res = await page.evaluate(async () => {
		const body = new FormData();
		body.set('status', 'want');
		const r = await fetch('?/status', { method: 'POST', body, headers: { accept: 'application/json', 'x-sveltekit-action': 'true' } });
		return r.text();
	});

	expect(res).toContain('failure');
	await page.reload();
	await expect(pill(page, 'Wishlist')).toBeVisible();
});

test('Scenario: Status changes at once', async ({ page, request }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await recordAnimations(page);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'anime', title: 'Frieren', status: 'want' }] });
	await open(page, `/entries/${id}`);
	await pill(page, 'Plan to watch').click();
	await expect(page.getByRole('menuitemradio', { name: 'Watching' })).toBeVisible();
	// CSS transitions and animations count too: anything that starts on the control once a status is picked
	await page.waitForTimeout(400);
	await pill(page, 'Plan to watch').evaluate((control) => {
		const seen: string[] = [];
		(window as unknown as { __css: string[] }).__css = seen;
		for (const type of ['transitionrun', 'animationstart'])
			document.addEventListener(type, (e) => control.contains(e.target as Node) && seen.push(`${type} ${(e as TransitionEvent).propertyName ?? (e as AnimationEvent).animationName}`), true);
	});
	await page.getByRole('menuitemradio', { name: 'Watching' }).click();

	await expect(pill(page, 'Watching')).toBeVisible();
	expect(await labelAnimations(page, 'Watching')).toBe(0);
	expect(await labelAnimations(page, 'Status: Watching')).toBe(0);
	await page.waitForTimeout(400);
	expect(await page.evaluate(() => (window as unknown as { __css: string[] }).__css)).toEqual([]);
	expect(await pill(page, 'Watching').evaluate((el) => el.getAnimations({ subtree: true }).length)).toBe(0);
});

test('Scenario: Failed save on the detail page shows a toast and reverts', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'want' }] });
	const saved = countSaves(page);
	await page.route(/\?\/status$/, (route) => route.abort());
	await open(page, `/entries/${id}`);
	await pill(page, 'Want to listen').click();
	await page.getByRole('menuitemradio', { name: 'Listened' }).click();
	await page.getByRole('spinbutton', { name: 'Rating', exact: true }).focus();
	for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowUp');

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(pill(page, 'Want to listen')).toBeVisible();
	await saved(8);
	await page.reload();
	await expect(page.getByRole('spinbutton', { name: 'Rating', exact: true })).toHaveAttribute('aria-valuenow', '2');
});
