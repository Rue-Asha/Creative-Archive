import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, recordSaves, reset, seed } from './helpers.ts';

declare global {
	interface Window {
		__confirmDraws: number;
	}
}

// the confirm line is the ::after of [data-confirm-line]; count its entry animation starting (draw, or the fade under reduced motion)
async function recordConfirmLine(page: Page) {
	await page.addInitScript(() => {
		window.__confirmDraws = 0;
		document.addEventListener(
			'animationstart',
			(event) => {
				if (['fp-draw', 'fp-fade-in'].includes(event.animationName) && event.pseudoElement === '::after') window.__confirmDraws++;
			},
			true
		);
	});
}

const field = (page: Page) => page.getByRole('spinbutton', { name: 'Rating', exact: true });
const more = (page: Page) => page.getByRole('button', { name: 'Rating: one more' });
const less = (page: Page) => page.getByRole('button', { name: 'Rating: one less' });
const draws = (page: Page) => page.evaluate(() => window.__confirmDraws);

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Type a rating with two decimals', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	const saved = countSaves(page);
	const saves = recordSaves(page);
	await open(page, `/entries/${id}`);
	await field(page).fill('8.75');
	await field(page).press('Enter');

	await saved(1);
	expect(saves()).toEqual(['rating rating=8.75']);
	await page.reload();
	await expect(field(page)).toHaveValue('8.75');
	await expect(field(page)).toHaveAttribute('aria-valuenow', '8.75');
	await expect(field(page)).toHaveAttribute('aria-valuetext', '8.75 of 10');
});

test('Scenario: Steps and arrow keys change the rating', async ({ page, request }) => {
	const {
		entries: [rated, unrated]
	} = await seed(request, {
		entries: [
			{ type: 'book', title: 'Norwegian Wood', rating: 7 },
			{ type: 'book', title: 'Kafka on the Shore' }
		]
	});
	const saves = recordSaves(page);
	await open(page, `/entries/${rated}`);
	await more(page).click();
	await more(page).click();
	await expect(field(page)).toHaveValue('7.5');
	await field(page).focus();
	await page.keyboard.press('ArrowDown');
	await expect(field(page)).toHaveValue('7.25');
	await field(page).blur();
	await expect.poll(() => saves()).toEqual(['rating rating=7.25', 'rating rating=7.5', 'rating rating=7.25']);
	await page.reload();
	await expect(field(page)).toHaveValue('7.25');

	await open(page, `/entries/${unrated}`);
	await more(page).click();
	await expect(field(page)).toHaveValue('0.25');
	await expect.poll(() => saves()).toEqual(['rating rating=7.25', 'rating rating=7.5', 'rating rating=7.25', 'rating rating=0.25']);
	await page.reload();
	await expect(field(page)).toHaveValue('0.25');
});

test('Scenario: Step buttons stop at the ends', async ({ page, request }) => {
	const {
		entries: [top, bottom]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', rating: 10 },
			{ type: 'album', title: 'Nikes Remixed', rating: 0 }
		]
	});

	await open(page, `/entries/${top}`);
	await expect(more(page)).toBeDisabled();
	await expect(less(page)).toBeEnabled();
	await open(page, `/entries/${bottom}`);
	await expect(less(page)).toBeDisabled();
	await expect(more(page)).toBeEnabled();
	for (const button of [less(page), more(page)]) {
		const box = (await button.boundingBox())!;
		expect(box.width).toBeGreaterThanOrEqual(44);
		expect(box.height).toBeGreaterThanOrEqual(44);
	}
});

test('Scenario: Too many decimals are rejected inline', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 7 }] });
	const saves = recordSaves(page);
	await open(page, `/entries/${id}`);
	await field(page).fill('8.755');
	await field(page).press('Enter');
	await expect(page.getByText('Rating must be between 0 and 10 with up to two decimals')).toBeVisible();
	await page.waitForTimeout(300);

	expect(saves()).toEqual([]);
	await page.reload();
	await expect(field(page)).toHaveValue('7');
});

test('Scenario: Zero is a rating', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await field(page).fill('0');
	await field(page).press('Enter');
	await saved(1);
	await page.reload();

	await expect(field(page)).toHaveValue('0');
	await open(page, '/music/albums');
	await expect(page.getByText('0 / 10')).toBeVisible();
});

test('Scenario: Clear the rating', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 8 }] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await page.getByRole('button', { name: 'Clear rating' }).click();

	await expect(field(page)).toHaveValue('');
	await expect(field(page)).toHaveAttribute('aria-valuetext', 'Not rated');
	await expect(page.getByRole('button', { name: 'Clear rating' })).toHaveCount(0);
	await saved(1);
	await page.reload();
	await expect(field(page)).toHaveValue('');
	await expect(field(page)).toHaveAttribute('aria-valuetext', 'Not rated');
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
	await field(page).fill('4.5');
	await field(page).press('Enter');

	await expect(field(page)).toHaveValue('4.5');
	await saved(1);
	await page.reload();
	await expect(field(page)).toHaveValue('4.5');
});

test('Escape leaves the typed text and keeps the saved rating', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'book', title: 'Norwegian Wood', rating: 7 }] });
	const saves = recordSaves(page);
	await open(page, `/entries/${id}`);
	await field(page).fill('3');
	await field(page).press('Escape');

	await expect(field(page)).toHaveValue('7');
	await field(page).blur();
	await page.waitForTimeout(300);
	expect(saves()).toEqual([]);
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

test('Scenario: Typed rating draws the confirm line', async ({ page, request }) => {
	await recordConfirmLine(page);
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', rating: 8 }] });
	await open(page, `/entries/${id}`);
	expect(await draws(page)).toBe(0);
	await field(page).fill('8.75');
	await field(page).press('Enter');

	await expect.poll(() => draws(page)).toBe(1);
	await expect(field(page)).toHaveValue('8.75');
	await more(page).click();
	await expect(field(page)).toHaveValue('9');
	await page.waitForTimeout(400);
	expect(await draws(page)).toBe(1);
});
