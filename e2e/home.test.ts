import { expect, test } from '@playwright/test';
import { calm, cardTitles, open, plus, reset, seed, shelf } from './helpers.ts';

test('Scenario: In progress shelf lists media in progress', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } }, updatedAt: '2026-10-01T12:00:00.000Z' },
			{ type: 'book', title: 'Piranesi', status: 'progress', updatedAt: '2026-10-02T12:00:00.000Z' },
			{ type: 'album', title: 'Blonde', status: 'done' }
		]
	});
	await open(page, '/');

	const progress = page.getByRole('region', { name: 'In progress', exact: true });
	await expect(progress).toHaveCount(1);
	await expect(cardTitles(progress)).toHaveText(['Piranesi', 'Frieren']);
});

test('Scenario: In progress cards read their progress with its total', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } } },
			{ type: 'manga', title: 'Vagabond', status: 'progress', progress: { chapters: { current: 5, total: null } } }
		]
	});
	for (const path of ['/', '/animanga']) {
		await open(page, path);
		const progress = page.getByRole('region', { name: 'In progress', exact: true });
		for (const [title, line, steps] of [
			['Frieren', '3 / 28 episodes', 'Episodes, Frieren'],
			['Vagabond', '5 / ? chapters', 'Chapters, Vagabond']
		]) {
			const card = progress.getByRole('article').filter({ hasText: title });
			const text = card.getByText(line, { exact: true });
			await expect(text, `${path} ${title}`).toBeVisible();
			const group = card.getByRole('group', { name: steps });
			expect((await text.boundingBox())!.y, 'above the steps').toBeLessThan((await group.boundingBox())!.y);
		}
	}
});

test('Scenario: Recently added shelves per domain', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde' },
			{ type: 'piece', title: 'Wool coat' }
		]
	});
	await open(page, '/');

	// one card stacks a shelf per domain that has entries, each with its "See all" link
	const recent = page.getByRole('region', { name: 'Recently added', exact: true });
	await expect(recent.getByRole('region')).toHaveCount(2);
	await expect(cardTitles(shelf(page, 'Music'))).toHaveText(['Blonde']);
	await expect(shelf(page, 'Music').getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/music');
	await expect(cardTitles(shelf(page, 'Fashion'))).toHaveText(['Wool coat']);
	await expect(shelf(page, 'Fashion').getByRole('link', { name: 'See all' })).toHaveAttribute('href', '/fashion');
	await expect(recent.getByRole('region', { name: 'Animanga', exact: true })).toHaveCount(0);
	await expect(recent.getByRole('region', { name: 'Books', exact: true })).toHaveCount(0);
});

test('Scenario: Empty archive shows a welcome per domain', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/');

	const welcome = page.getByRole('region', { name: 'Your archive starts here' });
	await expect(welcome.getByRole('link', { name: /^Add your first/ })).toHaveCount(4);
	for (const [domain, type] of [['Music', 'album'], ['Animanga', 'anime'], ['Books', 'book'], ['Fashion', 'piece']]) {
		const item = welcome.getByRole('listitem').filter({ has: page.getByRole('heading', { name: domain, exact: true }) });
		await expect(item.getByRole('link')).toHaveAttribute('href', `/add/${type}`);
	}
	await expect(plus(page).first()).toBeVisible();
	await expect(page.getByRole('region', { name: 'Domains', exact: true })).toHaveCount(0);
	await expect(page.getByRole('region', { name: /^(In progress|Recently added)/ })).toHaveCount(0);
	await expect(page.getByRole('region', { name: 'Collections', exact: true })).toHaveCount(0);
	// P6: nothing to count, so no facts card
	await expect(page.getByRole('list', { name: 'Archive key facts' })).toHaveCount(0);
});
