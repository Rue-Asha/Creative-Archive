import { expect, test, type Page } from '@playwright/test';
import { calm, cards, open, openSection, reset, seed, shelf } from './helpers.ts';
import { STORAGE_KEY, TOAST_MS } from '../src/lib/shell/toast.ts';

declare global {
	interface Window {
		__vt: { calls: number };
	}
}

// Counts startViewTransition calls.
async function watchTransitions(page: Page) {
	await page.addInitScript(() => {
		window.__vt = { calls: 0 };
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		document.startViewTransition = (...args: Parameters<typeof start>) => {
			window.__vt.calls++;
			return start(...args);
		};
	});
}

const link = (page: Page, name: string) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true });
const day = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

test('Scenario: Navigation starts no view transition', async ({ page, request }) => {
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Blue Hour', image: true, createdAt: day(1) }] });
	await watchTransitions(page);
	await open(page, '/');
	await openSection(page, 'Music');

	await expect(page).toHaveURL(/\/music$/);
	await expect(link(page, 'Music')).toHaveAttribute('aria-current', 'page');
	await cards(page).first().getByRole('link').first().click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await page.goBack();

	await expect(page).toHaveURL(/\/music$/);
	await expect(cards(page).first()).toBeVisible();
	expect(await page.evaluate(() => window.__vt.calls)).toBe(0);
	expect(await page.evaluate(() => [...document.querySelectorAll('*')].filter((el) => el !== document.documentElement && getComputedStyle(el).viewTransitionName !== 'none').length)).toBe(0);
});

test('Scenario: Back restores the shelf scroll position', async ({ page, request }) => {
	await reset(request);
	await seed(request, {
		entries: Array.from({ length: 12 }, (_, i) => ({ type: 'album' as const, title: `Album ${String(i + 1).padStart(2, '0')}`, image: true, createdAt: day(28 - i) }))
	});
	await open(page, '/music');
	const albums = shelf(page, 'Albums');
	const row = albums.getByRole('list');
	await expect(cards(albums)).toHaveCount(12);
	const eighth = cards(albums).nth(7);
	await expect(eighth).toContainText('Album 05');
	await eighth.scrollIntoViewIfNeeded();
	const left = () => row.evaluate((el) => el.scrollLeft);
	// a phone row snaps after the scroll; wait until it rests
	let last = -1;
	await expect.poll(async () => {
		const now = await left();
		const still = now === last;
		last = now;
		return still;
	}).toBe(true);
	const before = await left();
	expect(before).toBeGreaterThan(0);
	await eighth.getByRole('link').first().click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await page.goBack();

	await expect(page).toHaveURL(/\/music$/);
	await expect.poll(left).toBeGreaterThan(0);
	expect(Math.abs((await left()) - before)).toBeLessThanOrEqual(2);
	await expect(cards(shelf(page, 'Albums')).nth(7)).toBeInViewport();
});

test('Scenario: Browser without View Transitions navigates plainly', async ({ page }) => {
	const errors: Error[] = [];
	page.on('pageerror', (e) => errors.push(e));
	await page.addInitScript(() => {
		Object.defineProperty(Document.prototype, 'startViewTransition', { value: undefined, configurable: true });
	});
	await open(page, '/');
	expect(await page.evaluate(() => typeof document.startViewTransition)).toBe('undefined');
	await link(page, 'Books').click();

	await expect(page).toHaveURL(/\/books$/);
	await expect(link(page, 'Books')).toHaveAttribute('aria-current', 'page');
	expect(errors).toEqual([]);
});

test('a queued toast shows on the next page and hides itself', async ({ page }) => {
	await calm(page);
	await open(page, '/');
	await page.evaluate(([key]) => sessionStorage.setItem(key, JSON.stringify(['Saved'])), [STORAGE_KEY]);
	await link(page, 'Music').click();
	const toast = page.getByRole('status').filter({ hasText: 'Saved' });

	await expect(page).toHaveURL(/\/music$/);
	await expect(toast).toBeVisible();
	await expect(toast).toBeHidden({ timeout: TOAST_MS + 1500 });
});

test('a queued toast survives a full page load', async ({ page }) => {
	await calm(page);
	await open(page, '/');
	await page.evaluate(([key]) => sessionStorage.setItem(key, JSON.stringify(['Deleted'])), [STORAGE_KEY]);
	await page.reload();

	await expect(page.getByRole('status').filter({ hasText: 'Deleted' })).toBeVisible();
});
