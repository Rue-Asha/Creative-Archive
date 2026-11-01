import { expect, test, type Page } from '@playwright/test';
import { calm, open } from './helpers.ts';
import { STORAGE_KEY, TOAST_MS } from '../src/lib/shell/toast.ts';

declare global {
	interface Window {
		__vt: { calls: number; covers: number[] };
	}
}

// Counts startViewTransition calls and, at each call, how many elements already carry a cover- name.
async function watchTransitions(page: Page) {
	await page.addInitScript(() => {
		window.__vt = { calls: 0, covers: [] };
		const start = document.startViewTransition?.bind(document);
		if (!start) return;
		document.startViewTransition = (...args: Parameters<typeof start>) => {
			window.__vt.calls++;
			window.__vt.covers.push(
				[...document.querySelectorAll('*')].filter((el) => getComputedStyle(el).viewTransitionName.startsWith('cover-')).length
			);
			return start(...args);
		};
	});
}

const link = (page: Page, name: string) => page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name, exact: true });

test('Scenario: Other navigations crossfade', async ({ page }) => {
	await watchTransitions(page);
	await open(page, '/');
	await link(page, 'Music').click();

	await expect(page).toHaveURL(/\/music$/);
	await expect(link(page, 'Music')).toHaveAttribute('aria-current', 'page');
	expect(await page.evaluate(() => window.__vt.calls)).toBe(1);
	expect(await page.evaluate(() => window.__vt.covers)).toEqual([0]);
});

test('Scenario: Reduced motion skips the crossfade', async ({ page }) => {
	await calm(page);
	await watchTransitions(page);
	await open(page, '/');
	await link(page, 'Music').click();

	await expect(page).toHaveURL(/\/music$/);
	await expect(link(page, 'Music')).toHaveAttribute('aria-current', 'page');
	expect(await page.evaluate(() => window.__vt.calls)).toBe(0);
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
