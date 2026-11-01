import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

const albums = () => ({
	entries: Array.from({ length: 30 }, (_, i) => ({ type: 'album' as const, title: `Album ${String(i + 1).padStart(2, '0')}` }))
});

const cells = (page: Page) => page.locator('ul li').filter({ has: page.locator('[data-card]') });
const opacity = (cell: ReturnType<typeof cells>) => cell.evaluate((el) => Number(getComputedStyle(el).opacity));
const inView = (cell: ReturnType<typeof cells>) =>
	cell.evaluate((el) => {
		const r = el.getBoundingClientRect();
		return r.top < innerHeight && r.bottom > 0;
	});

test('Scenario: Cards reveal on scroll', async ({ page, request }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await reset(request);
	await seed(request, albums());
	await open(page, '/music/albums');
	await expect(cells(page)).toHaveCount(30);
	const last = cells(page).last();

	expect(await inView(last)).toBe(false);
	await expect(last).not.toHaveAttribute('data-revealed', '');
	// reveal() marks the node after hydration, so its opacity eases down to 0 first
	await expect.poll(() => opacity(last)).toBeLessThan(1);

	await last.scrollIntoViewIfNeeded();
	await expect(last).toHaveAttribute('data-revealed', '');
	await expect.poll(() => opacity(last)).toBe(1);
});

test('Scenario: Reduced motion shows content immediately', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, albums());
	await open(page, '/music/albums');
	await expect(cells(page)).toHaveCount(30);

	const states = await cells(page).evaluateAll((els) =>
		els.map((el) => ({ revealed: el.hasAttribute('data-revealed'), opacity: Number(getComputedStyle(el).opacity) }))
	);
	expect(states.every((s) => s.revealed && s.opacity === 1)).toBe(true);
});
