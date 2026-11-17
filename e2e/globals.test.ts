import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, cardOf, cardTitles, cards, open, reset, seed, shelf } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const cursor = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).cursor);

async function seedChrome(request: Parameters<typeof reset>[0]) {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'done', rating: 8, note: 'On repeat all winter.' },
			{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } } }
		],
		collections: [{ name: 'Winter', description: 'Quiet records for cold days.', entries: [0] }]
	});
}

test('Scenario: Chrome text shows the default cursor', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'cursors are a pointer-device concern');
	await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', details: { year: 2023 }, progress: { episodes: { current: 3, total: 28 } } }]
	});

	const nav = page.getByRole('navigation', { name: 'Main' });
	const main = page.getByRole('main');
	for (const [path, eyebrow] of [['/animanga', 'What you watch and read, episode by episode.'], ['/', 'Home'], ['/animanga/anime', 'Animanga · episode by episode']] as const) {
		await open(page, path);
		expect(await cursor(main.getByText(eyebrow, { exact: true })), `${path} eyebrow`).toBe('default');
	}
	for (const path of ['/', '/animanga/anime']) {
		await open(page, path);
		expect(await cursor(nav.getByText('Music', { exact: true })), `${path} nav label`).toBe('pointer');
	}
	await open(page, '/');
	const frieren = cardOf(shelf(page, 'In progress'), 'Frieren');
	expect(await cursor(shelf(page, 'In progress').getByText(/^\d+ entr(y|ies)$/)), 'shelf count').toBe('default');
	expect(await cursor(frieren.getByText('Watching', { exact: true })), 'shelf card chip').toBe('grab');
	expect(await cursor(frieren.getByText('Anime · 2023', { exact: true })), 'shelf card meta').toBe('grab');
	await open(page, '/animanga/anime');
	// the list page lays its cards in the one grid, not in shelf rows
	const grid = page.getByRole('region', { name: 'Anime list', exact: true });
	await expect(cards(grid)).toHaveCount(1);
	expect(await cursor(cards(grid).getByText('Watching', { exact: true })), 'grid card chip').toBe('default');
	expect(await cursor(cards(grid).getByText('2023', { exact: true })), 'grid card meta').toBe('default');
});

test('Scenario: Links and buttons keep the pointer', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'cursors are a pointer-device concern');
	await seedChrome(request);
	await seed(request, { entries: Array.from({ length: 20 }, (_, i) => ({ type: 'album' as const, title: `Record ${i + 1}` })) });

	for (const path of ['/', '/animanga/anime']) {
		await open(page, path);
		expect(await cursor(page.getByRole('navigation', { name: 'Main' }).getByRole('link')), `${path} nav link`).toBe('pointer');
		expect(await cursor(cardTitles(page).getByRole('link')), `${path} card title link`).toBe('pointer');
	}
	await open(page, '/');
	expect(await cursor(page.getByRole('button', { name: 'Scroll right' }).and(page.locator(':enabled'))), 'shelf arrow').toBe('pointer');
});

test('Scenario: Prose stays selectable without the text cursor', async ({ page, request }) => {
	const {
		entries: [entry],
		collections: [collection]
	} = await seed(request, {
		entries: [{ type: 'album', title: 'Blonde', note: 'On repeat all winter.' }],
		collections: [{ name: 'Winter', description: 'Quiet records for cold days.', entries: [0] }]
	});

	for (const [path, text] of [
		[`/entries/${entry}`, 'On repeat all winter.'],
		[`/collections/${collection}`, 'Quiet records for cold days.']
	]) {
		await open(page, path);
		const prose = page.getByText(text, { exact: true });
		await expect(prose, path).toBeVisible();
		const style = await prose.evaluate((el) => {
			const s = getComputedStyle(el);
			return { cursor: s.cursor, select: s.userSelect };
		});
		expect(style.cursor, path).toBe('default');
		expect(style.select, path).not.toBe('none');
	}
});

test('Scenario: Chrome is not selectable, fields are', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'one viewport is enough for computed styles');
	const {
		entries: [entry]
	} = await seed(request, { entries: [{ type: 'album', title: 'Blonde', status: 'done', note: 'On repeat all winter.' }] });
	const select = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).userSelect);

	await open(page, `/entries/${entry}`);
	expect(await select(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Music' })), 'nav link').toBe('none');
	expect(await select(page.getByRole('button', { name: 'Entry menu' })), 'entry menu').toBe('none');
	expect(await select(page.getByRole('button', { name: /^Status/ })), 'status button').toBe('none');
	expect(await select(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Albums' })), 'kicker link').toBe('none');
	const heading = page.getByRole('heading', { level: 1 });
	expect(await select(heading), 'page heading').toBe('none');
	expect(await select(page.getByRole('heading', { name: 'In collections' })), 'card heading').toBe('none');
	const selected = () => page.evaluate(() => getSelection()?.toString() ?? '');
	await heading.dblclick();
	expect(await selected(), 'a double-click on the heading').toBe('');
	await page.getByText('On repeat all winter.', { exact: true }).dblclick();
	expect((await selected()).trim(), 'a double-click on the note').not.toBe('');

	await open(page, `/entries/${entry}/edit`);
	expect(await select(page.locator('label', { hasText: /^Title$/ })), 'field label').toBe('none');
	const title = page.getByLabel('Title');
	expect(await select(title), 'title input').not.toBe('none');
	expect(['auto', 'text']).toContain(await cursor(title));
	await title.fill('Blonde (deluxe)');
	await expect(title).toHaveValue('Blonde (deluxe)');
});

// the ring is drawn by the focused element or by the wrapper around it (a field draws it on its control)
const ringed = (locator: Locator, depth?: number) =>
	locator.evaluate((el, at) => {
		const nodes = [el, el.parentElement, el.parentElement?.parentElement].filter((n) => !!n) as Element[];
		const style = (node: Element) => {
			const s = getComputedStyle(node);
			return { style: s.outlineStyle, width: s.outlineWidth, offset: parseFloat(s.outlineOffset), color: s.outlineColor, radius: s.borderRadius };
		};
		const found = at ?? Math.max(0, nodes.findIndex((node) => getComputedStyle(node).outlineStyle !== 'none'));
		return { depth: found, ...style(nodes[found]) };
	}, depth);

test("Scenario: Focus ring follows the element's own radius", async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'keyboard focus is a desktop concern');
	const {
		entries: [album]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'done', rating: 8 },
			{ type: 'album', title: 'Nikes', status: 'want' }
		]
	});

	const targets: [string, string, (page: Page) => Locator][] = [
		['rating field', `/entries/${album}`, (p) => p.getByRole('spinbutton', { name: 'Rating', exact: true })],
		['sub-type kicker link', '/music/albums', (p) => p.getByRole('main').getByRole('link', { name: 'Artists', exact: true }).first()],
		['nav link', '/', (p) => p.getByRole('navigation', { name: 'Main' }).getByRole('link').first()]
	];

	for (const [name, path, find] of targets) {
		await open(page, path);
		const locator = find(page);
		await locator.focus();
		await page.keyboard.press('Shift');
		const after = await ringed(locator);
		const width = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--focus-width').trim());
		expect(after.style, name).toBe('solid');
		expect(after.width, name).toBe(width);
		expect(after.offset, name).toBeGreaterThan(0);
		// the radius it keeps is the element's own, not a pill forced on it
		await page.evaluate(() => (document.activeElement as HTMLElement).blur());
		expect((await ringed(locator, after.depth)).radius, name).toBe(after.radius);
		if (name === 'rating field') expect(after.color, name).toBe('rgb(255, 255, 255)');
	}
});
