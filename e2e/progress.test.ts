import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, open, reset, seed } from './helpers.ts';

const control = (page: Page, label: string) => page.getByRole('group', { name: label, exact: true });
const more = (page: Page, label: string) => page.getByRole('button', { name: `${label}: one more`, exact: true });
const less = (page: Page, label: string) => page.getByRole('button', { name: `${label}: one less`, exact: true });

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const anime = (current: number, status: 'want' | 'progress' | 'done' = 'progress') => ({
	type: 'anime' as const,
	title: 'Frieren',
	status,
	progress: { episodes: { current, total: 28 } }
});

test('Scenario: Step episodes with plus and minus', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(0)] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	for (let i = 0; i < 3; i++) await more(page, 'Episodes').click();
	await less(page, 'Episodes').click();

	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveValue('2');
	await expect(control(page, 'Episodes')).toContainText('/ 28');
	await saved(4);
	await page.reload();
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveValue('2');
	await expect(control(page, 'Episodes')).toContainText('/ 28');
});

test('Scenario: Type progress directly', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(2)] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	const input = control(page, 'Episodes').getByRole('textbox');
	await input.fill('27');
	await input.press('Enter');

	await expect(input).toHaveValue('27');
	await expect(control(page, 'Episodes')).toContainText('/ 28');
	await saved(1);
	await page.reload();
	await expect(input).toHaveValue('27');
});

test('typing a number above the total or a non-number is refused', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(5)] });
	await open(page, `/entries/${id}`);
	const input = control(page, 'Episodes').getByRole('textbox');
	await input.fill('40');
	await input.press('Enter');
	await expect(input).toHaveValue('5');
	await input.fill('abc');
	await input.press('Enter');

	await expect(input).toHaveValue('5');
});

test('clearing the field and pressing Enter changes nothing', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(27)] });
	await open(page, `/entries/${id}`);
	const input = control(page, 'Episodes').getByRole('textbox');
	await input.fill('');
	await input.press('Enter');

	await expect(input).toHaveValue('27');
	await page.reload();
	await expect(input).toHaveValue('27');
});

test('a progress post with an empty value is refused and changes nothing', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(27)] });
	await open(page, `/entries/${id}`);
	const res = await page.evaluate(async () => {
		const body = new FormData();
		body.set('key', 'episodes');
		body.set('value', '');
		const r = await fetch('?/progress', { method: 'POST', body, headers: { accept: 'application/json', 'x-sveltekit-action': 'true' } });
		return r.text();
	});

	expect(res).toContain('failure');
	await page.reload();
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveValue('27');
});

test('minus is disabled at zero', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(0)] });
	await open(page, `/entries/${id}`);

	await expect(less(page, 'Episodes')).toBeDisabled();
});

test('Scenario: Ongoing manga shows n / ?', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, {
		entries: [
			{
				type: 'manga',
				title: 'Vagabond',
				status: 'progress',
				progress: { chapters: { current: 120, total: null }, volumes: { current: 12, total: null } }
			}
		]
	});
	await open(page, `/entries/${id}`);

	await expect(control(page, 'Chapters').getByRole('textbox')).toHaveValue('120');
	await expect(control(page, 'Chapters')).toContainText('/ ?');
	await expect(more(page, 'Chapters')).toBeEnabled();
	await expect(control(page, 'Volumes')).toContainText('/ ?');
	await more(page, 'Chapters').click();
	await expect(control(page, 'Chapters').getByRole('textbox')).toHaveValue('121');
});

test('Scenario: Reaching the total offers Mark as watched', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(27)] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await expect(page.getByRole('button', { name: 'Mark as watched' })).toHaveCount(0);
	await more(page, 'Episodes').click();

	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveValue('28');
	await expect(control(page, 'Episodes')).toContainText('/ 28');
	await page.getByRole('button', { name: 'Mark as watched' }).click();
	await expect(page.locator('[data-status-label]')).toHaveText('Watched');
	await expect(page.getByRole('button', { name: 'Mark as watched' })).toHaveCount(0);
	await saved(2);
	await page.reload();
	await expect(page.locator('[data-status-label]')).toHaveText('Watched');
});

test('Scenario: Reaching the chapter total offers Mark as read', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, {
		entries: [
			{
				type: 'manga',
				title: 'Monster',
				status: 'progress',
				progress: { chapters: { current: 99, total: 100 }, volumes: { current: 5, total: null } }
			}
		]
	});
	await open(page, `/entries/${id}`);
	await more(page, 'Chapters').click();
	await page.getByRole('button', { name: 'Mark as read' }).click();

	await expect(page.locator('[data-status-label]')).toHaveText('Read');
});

test('an anime already watched at its total offers nothing', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(28, 'done')] });
	await open(page, `/entries/${id}`);

	await expect(control(page, 'Episodes')).toContainText('/ 28');
	await expect(page.getByRole('button', { name: 'Mark as watched' })).toHaveCount(0);
});

test('progress above zero moves want to in progress', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(0, 'want')] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await more(page, 'Episodes').click();

	await expect(page.locator('[data-status-label]')).toHaveText('Watching');
	await saved(1);
	await page.reload();
	await expect(page.locator('[data-status-label]')).toHaveText('Watching');
});

test('books and albums have no progress controls', async ({ page, request }) => {
	const {
		entries: [book, album]
	} = await seed(request, {
		entries: [
			{ type: 'book', title: 'Norwegian Wood' },
			{ type: 'album', title: 'Blonde' }
		]
	});
	for (const id of [book, album]) {
		await open(page, `/entries/${id}`);

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByRole('group')).toHaveCount(0);
	}
});
