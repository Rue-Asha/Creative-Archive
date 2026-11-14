import { expect, test, type Page } from '@playwright/test';
import { calm, cardTitles, cards, countSaves, open, reset, seed } from './helpers.ts';

const popover = (page: Page) => page.getByRole('menu', { name: 'Add to collection' });
const toggle = (page: Page) => page.getByRole('button', { name: 'Add to collection' });

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Add an entry from its detail page', async ({ page, request }) => {
	const {
		entries: [album],
		collections: [id]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [{ name: 'Moodboard', entries: [] }]
	});
	await open(page, `/entries/${album}`);
	await toggle(page).click();
	const item = popover(page).getByRole('menuitemcheckbox', { name: 'Moodboard' });
	await expect(item).toHaveAttribute('aria-checked', 'false');
	await item.click();

	await expect(item).toHaveAttribute('aria-checked', 'true');
	await open(page, `/collections/${id}`);
	await expect(cardTitles(page)).toHaveText(['Blonde']);
});

test('Scenario: Create a collection from the popover', async ({ page, request }) => {
	const {
		entries: [album]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, `/entries/${album}`);
	await toggle(page).click();
	await popover(page).getByRole('button', { name: 'New collection' }).click();
	await popover(page).getByLabel('Name').fill('Late Night');
	await popover(page).getByRole('button', { name: 'Create' }).click();

	await expect(popover(page).getByRole('menuitemcheckbox', { name: 'Late Night' })).toHaveAttribute('aria-checked', 'true');
	await open(page, '/collections');
	const card = cards(page).filter({ hasText: 'Late Night' });
	await expect(card.getByLabel('1 entry', { exact: true })).toHaveText('1');
});

test('Scenario: Adding an entry twice from the popover keeps one', async ({ page, request }) => {
	const {
		entries: [album]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [{ name: 'Moodboard', entries: [0] }]
	});
	await open(page, `/entries/${album}`);
	await toggle(page).click();
	await expect(popover(page).getByRole('menuitemcheckbox', { name: 'Moodboard' })).toHaveAttribute('aria-checked', 'true');

	await open(page, `/entries/${album}`);
	await toggle(page).click();
	await expect(popover(page).getByRole('menuitemcheckbox', { name: 'Moodboard' })).toHaveAttribute('aria-checked', 'true');
	await open(page, '/collections');
	await expect(cards(page).filter({ hasText: 'Moodboard' }).getByLabel('1 entry', { exact: true })).toHaveText('1');
});

test('Scenario: Failed save in the popover shows a toast and reverts', async ({ page, request }) => {
	const {
		entries: [album]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [
			{ name: 'Moodboard', entries: [] },
			{ name: 'Autumn', entries: [] }
		]
	});
	const saved = countSaves(page);
	let fail = true;
	await page.route(/\?\/collect$/, (route) => {
		if (!fail) return route.fallback();
		fail = false;
		return route.abort();
	});
	await open(page, `/entries/${album}`);
	await toggle(page).click();
	const moodboard = popover(page).getByRole('menuitemcheckbox', { name: 'Moodboard' });
	const autumn = popover(page).getByRole('menuitemcheckbox', { name: 'Autumn' });
	await moodboard.click();
	await autumn.click();

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(autumn).toHaveAttribute('aria-checked', 'true');
	await expect(moodboard).toHaveAttribute('aria-checked', 'false');
	await saved(1);
	await page.reload();
	await toggle(page).click();
	await expect(popover(page).getByRole('menuitemcheckbox', { name: 'Autumn' })).toHaveAttribute('aria-checked', 'true');
	await expect(popover(page).getByRole('menuitemcheckbox', { name: 'Moodboard' })).toHaveAttribute('aria-checked', 'false');
});

const csrf = { status: 403, contentType: 'application/json', body: JSON.stringify({ message: 'Cross-site POST form submissions are forbidden' }) };

test('Scenario: Failed save in the popover shows a toast and reverts (typeless 403 on collect)', async ({ page, request }) => {
	const {
		entries: [album]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde' }],
		collections: [{ name: 'Moodboard', entries: [] }]
	});
	await page.route(/\?\/collect$/, (route) => route.fulfill(csrf));
	await open(page, `/entries/${album}`);
	await toggle(page).click();
	const moodboard = popover(page).getByRole('menuitemcheckbox', { name: 'Moodboard' });
	await moodboard.click();

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(moodboard).toHaveAttribute('aria-checked', 'false');
});

test('Scenario: Failed save in the popover shows a toast and reverts (typeless 403 on create)', async ({ page, request }) => {
	const {
		entries: [album]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	const saved = countSaves(page);
	await page.route(/\?\/newCollection$/, (route) => route.fulfill(csrf));
	await open(page, `/entries/${album}`);
	await toggle(page).click();
	await popover(page).getByRole('button', { name: 'New collection' }).click();
	await popover(page).getByLabel('Name').fill('Late Night');
	await popover(page).getByRole('button', { name: 'Create' }).click();

	await expect(page.getByRole('status').filter({ hasText: "Couldn't save — try again" })).toBeVisible();
	await expect(popover(page).getByLabel('Name')).toBeVisible();
	await expect(popover(page).getByRole('menuitemcheckbox', { name: 'Late Night' })).toHaveCount(0);
	await saved(1);
	await page.reload();
	await toggle(page).click();
	await expect(popover(page).getByRole('menuitemcheckbox')).toHaveCount(0);
});
