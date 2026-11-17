import { expect, test, type Page } from '@playwright/test';
import { calm, open, openSection, plus, reset, seed, shelf } from './helpers.ts';

const domains = (page: Page) => page.getByRole('region', { name: 'Domains', exact: true });
const collectionsRegion = (page: Page) => page.getByRole('region', { name: 'Collections', exact: true });
// the Home page header inside `main`: at 1280 px the top bar has a second "Settings" link
const head = (page: Page) => page.locator('main .screen-head');
const top = async (locator: ReturnType<Page['locator']>) => (await locator.boundingBox())!.y;

test('Scenario: Home shows the sections in order', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	const { collections } = await seed(request, {
		heroes: ['music'],
		entries: [
			{ type: 'anime', title: 'Frieren', status: 'progress', image: true },
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'album', title: 'Honey', image: true },
			{ type: 'book', title: 'Piranesi', image: true }
		],
		collections: [{ name: 'Late Night', entries: [1, 3] }]
	});
	await open(page, '/');

	const tiles = domains(page).getByRole('link');
	await expect(tiles).toHaveCount(4);
	const expected = [
		['Music', '/music', '2 entries'],
		['Animanga', '/animanga', '1 entry'],
		['Books', '/books', '1 entry'],
		['Fashion', '/fashion', 'No entries yet']
	];
	for (const [i, [name, href, count]] of expected.entries()) {
		await expect(tiles.nth(i)).toHaveAttribute('href', href);
		await expect(tiles.nth(i)).toContainText(name);
		await expect(tiles.nth(i)).toContainText(count);
	}
	const sections = [domains(page), shelf(page, 'In progress'), page.getByRole('region', { name: 'Recently added', exact: true }), collectionsRegion(page)];
	const ys = await Promise.all(sections.map(top));
	expect(ys).toEqual([...ys].sort((a, b) => a - b));
	await expect(collectionsRegion(page).getByRole('link', { name: 'All collections' })).toHaveAttribute('href', '/collections');
	await expect(collectionsRegion(page).getByRole('link', { name: /Late Night/ })).toHaveAttribute('href', `/collections/${collections[0]}`);
});

test('Scenario: Nothing in progress leaves the section out', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'done' },
			{ type: 'book', title: 'Piranesi', status: 'want' }
		]
	});
	await open(page, '/');

	await expect(shelf(page, 'In progress')).toHaveCount(0);
	await expect(domains(page)).toBeVisible();
	await expect(page.getByRole('region', { name: 'Recently added', exact: true })).toBeVisible();
	await expect(shelf(page, 'Music')).toBeVisible();
});

// Collections list newest first, so they are seeded in reverse of the order the list shows them in (Late Night leads: the first with images).
test('Scenario: Collections section shows collages', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	const { collections } = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', image: true },
			{ type: 'book', title: 'Piranesi', image: true },
			{ type: 'anime', title: 'Frieren', image: true }
		],
		collections: [
			{ name: 'Summer', entries: [2] },
			{ name: 'Late Night', entries: [0, 1, 2] },
			{ name: 'Empty one', entries: [] }
		]
	});
	await open(page, '/');

	const links = collectionsRegion(page).getByRole('list').getByRole('link');
	await expect(links).toHaveCount(3);
	await expect(links.nth(0)).toContainText('Late Night');
	await expect(links.nth(0)).toContainText('3 entries');
	await expect(links.nth(0)).toHaveAttribute('href', `/collections/${collections[1]}`);
	await expect(links.nth(0).getByRole('img', { name: 'Late Night collage' }).locator('img')).toHaveCount(3);
	await expect(links.nth(1)).toContainText('Empty one');
	await expect(links.nth(1)).toContainText('0 entries');
	await expect(links.nth(1).getByRole('img', { name: 'Empty one collage' })).toBeVisible();
	await expect(links.nth(1).locator('img')).toHaveCount(0);
	await expect(links.nth(2)).toContainText('Summer');
	await expect(links.nth(2)).toContainText('1 entry');
});

