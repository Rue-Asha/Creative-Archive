import { expect, test } from '@playwright/test';
import { DOMAINS } from '../src/lib/domains.ts';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: App pages load nothing from other origins', async ({ page, request, baseURL }) => {
	const { entries, collections } = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde', status: 'done', rating: 4, image: true }],
		heroes: ['home', 'music'],
		collections: [{ name: 'Winter', entries: [0] }]
	});
	const origins = new Set<string>();
	page.on('request', (req) => {
		if (!req.url().startsWith('data:')) origins.add(new URL(req.url()).origin);
	});

	const paths = [
		'/',
		...DOMAINS.map((d) => `/${d}`),
		'/music/albums',
		`/entries/${entries[0]}`,
		`/entries/${entries[0]}/edit`,
		'/add/album',
		'/collections',
		`/collections/${collections[0]}`,
		'/settings'
	];
	for (const path of paths) {
		await open(page, path);
		await page.waitForLoadState('networkidle');
	}

	expect([...origins]).toEqual([new URL(baseURL!).origin]);
});

test('Scenario: Display and text fonts load from the app', async ({ page, request, baseURL }) => {
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	const fontRequests: string[] = [];
	page.on('request', (req) => {
		if (req.resourceType() === 'font') fontRequests.push(req.url());
	});
	await open(page, '/');
	await page.waitForLoadState('networkidle');
	const loaded = await page.evaluate(async () => {
		await document.fonts.ready;
		return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replaceAll('"', ''));
	});

	expect(loaded).toContain('Gilda Display');
	expect(loaded).toContain('DM Sans');
	expect(fontRequests.length).toBeGreaterThan(0);
	for (const url of fontRequests) {
		expect(new URL(url).origin).toBe(new URL(baseURL!).origin);
		expect(new URL(url).pathname).toMatch(/^\/fonts\/fingerprint\/.+\.woff2$/);
	}
});
