import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';

declare global {
	interface Window {
		__anims: { label: boolean }[];
	}
}

// Svelte transitions and the components' own motion all go through Element.animate.
async function recordAnimations(page: Page) {
	await page.addInitScript(() => {
		window.__anims = [];
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, ...args: Parameters<typeof animate>) {
			window.__anims.push({ label: this.closest('[data-status-label]') !== null });
			return animate.apply(this, args);
		};
	});
}

const labelAnimations = (page: Page) => page.evaluate(() => window.__anims.filter((a) => a.label).length);
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

	await expect(page.locator('[data-status-label]')).toHaveText('Listened');
	await saved(1);
	await page.reload();
	await expect(page.locator('[data-status-label]')).toHaveText('Listened');
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

	await expect(page.locator('[data-status-label]')).toHaveText('Owned');
	await saved(1);
	await page.reload();
	await expect(page.locator('[data-status-label]')).toHaveText('Owned');
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

	await expect(page.locator('[data-status-label]')).toHaveText('Reading');
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
	await expect(page.locator('[data-status-label]')).toHaveText('Wishlist');
});

test('Scenario: Status pill animates on change', async ({ page, request }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await recordAnimations(page);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'anime', title: 'Frieren', status: 'want' }] });
	await open(page, `/entries/${id}`);
	expect(await labelAnimations(page)).toBe(0);
	await pill(page, 'Plan to watch').click();
	await page.getByRole('menuitemradio', { name: 'Watching' }).click();

	await expect.poll(() => labelAnimations(page)).toBeGreaterThan(0);
	await expect(page.locator('[data-status-label]')).toHaveText('Watching');
});

test('Scenario: Reduced motion changes status instantly', async ({ page, request }) => {
	await recordAnimations(page);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'anime', title: 'Frieren', status: 'want' }] });
	await open(page, `/entries/${id}`);
	await pill(page, 'Plan to watch').click();
	await page.getByRole('menuitemradio', { name: 'Watching' }).click();

	await expect(page.locator('[data-status-label]')).toHaveText('Watching');
	expect(await labelAnimations(page)).toBe(0);
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
	await page.getByRole('slider', { name: 'Rating', exact: true }).focus();
	for (let i = 0; i < 8; i++) await page.keyboard.press('ArrowRight');

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(page.locator('[data-status-label]')).toHaveText('Want to listen');
	await saved(8);
	await page.reload();
	await expect(page.getByRole('slider', { name: 'Rating', exact: true })).toHaveAttribute('aria-valuenow', '4');
});
