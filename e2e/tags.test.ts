import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const save = (page: Page) => page.getByRole('button', { name: 'Save' });
const input = (page: Page) => page.getByLabel('Add a tag');
const chips = (page: Page) => page.getByRole('list', { name: 'Selected tags' });
const suggestions = (page: Page) => page.getByRole('group', { name: 'Tag suggestions' });

async function twoEntries(request: Parameters<typeof seed>[0]) {
	const { entries } = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', tags: ['Ästhetik'] },
			{ type: 'book', title: 'Kitchen Confidential' }
		]
	});
	return entries;
}

test('Scenario: Add a tag with autocomplete', async ({ page, request }) => {
	const [, book] = await twoEntries(request);
	await open(page, `/entries/${book}/edit`);
	await input(page).fill('äst');

	await expect(suggestions(page).getByRole('button', { name: 'Ästhetik' })).toBeVisible();
	await suggestions(page).getByRole('button', { name: 'Ästhetik' }).click();
	await expect(chips(page).getByText('Ästhetik')).toBeVisible();
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${book}`);
	await open(page, `/entries/${book}/edit`);
	await expect(chips(page).getByText('Ästhetik')).toBeVisible();
});

test('Scenario: Typing an existing tag in other case reuses it', async ({ page, request }) => {
	const [, book] = await twoEntries(request);
	await open(page, `/entries/${book}/edit`);
	await input(page).fill('ÄSTHETIK');
	await input(page).press('Enter');
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${book}`);
	await open(page, `/entries/${book}/edit`);
	await expect(chips(page).getByText('Ästhetik', { exact: true })).toBeVisible();
	expect((await counts(request)).tags).toBe(1);
});

test('Scenario: Remove a tag', async ({ page, request }) => {
	const [album] = await twoEntries(request);
	await open(page, `/entries/${album}/edit`);
	await expect(chips(page).getByText('Ästhetik')).toBeVisible();
	await page.getByRole('button', { name: 'Remove Ästhetik' }).click();
	await expect(chips(page).getByText('Ästhetik')).toHaveCount(0);
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${album}`);
	await open(page, `/entries/${album}/edit`);
	await expect(chips(page).getByRole('listitem').filter({ hasText: 'Ästhetik' })).toHaveCount(0);
	expect((await counts(request)).tags).toBe(0);
});

test('a new tag is typed, confirmed with a comma and saved with the entry', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Kitchen Confidential');
	await input(page).fill('memoir, food,');

	await expect(chips(page).getByText('memoir')).toBeVisible();
	await input(page).fill('essay');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	for (const name of ['memoir', 'food', 'essay']) await expect(chips(page).getByText(name, { exact: true })).toBeVisible();
});

test('Enter in the tag input adds a tag and does not submit the form', async ({ page, request }) => {
	await open(page, '/add/book?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Kitchen Confidential');
	await input(page).fill('memoir');
	await input(page).press('Enter');

	await expect(chips(page).getByText('memoir')).toBeVisible();
	await expect(page).toHaveURL(/\/add\/book/);
	expect((await counts(request)).entries).toBe(0);
});

test('a tag already on the form is not suggested again and Backspace removes the last one', async ({ page, request }) => {
	const [, book] = await twoEntries(request);
	await open(page, `/entries/${book}/edit`);
	await input(page).fill('Ästhetik');
	await input(page).press('Enter');

	await expect(suggestions(page).getByRole('button', { name: 'Ästhetik' })).toHaveCount(0);
	await input(page).press('Backspace');
	await expect(chips(page).getByText('Ästhetik')).toHaveCount(0);
});

test('only used tags are suggested', async ({ page, request }) => {
	const [album, book] = await twoEntries(request);
	await open(page, `/entries/${album}/edit`);
	await page.getByRole('button', { name: 'Remove Ästhetik' }).click();
	await save(page).click();
	await expect(page).toHaveURL(`/entries/${album}`);

	await open(page, `/entries/${book}/edit`);
	await input(page).fill('äst');

	await expect(suggestions(page).getByRole('button')).toHaveCount(0);
});
