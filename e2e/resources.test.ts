import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Pages load no external resources', async ({ page, request, baseURL }) => {
	const { entries, collections } = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde', status: 'done', rating: 4, image: true }],
		heroes: ['home', 'music'],
		collections: [{ name: 'Winter', entries: [0] }]
	});
	const origins = new Set<string>();
	page.on('request', (req) => {
		if (!req.url().startsWith('data:')) origins.add(new URL(req.url()).origin);
	});

	for (const path of ['/', '/music', '/music/albums', `/entries/${entries[0]}`, '/add/album', '/collections', `/collections/${collections[0]}`, '/settings']) {
		await open(page, path);
		await page.waitForLoadState('networkidle');
	}

	expect([...origins]).toEqual([new URL(baseURL!).origin]);
});

test('Scenario: Fonts load from the app', async ({ page, request, baseURL }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	const fontRequests: string[] = [];
	page.on('request', (req) => {
		if (req.resourceType() === 'font') fontRequests.push(req.url());
	});
	await open(page, '/music/albums');
	const loaded = await page.evaluate(async () => {
		await document.fonts.ready;
		return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family);
	});

	expect(loaded.length).toBeGreaterThan(0);
	expect(fontRequests.length).toBeGreaterThan(0);
	for (const url of fontRequests) {
		expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
		expect(new URL(url).pathname).toMatch(/^\/fonts\/.+\.woff2$/);
	}
});
