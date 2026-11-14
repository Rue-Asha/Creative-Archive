import { expect, test } from '@playwright/test';
import { calm, cardTitles, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Album links to its artist', async ({ page, request }) => {
	const {
		entries: [artist, album]
	} = await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean', status: 'none' },
			{ type: 'album', title: 'Blonde', artist: 0 }
		]
	});
	await open(page, `/entries/${album}`);

	await expect(page.getByRole('link', { name: 'Frank Ocean' })).toHaveAttribute('href', `/entries/${artist}`);
	await page.getByRole('link', { name: 'Frank Ocean' }).click();
	await expect(page).toHaveURL(`/entries/${artist}`);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Frank Ocean');
});

test('Scenario: Unlinked artist name shows as text', async ({ page, request }) => {
	const {
		entries: [song]
	} = await seed(request, { entries: [{ type: 'song', title: 'Kill Bill', artist: 'SZA' }] });
	await open(page, `/entries/${song}`);

	await expect(page.getByText('SZA', { exact: true })).toBeVisible();
	await expect(page.getByRole('link', { name: 'SZA' })).toHaveCount(0);
});

test('Scenario: Artist lists linked albums and songs', async ({ page, request }) => {
	const {
		entries: [artist]
	} = await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean' },
			{ type: 'album', title: 'Blonde', artist: 0 },
			{ type: 'album', title: 'Channel Orange', artist: 0 },
			{ type: 'song', title: 'Nikes', artist: 0 },
			{ type: 'album', title: 'Not His Album', artist: 'Frank Ocean' },
			{ type: 'album', title: 'Somebody Elses', artist: 'Solange' }
		]
	});
	await open(page, `/entries/${artist}`);
	const works = page.getByRole('region', { name: 'Works' });

	await expect(cardTitles(works)).toHaveText(['Channel Orange', 'Blonde', 'Nikes']);
	await expect(page.getByText('Not His Album')).toHaveCount(0);
	await expect(page.getByText('Somebody Elses')).toHaveCount(0);
});

test('a work card opens the album', async ({ page, request }) => {
	const {
		entries: [artist, album]
	} = await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean' },
			{ type: 'album', title: 'Blonde', artist: 0, rating: 4.5 }
		]
	});
	await open(page, `/entries/${artist}`);
	await page.getByRole('region', { name: 'Works' }).getByRole('link', { name: 'Blonde' }).click();

	await expect(page).toHaveURL(`/entries/${album}`);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blonde');
});

test('an artist without works and an album without an artist show no works shelf', async ({ page, request }) => {
	const {
		entries: [artist, album]
	} = await seed(request, {
		entries: [
			{ type: 'artist', title: 'Frank Ocean' },
			{ type: 'album', title: 'Blonde' }
		]
	});
	for (const id of [artist, album]) {
		await open(page, `/entries/${id}`);

		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		await expect(page.getByRole('region', { name: 'Works' })).toHaveCount(0);
	}
});
