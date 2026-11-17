import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: In progress shelf on a media domain', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress' },
			{ type: 'manga', title: 'Vagabond', status: 'done' }
		]
	});

	await open(page, '/animanga');
	const progress = page.getByRole('region', { name: 'In progress', exact: true });
	await expect(progress).toContainText('Frieren');
	await expect(progress).not.toContainText('Vagabond');

	await open(page, '/fashion');
	await expect(page.getByRole('region', { name: 'In progress', exact: true })).toHaveCount(0);
});

test('Scenario: Empty domain keeps sub-types and Add', async ({ page }) => {
	await open(page, '/books');

	await expect(page.getByRole('navigation', { name: 'Sub-types' }).getByRole('link')).toHaveText(['Books']);
	await expect(page.getByRole('main').getByRole('button', { name: 'Add' })).toBeVisible();
	await expect(page.getByRole('region')).toHaveCount(0);
	await expect(page.getByRole('main').getByRole('link', { name: 'Add a book' })).toHaveAttribute('href', '/add/book');
	await expect(page.getByRole('list', { name: 'Books key facts' })).toHaveCount(0);
});

test('Scenario: The facts card comes after the shelves on the phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone');
	await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'want' }] });
	await open(page, '/music');

	const facts = page.getByRole('list', { name: 'Music key facts' });
	const shelf = page.getByRole('region', { name: 'Albums', exact: true });
	await expect(facts).toBeVisible();
	const below = (await shelf.boundingBox())!;
	expect((await facts.boundingBox())!.y).toBeGreaterThanOrEqual(below.y + below.height - 1);
	await expect(page.getByRole('list', { name: 'Music key facts' })).toHaveCount(1);
});

test('Scenario: The facts card sits beside the title on desktop', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop');
	await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'want' }] });
	await open(page, '/music');

	const facts = (await page.getByRole('list', { name: 'Music key facts' }).boundingBox())!;
	const title = (await page.getByRole('heading', { level: 1 }).boundingBox())!;
	const shelf = (await page.getByRole('region', { name: 'Albums', exact: true }).boundingBox())!;
	expect(facts.y + facts.height).toBeLessThanOrEqual(shelf.y + 1);
	expect(facts.x).toBeGreaterThan(title.x + title.width);
});
