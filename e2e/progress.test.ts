import { expect, test, type Page } from '@playwright/test';
import { calm, countSaves, editProgress, open, progressValue, recordSaves, reset, seed } from './helpers.ts';

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

	await expect(control(page, 'Episodes')).toContainText('2 / 28');
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
	await saved(4);
	await page.reload();
	await expect(control(page, 'Episodes')).toContainText('2 / 28');
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
});

test('Scenario: Type progress directly', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(2)] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await editProgress(page, 'Episodes', '27', 'Enter');

	await expect(control(page, 'Episodes')).toContainText('27 / 28');
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
	await saved(1);
	await page.reload();
	await expect(control(page, 'Episodes')).toContainText('27 / 28');
});

test('Scenario: Progress value is not editable text until activated', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(3)] });
	await open(page, `/entries/${id}`);

	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
	await expect(progressValue(page, 'Episodes')).toHaveAccessibleName('Episodes 3 of 28');
	const cursors = await control(page, 'Episodes').evaluate((el) => [el, ...el.querySelectorAll('*')].map((node) => getComputedStyle(node).cursor));
	expect(cursors).not.toContain('text');
	expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('INPUT');
});

test('Scenario: Clicking the value enters edit mode with the value selected', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(3)] });
	await open(page, `/entries/${id}`);
	await progressValue(page, 'Episodes').click();

	const input = control(page, 'Episodes').getByRole('textbox', { name: 'Episodes', exact: true });
	await expect(input).toBeFocused();
	await expect(input).toHaveValue('3');
	await expect(input).toHaveAttribute('inputmode', 'numeric');
	expect(await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([0, 1]);
});

test('Scenario: Keyboard enters edit mode', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(3)] });
	for (const key of ['Enter', 'Space']) {
		await open(page, `/entries/${id}`);
		await less(page, 'Episodes').focus();
		await page.keyboard.press('Tab');
		await expect(progressValue(page, 'Episodes')).toBeFocused();
		await page.keyboard.press(key);

		const input = control(page, 'Episodes').getByRole('textbox', { name: 'Episodes', exact: true });
		await expect(input).toBeFocused();
		expect(await input.evaluate((el: HTMLInputElement) => [el.selectionStart, el.selectionEnd])).toEqual([0, 1]);
	}
});

test('Scenario: Leaving the input saves the edit', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(3)] });
	const saves = recordSaves(page);
	await open(page, `/entries/${id}`);
	await progressValue(page, 'Episodes').click();
	await control(page, 'Episodes').getByRole('textbox').fill('12');
	await page.getByRole('heading', { level: 1 }).click();

	await expect(control(page, 'Episodes')).toContainText('12 / 28');
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
	// a sentinel rating proves no second progress save was queued behind the first
	await page.getByRole('slider', { name: 'Rating', exact: true }).focus();
	await page.keyboard.press('ArrowRight');
	await expect.poll(saves).toEqual(['progress key=episodes value=12', 'rating rating=0.5']);
	await page.reload();
	await expect(control(page, 'Episodes')).toContainText('12 / 28');
});

test('Scenario: Escape cancels editing', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(3)] });
	const saves = recordSaves(page);
	await open(page, `/entries/${id}`);
	await editProgress(page, 'Episodes', '9', 'Escape');

	await expect(control(page, 'Episodes')).toContainText('3 / 28');
	await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
	// saves are serialised: a sentinel step that is the only save sent proves nothing was queued before it
	await more(page, 'Episodes').click();
	await expect(control(page, 'Episodes')).toContainText('4 / 28');
	await expect.poll(saves).toEqual(['progress key=episodes delta=1']);
});

test('Scenario: Invalid input reverts without saving', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(5)] });
	const saves = recordSaves(page);
	await open(page, `/entries/${id}`);
	for (const text of ['', 'abc', '-1', '2.5', '40']) {
		await editProgress(page, 'Episodes', text, 'Enter');

		await expect(control(page, 'Episodes')).toContainText('5 / 28');
		await expect(control(page, 'Episodes').getByRole('textbox')).toHaveCount(0);
	}
	// saves are serialised: a sentinel step that is the only save sent proves nothing was queued before it
	await more(page, 'Episodes').click();
	await expect(control(page, 'Episodes')).toContainText('6 / 28');
	await expect.poll(saves).toEqual(['progress key=episodes delta=1']);
});

test('Scenario: Progress value is named for screen readers', async ({ page, request }) => {
	const {
		entries: [animeId, mangaId]
	} = await seed(request, {
		entries: [
			anime(3),
			{
				type: 'manga',
				title: 'Vagabond',
				status: 'progress',
				progress: { chapters: { current: 120, total: null }, volumes: { current: 12, total: null } }
			}
		]
	});
	await open(page, `/entries/${animeId}`);
	await expect(progressValue(page, 'Episodes')).toHaveAccessibleName('Episodes 3 of 28');
	await open(page, `/entries/${mangaId}`);
	await expect(progressValue(page, 'Chapters')).toHaveAccessibleName('Chapters 120 of unknown');
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
	await expect(control(page, 'Episodes')).toContainText('27 / 28');
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

	await expect(control(page, 'Chapters')).toContainText('120 / ?');
	await expect(more(page, 'Chapters')).toBeEnabled();
	await expect(control(page, 'Volumes')).toContainText('/ ?');
	await more(page, 'Chapters').click();
	await expect(control(page, 'Chapters')).toContainText('121 / ?');
});

test('Scenario: Reaching the total offers Mark as watched', async ({ page, request }) => {
	const {
		entries: [id]
	} = await seed(request, { entries: [anime(27)] });
	const saved = countSaves(page);
	await open(page, `/entries/${id}`);
	await expect(page.getByRole('button', { name: 'Mark as watched' })).toHaveCount(0);
	await more(page, 'Episodes').click();

	await expect(control(page, 'Episodes')).toContainText('28 / 28');
	await page.getByRole('button', { name: 'Mark as watched' }).click();
	await expect(page.getByRole('button', { name: 'Status: Watched', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Mark as watched' })).toHaveCount(0);
	await saved(2);
	await page.reload();
	await expect(page.getByRole('button', { name: 'Status: Watched', exact: true })).toBeVisible();
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

	await expect(page.getByRole('button', { name: 'Status: Read', exact: true })).toBeVisible();
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

	await expect(page.getByRole('button', { name: 'Status: Watching', exact: true })).toBeVisible();
	await saved(1);
	await page.reload();
	await expect(page.getByRole('button', { name: 'Status: Watching', exact: true })).toBeVisible();
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