test('Scenario: No collections shows a New collection prompt', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, '/');

	const region = collectionsRegion(page);
	await expect(region.getByRole('link', { name: 'New collection' })).toHaveAttribute('href', '/collections');
	await expect(region.getByRole('img')).toHaveCount(0);
});

// Two links are named "Settings" at 1280 px (top bar and Home head), so the head's one is addressed by scope.
test('Scenario: Settings is reached from the Home header', async ({ page, request }, info) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, '/');

	if (info.project.name === 'desktop') await expect(page.getByRole('link', { name: 'Settings', exact: true })).toHaveCount(2);
	await head(page).getByRole('link', { name: 'Settings', exact: true }).click();
	await expect(page).toHaveURL(/\/settings$/);
});

test('Scenario: Home head offers Add on the desktop only', async ({ page, request }, info) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, '/');

	if (info.project.name === 'phone') {
		await expect(head(page).getByRole('button', { name: 'Add', exact: true })).toBeHidden();
		await expect(plus(page)).toBeVisible();
		return;
	}
	await head(page).getByRole('button', { name: 'Add', exact: true }).click();
	const sheet = page.getByRole('dialog', { name: 'Add to your archive' });
	await expect(sheet).toBeVisible();
	const types = {
		Music: ['Album', 'Artist', 'Song'],
		Animanga: ['Anime', 'Manga'],
		Books: ['Book'],
		Fashion: ['Brand or shop', 'Influencer', 'Magazine', 'Piece', 'Look']
	};
	for (const [group, links] of Object.entries(types)) {
		await expect(sheet.getByRole('group', { name: group })).toBeVisible();
		await expect(sheet.getByRole('group', { name: group }).getByRole('link')).toHaveText(links);
	}
	await sheet.getByRole('link', { name: 'Album', exact: true }).click();
	await expect(page).toHaveURL(/\/add\/album$/);
});

test('Scenario: Long titles and missing images stay inside Home', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sets its own viewports');
	await calm(page);
	await reset(request);
	const long = (word: string) => `${word} ${'long'.repeat(45)}`.slice(0, 180);
	await seed(request, {
		entries: [
			{ type: 'album', title: long('Album'), status: 'progress' },
			{ type: 'anime', title: long('Anime'), status: 'progress' },
			{ type: 'book', title: long('Book') },
			{ type: 'piece', title: long('Piece') }
		],
		collections: [{ name: long('Collection'), entries: [0, 1] }]
	});

	for (const width of [320, 390, 1280]) {
		await page.setViewportSize({ width, height: 800 });
		await open(page, '/');
		const main = page.locator('main');
		await expect(main.locator('img')).toHaveCount(0);
		await expect(main.getByRole('article').first()).toBeVisible();
		// every card shows its initials plate where the photo would be
		for (const card of await main.getByRole('article').all()) {
			const title = (await card.getByRole('heading').textContent())!.trim();
			const plate = card.getByRole('img', { name: title, exact: true });
			await expect(plate).toHaveCount(1);
			await expect(plate.locator('.mono')).toHaveText(/^\S{1,2}$/);
		}
		await expect(collectionsRegion(page).getByRole('img', { name: /collage$/ })).toBeVisible();
		const { scrollWidth, clientWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
		expect(scrollWidth, `${width}px`).toBeLessThanOrEqual(clientWidth);
	}
});

test('Scenario: Collections and Settings are reached from Home on the phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the phone bar has no Collections or Settings');
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }], collections: [{ name: 'Late Night', entries: [0] }] });
	await open(page, '/music');
	await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: /^(Collections|Settings)$/ })).toHaveCount(0);

	await openSection(page, 'Collections');
	await expect(page).toHaveURL(/\/collections$/);
	await openSection(page, 'Settings');
	await expect(page).toHaveURL(/\/settings$/);
});
