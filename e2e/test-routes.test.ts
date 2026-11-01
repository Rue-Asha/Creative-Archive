import { expect, test } from '@playwright/test';
import { calm, counts, open, reset, seed } from './helpers.ts';

const TABLES = ['entries', 'tags', 'entry_tags', 'status_events', 'collections', 'collection_entries', 'heroes', 'images'];

test('Scenario: Reset empties the archive', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean', image: true },
			{ type: 'album', title: 'Blonde', artist: 0, status: 'done', tags: ['Summer'], image: true }
		],
		collections: [{ name: 'Moodboard', entries: [1] }],
		heroes: ['music']
	});
	const before = await counts(request);
	for (const t of ['entries', 'tags', 'entry_tags', 'collections', 'collection_entries', 'heroes', 'images'])
		expect(before[t], t).toBeGreaterThan(0);

	await reset(request);

	const after = await counts(request);
	for (const t of TABLES) expect(after[t], t).toBe(0);
});

test('Scenario: Seed returns the ids of what it inserted', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');
	await reset(request);

	const ids = await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean' },
			{ type: 'album', title: 'Blonde', artist: 0 }
		],
		collections: [{ name: 'Moodboard', entries: [1] }]
	});

	expect(ids.entries).toHaveLength(2);
	expect(ids.collections).toHaveLength(1);
	expect(new Set(ids.entries).size).toBe(2);
	const n = await counts(request);
	expect(n.entries).toBe(2);
	expect(n.collections).toBe(1);
	expect(n.collection_entries).toBe(1);
});

test('the image route serves a PNG', async ({ request }, info) => {
	test.skip(info.project.name !== 'desktop', 'server only');

	const res = await request.get('/__test/image/blonde.png');

	expect(res.status()).toBe(200);
	expect(res.headers()['content-type']).toBe('image/png');
});

test('Scenario: App is hydrated before tests interact', async ({ page }) => {
	await calm(page);

	await open(page, '/');

	expect(await page.locator('html[data-hydrated]').count()).toBe(1);
});
