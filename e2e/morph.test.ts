import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

interface Named {
	name: string;
	card: boolean;
	coverId: string | null;
}

declare global {
	interface Window {
		__morphLog: { calls: number; old: Named[]; during: Named[] };
	}
}

// Wraps startViewTransition: records which elements carry a cover- name when it is called (the old page) and once
// the new page has been swapped in, before the transition runs.
async function watchMorph(page: Page) {
	await page.addInitScript(() => {
		window.__morphLog = { calls: 0, old: [], during: [] };
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		const named = (): Named[] =>
			[...document.querySelectorAll('*')].flatMap((el) => {
				const name = getComputedStyle(el).viewTransitionName;
				return name.startsWith('cover-') ? [{ name, card: el.closest('[data-card]') !== null, coverId: el.getAttribute('data-cover-id') }] : [];
			});
		document.startViewTransition = (callback?: ViewTransitionUpdateCallback) => {
			window.__morphLog.calls++;
			window.__morphLog.old = named();
			return start(async () => {
				await callback?.();
				window.__morphLog.during = named();
			});
		};
	});
}

const log = (page: Page) => page.evaluate(() => window.__morphLog);

async function seeded(request: Parameters<typeof reset>[0]) {
	await reset(request);
	const {
		entries: [id]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'album', title: 'Channel Orange', image: true }
		]
	});
	return id;
}

test('Scenario: Card to detail morphs the cover', async ({ page, request }) => {
	const id = await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await page.locator('[data-card]').filter({ hasText: 'Blonde' }).getByRole('link', { name: 'Blonde' }).click();

	await expect(page).toHaveURL(`/entries/${id}`);
	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	const seen = await log(page);
	expect(seen.calls).toBe(1);
	expect(seen.old).toEqual([{ name: `cover-${id}`, card: true, coverId: String(id) }]);
	expect(seen.during).toEqual([{ name: `cover-${id}`, card: false, coverId: String(id) }]);
});

test('Scenario: Back from detail reverses the morph', async ({ page, request }) => {
	const id = await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await page.locator('[data-card]').filter({ hasText: 'Blonde' }).getByRole('link', { name: 'Blonde' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	await page.evaluate(() => (window.__morphLog = { calls: 0, old: [], during: [] }));
	await page.goBack();

	await expect(page).toHaveURL('/music/albums');
	await expect(page.locator('[data-card]')).toHaveCount(2);
	const seen = await log(page);
	expect(seen.calls).toBe(1);
	expect(seen.old).toEqual([{ name: `cover-${id}`, card: false, coverId: String(id) }]);
	expect(seen.during).toEqual([{ name: `cover-${id}`, card: true, coverId: String(id) }]);
});

test('Scenario: Reduced motion skips the morph', async ({ page, request }) => {
	await calm(page);
	await seeded(request);
	await watchMorph(page);
	await open(page, '/music/albums');
	await page.locator('[data-card]').filter({ hasText: 'Blonde' }).getByRole('link', { name: 'Blonde' }).click();

	await expect(page.getByRole('heading', { level: 1, name: 'Blonde' })).toBeVisible();
	expect((await log(page)).calls).toBe(0);
	const carrying = await page.evaluate(
		() => [...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName.startsWith('cover-')).length
	);
	expect(carrying).toBe(0);
});
