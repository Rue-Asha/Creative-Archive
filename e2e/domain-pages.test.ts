import { expect, test } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';
const TABS = {
	music: ['Albums', 'Artists', 'Songs'],
	animanga: ['Anime', 'Manga'],
	books: ['Books'],
	fashion: ['Wardrobe', 'Pieces', 'Looks', 'Brands & shops', 'Influencers', 'Magazines']
};

const slugs = { Albums: 'albums', Artists: 'artists', Songs: 'songs', Anime: 'anime', Manga: 'manga', Books: 'books', 'Brands & shops': 'brands-shops', Influencers: 'influencers', Magazines: 'magazines', Pieces: 'pieces', Wardrobe: 'wardrobe', Looks: 'looks' } as const;

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Domain page shows its hero photo', async ({ page, request }) => {
	await seed(request, { heroes: ['music'] });
	await open(page, '/settings');
	const id = await page.getByRole('region', { name: 'Music' }).getByRole('presentation').getAttribute('src');

	await open(page, '/music');

	await expect(page.locator('.app .frame > figure.stage > img.stage-photo')).toHaveAttribute('src', id!);
});

test('Scenario: Domain without hero photo shows the colour field', async ({ page }) => {
	const requested: string[] = [];
	page.on('request', (req) => requested.push(new URL(req.url()).pathname));

	await open(page, '/books');

	await expect(page.locator('.app')).toHaveAttribute('data-backdrop', 'field');
	await expect(page.locator('.app .stage-photo')).toHaveCount(0);
	expect(requested.filter((p) => p.startsWith('/images/'))).toEqual([]);
	// the head sits on the flat Books night band
	const band = await page.locator('.frame').evaluate((el) => {
		const s = getComputedStyle(el, '::before');
		return { bg: s.backgroundColor, image: s.backgroundImage, height: parseFloat(s.height) };
	});
	expect(band.bg).toBe('rgb(22, 37, 42)');
	expect(band.image).toBe('none');
	expect(band.height).toBeGreaterThanOrEqual((await page.locator('.screen-head').boundingBox())!.height);
});

test('Scenario: Sub-type tabs per domain', async ({ page }) => {
	for (const [domain, labels] of Object.entries(TABS)) {
		await open(page, `/${domain}`);
		const links = page.getByRole('navigation', { name: 'Sub-types' }).getByRole('link');

		await expect(links, domain).toHaveText(labels);
		for (const [i, label] of labels.entries())
			await expect(links.nth(i), label).toHaveAttribute('href', `/${domain}/${slugs[label as keyof typeof slugs]}`);
	}
});

test('Scenario: Sub-type links show their counts', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'First Record' },
			{ type: 'album', title: 'Second Record' },
			{ type: 'artist', title: 'Some Artist' }
		]
	});
	await open(page, '/music');
	const nav = page.getByRole('navigation', { name: 'Sub-types' });
	for (const [label, n] of [['Albums', '2'], ['Artists', '1'], ['Songs', '0']]) {
		const link = nav.getByRole('link', { name: label, exact: true });
		await expect(link, label).toHaveText(label);
		await expect(nav.getByRole('listitem').filter({ has: page.getByRole('link', { name: label, exact: true }) }), label).toHaveText(`${label} ${n}`);
	}

	await open(page, '/music/albums');
	const kicker = page.getByRole('navigation', { name: 'Sub-types' });
	await expect(kicker.getByRole('listitem').filter({ has: page.getByRole('link', { name: 'Albums', exact: true }) })).toHaveText('Albums');
});

test("Scenario: Add offers the domain's types", async ({ page }) => {
	await open(page, '/fashion');

	await page.getByRole('main').getByRole('button', { name: 'Add' }).click();
	const menu = page.getByRole('menu', { name: 'Add to Fashion' });
	await expect(menu.getByRole('menuitem')).toHaveText(['Brand or shop', 'Influencer', 'Magazine', 'Piece', 'Look']);

	await expect(menu.getByRole('menuitem', { name: 'Brand or shop' })).toHaveAttribute('href', '/add/brand');

	await menu.getByRole('menuitem', { name: 'Magazine' }).click();
	await expect(page).toHaveURL(/\/add\/magazine$/);
});

test('Scenario: Domain shelves show its entries', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'First Record', status: 'want' },
			{ type: 'album', title: 'Second Record', status: 'want' },
			{ type: 'artist', title: 'Some Artist' }
		]
	});
	await open(page, '/music');

	const albums = page.getByRole('region', { name: 'Albums', exact: true });
	await expect(albums).toContainText('First Record');
	await expect(albums).toContainText('Second Record');
	await expect(page.getByRole('region', { name: 'Artists', exact: true })).toContainText('Some Artist');
	await expect(page.getByRole('region', { name: 'Songs', exact: true })).toHaveCount(0);
});

test('Scenario: Shelf counts name their type or entries', async ({ page, request }) => {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'First Record' },
			{ type: 'album', title: 'Second Record' },
			{ type: 'artist', title: 'Some Artist' },
			{ type: 'anime', title: 'Mushishi' },
			{ type: 'anime', title: 'Frieren' },
			{ type: 'manga', title: 'Vagabond' }
		]
	});
	const count = (name: string, text: string) => expect(page.getByRole('region', { name, exact: true }).getByText(text, { exact: true }), name).toBeVisible();

	await open(page, '/music');
	await count('Albums', '2 albums');
	await count('Artists', '1 artist');

	await open(page, '/animanga');
	await count('Anime', '2 entries');
	await count('Manga', '1 entry');
});

test('Scenario: Unknown domain answers 404', async ({ page }) => {
	const res = await page.goto('/podcasts');

	expect(res?.status()).toBe(404);
});

test('Scenario: Sub-types sit below the title', async ({ page }) => {
	for (const [domain, labels] of Object.entries(TABS)) {
		for (const path of [`/${domain}`, ...labels.map((l) => `/${domain}/${slugs[l as keyof typeof slugs]}`)]) {
			await open(page, path);
			const lead = page.locator('.screen-lead');
			const title = await lead.getByRole('heading', { level: 1 }).boundingBox();
			const lede = await lead.locator('.lede').boundingBox();
			const nav = await lead.getByRole('navigation', { name: 'Sub-types' }).boundingBox();

			expect(nav!.y, `${path} below h1`).toBeGreaterThanOrEqual(title!.y + title!.height);
			expect(nav!.y, `${path} below lede`).toBeGreaterThanOrEqual(lede!.y + lede!.height);
			expect(await lead.evaluate((el) => {
				const h1 = el.querySelector('h1')!;
				return !!(h1.compareDocumentPosition(el.querySelector('nav[aria-label="Sub-types"]')!) & Node.DOCUMENT_POSITION_FOLLOWING);
			}), path).toBe(true);
		}
	}
});
