import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { calm, cardOf, cardTitles, cards, countSaves, cover, editProgress, expectWorld, open, photo, rate, reset, seed } from './helpers.ts';
import { schemes } from '../src/lib/styles/tokens.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';

declare global {
	interface Window {
		__journeyMorphs: number;
	}
}

const group = (page: Page, label: string) => page.getByRole('group', { name: label, exact: true });
const statusPill = (page: Page) => page.getByRole('button', { name: /^Status:/ });
const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

async function addByPick(page: Page, path: string, query: string, name: RegExp) {
	await open(page, path);
	await page.getByRole('searchbox').fill(query);
	await page.getByRole('list', { name: 'Search results' }).getByRole('button', { name }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
}

async function album(page: Page) {
	await addByPick(page, '/add/album', 'Blonde', /Blonde/);
	await expect(cover(page, 'Blonde')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(page.getByRole('link', { name: 'Frank Ocean' })).toHaveAttribute('href', /^\/entries\/\d+$/);

	const saved = countSaves(page);
	await statusPill(page).click();
	await page.getByRole('menuitemradio', { name: 'Listened' }).click();
	await expect(page.getByRole('button', { name: 'Status: Listened', exact: true })).toBeVisible();
	await rate(page.getByRole('slider', { name: 'Rating', exact: true }), 5, 'left');
	await expect(page.getByRole('slider', { name: 'Rating', exact: true })).toHaveAttribute('aria-valuenow', '4.5');
	await saved(2);

	await page.reload();
	await expect(page.getByRole('button', { name: 'Status: Listened', exact: true })).toBeVisible();
	await expect(page.getByRole('slider', { name: 'Rating', exact: true })).toHaveAttribute('aria-valuenow', '4.5');
}

async function animanga(page: Page) {
	await addByPick(page, '/add/anime', 'Frieren', /Frieren/);
	const episodes = group(page, 'Episodes');
	await expect(episodes).toContainText('/ 28');
	await episodes.getByRole('button', { name: 'Episodes: one more' }).click();
	await expect(episodes).toContainText('1 / 28');
	await editProgress(page, 'Episodes', '28', 'Enter');
	await expect(episodes).toContainText('28 / 28');
	await page.getByRole('button', { name: 'Mark as watched' }).click();
	await expect(page.getByRole('button', { name: 'Status: Watched', exact: true })).toBeVisible();

	await addByPick(page, '/add/manga', 'Vagabond', /Vagabond/);
	const chapters = group(page, 'Chapters');
	await expect(chapters).toContainText('0 / ?');
}

async function brand(page: Page) {
	await open(page, '/add/brand');
	await page.getByLabel('Page URL').fill('https://brand.example/');
	await page.getByLabel('Page URL').blur();
	await expect(page.getByRole('img', { name: 'Page preview' })).toBeVisible();
	await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Maison Example');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(cover(page, 'Maison Example')).toHaveAttribute('src', /^\/images\/\d+$/);

	await open(page, '/add/brand');
	await page.getByLabel('Page URL').fill('https://blocked.example/');
	await page.getByLabel('Page URL').blur();
	await expect(page.getByText('No preview found')).toBeVisible();
	await page.getByLabel('Name', { exact: true }).fill('Blocked Label');
	await page.getByLabel('Photo file').setInputFiles(photo('fashion-look.jpg'));
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await expect(cover(page, 'Blocked Label')).toHaveAttribute('src', /^\/images\/\d+$/);
}

async function wardrobe(page: Page, request: APIRequestContext) {
	const {
		entries: [id]
	} = await seed(request, { entries: [{ type: 'piece', title: 'Wool Coat', status: 'wishlist' }] });
	await open(page, '/fashion/wardrobe');
	await expect(cards(page)).toHaveCount(0);

	await open(page, `/entries/${id}`);
	await statusPill(page).click();
	await page.getByRole('menuitemradio', { name: 'Owned' }).click();
	await expect(page.getByRole('button', { name: 'Status: Owned', exact: true })).toBeVisible();
	await open(page, '/fashion/wardrobe');
	await expect(cardTitles(page)).toHaveText(['Wool Coat']);
}

async function organise(page: Page, request: APIRequestContext) {
	const {
		entries: [first, second]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'book', title: 'Piranesi', image: true }
		]
	});
	await open(page, `/entries/${first}/edit`);
	await page.getByLabel('Add a tag').fill('Ästhetik');
	await page.getByLabel('Add a tag').press('Enter');
	await page.getByRole('button', { name: 'Save' }).click();
	await expect(page).toHaveURL(`/entries/${first}`);
	await expect(page.getByRole('list', { name: 'Tags' })).toContainText('Ästhetik');

	const menu = page.getByRole('menu', { name: 'Add to collection' });
	await page.getByRole('button', { name: 'Add to collection' }).click();
	await menu.getByRole('button', { name: 'New collection' }).click();
	await menu.getByLabel('Name').fill('Late Night');
	await menu.getByRole('button', { name: 'Create' }).click();
	await expect(menu.getByRole('menuitemcheckbox', { name: 'Late Night' })).toHaveAttribute('aria-checked', 'true');

	await open(page, `/entries/${second}`);
	await page.getByRole('button', { name: 'Add to collection' }).click();
	await menu.getByRole('menuitemcheckbox', { name: 'Late Night' }).click();
	await expect(menu.getByRole('menuitemcheckbox', { name: 'Late Night' })).toHaveAttribute('aria-checked', 'true');

	await open(page, '/collections');
	const card = cards(page).filter({ hasText: 'Late Night' });
	await expect(card.getByLabel('2 entries', { exact: true })).toHaveText('2');
	await expect(card.getByRole('presentation')).toHaveCount(2);
	await card.getByRole('link').first().click();
	await expect(page.getByRole('heading', { level: 1, name: 'Late Night' })).toBeVisible();
	await expect(cardTitles(page)).toHaveText(['Blonde', 'Piranesi']);
}

