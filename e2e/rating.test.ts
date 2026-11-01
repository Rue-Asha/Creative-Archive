import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';

declare global {
	interface Window {
		__starAnims: { star: number }[];
	}
}

// Svelte transitions and the components' own motion all go through Element.animate; star is the index of the star
// the animated element sits in, -1 for anything else.
async function recordAnimations(page: Page) {
	await page.addInitScript(() => {
		window.__starAnims = [];
		const animate = Element.prototype.animate;
		Element.prototype.animate = function (this: Element, ...args: Parameters<typeof animate>) {
			const star = this.closest('[data-fill]');
			window.__starAnims.push({ star: star ? [...star.parentElement!.children].indexOf(star) : -1 });
			return animate.apply(this, args);
		};
	});
}

const slider = (page: Page) => page.getByRole('slider', { name: 'Rating', exact: true });
const stars = (page: Page) => slider(page).locator('[data-fill]');
const fills = (page: Page) => stars(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-fill')));
const starAnimations = (page: Page) => page.evaluate(() => window.__starAnims.filter((a) => a.star >= 0).map((a) => a.star));

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Rate in half stars', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await stars(page).nth(4).click({ position: { x: 3, y: 20 } });

	await expect(slider(page)).toHaveAttribute('aria-valuenow', '4.5');
	expect(await fills(page)).toEqual(['full', 'full', 'full', 'full', 'half']);
	await saved(1);
	await page.reload();
	await expect(slider(page)).toHaveAttribute('aria-valuenow', '4.5');
	expect(await fills(page)).toEqual(['full', 'full', 'full', 'full', 'half']);
});

test('the right half of a star rates it whole', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${id}`);
	await stars(page).nth(2).click({ position: { x: 30, y: 20 } });

	await expect(slider(page)).toHaveAttribute('aria-valuenow', '3');
});

test('Scenario: Clear the rating', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 4 }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Clear rating' }).click();

	await expect(slider(page)).toHaveAttribute('aria-valuenow', '0');
	expect(await fills(page)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
	await expect(page.getByRole('button', { name: 'Clear rating' })).toHaveCount(0);
	await saved(1);
	await page.reload();
	await expect(slider(page)).toHaveAttribute('aria-valuetext', 'Not rated');
	expect(await fills(page)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
});

test('Scenario: Keyboard rates with arrow keys', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood' }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await slider(page).focus();
	for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
	await page.keyboard.press('ArrowLeft');

	await expect(slider(page)).toHaveAttribute('aria-valuenow', '1');
	await saved(4);
	await page.reload();
	await expect(slider(page)).toHaveAttribute('aria-valuenow', '1');
});

test('a failed save does not block the saves after it', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'want' }] });
	const saved = countSaves(page);
	await page.route(/\?\/status$/, (route) => route.abort());
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: /^Status:/ }).click();
	await page.getByRole('menuitemradio', { name: 'Listened' }).click();
	await stars(page).nth(4).click({ position: { x: 3, y: 20 } });

	await expect(slider(page)).toHaveAttribute('aria-valuenow', '4.5');
	await saved(1);
	await page.reload();
	await expect(slider(page)).toHaveAttribute('aria-valuenow', '4.5');
});

test('Delete clears the rating from the keyboard', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood', rating: 3.5 }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await slider(page).focus();
	await page.keyboard.press('Delete');

	await expect(slider(page)).toHaveAttribute('aria-valuetext', 'Not rated');
	await saved(1);
	await page.reload();
	await expect(slider(page)).toHaveAttribute('aria-valuetext', 'Not rated');
});

test('the rating action refuses a type without ratings', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'piece', title: 'Wool Coat', status: 'owned' }] });
	await open(page, `/entries/${id}`);
	const res = await page.evaluate(async () => {
		const body = new FormData();
		body.set('rating', '4');
		const r = await fetch('?/rating', { method: 'POST', body, headers: { accept: 'application/json', 'x-sveltekit-action': 'true' } });
		return r.text();
	});

	expect(res).toContain('failure');
});

test('Scenario: Star fill animates on rate', async ({ page, request }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await recordAnimations(page);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 4 }] });
	await open(page, `/entries/${id}`);
	expect(await starAnimations(page)).toEqual([]);
	await stars(page).nth(4).click({ position: { x: 3, y: 20 } });

	await expect.poll(() => starAnimations(page)).toEqual([4]);
	await expect(slider(page)).toHaveAttribute('aria-valuenow', '4.5');
});

test('Scenario: Reduced motion fills stars instantly', async ({ page, request }) => {
	await recordAnimations(page);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 4 }] });
	await open(page, `/entries/${id}`);
	await stars(page).nth(4).click({ position: { x: 3, y: 20 } });

	await expect(slider(page)).toHaveAttribute('aria-valuenow', '4.5');
	expect(await fills(page)).toEqual(['full', 'full', 'full', 'full', 'half']);
	expect(await starAnimations(page)).toEqual([]);
});