async function homeAndWorlds(page: Page, request: APIRequestContext) {
	await seed(request, {
		heroes: ['home', 'music'],
		entries: [
			{ type: 'album', title: 'Blonde', image: true, status: 'progress' },
			{ type: 'book', title: 'Piranesi', image: true, status: 'progress' },
			{ type: 'anime', title: 'Frieren', image: true }
		]
	});
	await open(page, '/');
	await expect(page.locator('[data-hero-image]')).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(page.getByRole('group', { name: 'Latest entries' }).getByRole('article')).toHaveCount(3);
	await expect(page.getByRole('region', { name: 'In progress', exact: true })).toBeVisible();
	await expect(page.getByRole('region', { name: /^Recently added/ })).not.toHaveCount(0);

	for (const domain of ['music', 'animanga', 'books', 'fashion'] as const) {
		await open(page, `/${domain}`);
		const { scheme } = WORLDS[domain];
		await expectWorld(page, domain);
		expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor), domain).toBe(rgb(schemes[scheme].ground));
	}
}

const cells = (page: Page) => page.getByRole('listitem').filter({ has: cards(page) });
const opacity = (cell: ReturnType<typeof cells>) => cell.evaluate((el) => Number(getComputedStyle(el).opacity));

async function manyAlbums(request: APIRequestContext) {
	await reset(request);
	return seed(request, {
		entries: Array.from({ length: 30 }, (_, i) => ({ type: 'album' as const, title: `Album ${String(i + 1).padStart(2, '0')}`, image: true }))
	});
}

async function morphAndReveal(page: Page, request: APIRequestContext) {
	const {
		entries: [id]
	} = await manyAlbums(request);
	await page.addInitScript(() => {
		window.__journeyMorphs = 0;
		const start = document.startViewTransition?.bind(document);
		if (start) document.startViewTransition = (cb?: ViewTransitionUpdateCallback) => (window.__journeyMorphs++, start(cb));
	});
	await open(page, '/music/albums');
	await expect(cells(page)).toHaveCount(30);
	const last = cells(page).last();
	await expect.poll(() => opacity(last)).toBeLessThan(1);
	await last.scrollIntoViewIfNeeded();
	await expect.poll(() => opacity(last)).toBe(1);

	await page.evaluate(() => scrollTo(0, 0));
	await cardOf(page, 'Album 01').getByRole('link', { name: 'Album 01' }).click();
	await expect(page).toHaveURL(`/entries/${id}`);
	await expect(page.getByRole('region', { name: 'Album 01', exact: true })).toBeVisible();
	await expect(page.getByRole('main').getByRole('img', { name: 'Album 01', exact: true })).toHaveCount(1);
	expect(await page.evaluate(() => window.__journeyMorphs)).toBe(1);

	await page.emulateMedia({ reducedMotion: 'reduce' });
	await open(page, '/music/albums');
	const states = await cells(page).evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
	expect(states.every((o) => o === 1)).toBe(true);
	await cardOf(page, 'Album 01').getByRole('link', { name: 'Album 01' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Album 01' })).toBeVisible();
}

test.beforeEach(async ({ request }) => {
	await reset(request);
});

test('Done: add Blonde, Frank Ocean linked, Listened, rated 4.5', async ({ page }) => {
	await album(page);
});

test('Done: Frieren to 28/28 offers Mark as watched, ongoing manga shows 0 / ?', async ({ page }) => {
	await animanga(page);
});

test('Done: brand URL gives a preview image, a blocking site takes an upload', async ({ page }) => {
	await brand(page);
});

test('Done: owned pieces appear under Wardrobe', async ({ page, request }) => {
	await wardrobe(page, request);
});

test('Done: tagged entry in a mixed collection shows a collage', async ({ page, request }) => {
	await organise(page, request);
});

test('Done: Home shows hero, coverflow and shelves, domain pages show their worlds', async ({ page, request }) => {
	await homeAndWorlds(page, request);
});

test('Done: cover morphs, scrolling reveals, everything is still at reduced motion', async ({ page, request }) => {
	await morphAndReveal(page, request);
});

test('Done: the whole journey under reduced motion', async ({ page, request }) => {
	await calm(page);
	await album(page);
	await animanga(page);
	await brand(page);
	await reset(request);
	await wardrobe(page, request);
	await reset(request);
	await organise(page, request);
	await reset(request);
	await homeAndWorlds(page, request);
	await reset(request);
	await manyAlbums(request);
	await open(page, '/music/albums');
	const states = await cells(page).evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
	expect(states.every((o) => o === 1)).toBe(true);
	await cardOf(page, 'Album 01').getByRole('link', { name: 'Album 01' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Album 01' })).toBeVisible();
});
