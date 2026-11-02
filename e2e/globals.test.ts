import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Ambient is a fixed layer', async ({ page }) => {
	await open(page, '/');
	await page.evaluate(() => window.scrollTo(0, 2000));

	const world = await page.locator('[data-world]').evaluate((el) => {
		const own = getComputedStyle(el);
		const layer = getComputedStyle(el, '::before');
		return {
			attachment: own.backgroundAttachment,
			position: layer.position,
			inset: [layer.top, layer.right, layer.bottom, layer.left],
			z: layer.zIndex,
			image: layer.backgroundImage,
			isolation: own.isolation
		};
	});
	expect(world.attachment).not.toContain('fixed');
	expect(world.position).toBe('fixed');
	expect(world.inset).toEqual(['0px', '0px', '0px', '0px']);
	expect(Number(world.z)).toBeLessThan(0);
	expect(world.image).toContain('radial-gradient');
	expect(world.isolation).toBe('isolate');
});

const cursor = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).cursor);

async function seedChrome(request: Parameters<typeof reset>[0]) {
	await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'done', rating: 4, note: 'On repeat all winter.' },
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

	for (const path of ['/', '/animanga/anime']) {
		await open(page, path);
		expect(await cursor(page.locator('.eyebrow')), `${path} eyebrow`).toBe('default');
		expect(await cursor(page.locator('.topbar nav a span')), `${path} nav label`).toBe('pointer');
	}
	await open(page, '/');
	expect(await cursor(page.locator('[data-shelf] .count')), 'shelf count').toBe('default');
	expect(await cursor(page.locator('[data-shelf-row] [data-card-chip]')), 'shelf card chip').toBe('grab');
	expect(await cursor(page.locator('[data-shelf-row] [data-card] .meta')), 'shelf card meta').toBe('grab');
	await open(page, '/animanga/anime');
	await expect(page.locator('[data-shelf-row]')).toHaveCount(0);
	expect(await cursor(page.locator('[data-card-chip]')), 'grid card chip').toBe('default');
	expect(await cursor(page.locator('[data-card] .meta')), 'grid card meta').toBe('default');
});

test('Scenario: Links and buttons keep the pointer', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'cursors are a pointer-device concern');
	await seedChrome(request);
	await seed(request, { entries: Array.from({ length: 20 }, (_, i) => ({ type: 'album' as const, title: `Record ${i + 1}` })) });

	for (const path of ['/', '/animanga/anime']) {
		await open(page, path);
		expect(await cursor(page.locator('.topbar nav a')), `${path} nav link`).toBe('pointer');
		expect(await cursor(page.locator('[data-card-title] a')), `${path} card title link`).toBe('pointer');
	}
	await open(page, '/');
	expect(await cursor(page.getByRole('button', { name: 'Scroll right' }).and(page.locator(':enabled'))), 'shelf arrow').toBe('pointer');
});

test('Scenario: Prose keeps the text cursor and stays selectable', async ({ page, request }) => {
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
		const prose = page.locator('[data-prose]');
		await expect(prose, path).toHaveText(text);
		const style = await prose.evaluate((el) => {
			const s = getComputedStyle(el);
			return { cursor: s.cursor, select: s.userSelect };
		});
		expect(['text', 'auto'], path).toContain(style.cursor);
		expect(style.select, path).not.toBe('none');
	}
});

const ring = (locator: Locator) =>
	locator.evaluate((el) => {
		const s = getComputedStyle(el);
		return { style: s.outlineStyle, width: s.outlineWidth, offset: parseFloat(s.outlineOffset), radius: s.borderRadius };
	});

test('Scenario: Focus ring follows the element\'s own radius', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'keyboard focus is a desktop concern');
	const {
		entries: [album]
	} = await seed(request, {
		entries: [
			{ type: 'album', title: 'Blonde', status: 'done', rating: 4 },
			{ type: 'album', title: 'Nikes', status: 'want' }
		]
	});

	const targets: [string, string, (page: Page) => Locator][] = [
		['star rating', `/entries/${album}`, (p) => p.getByRole('slider', { name: 'Rating', exact: true })],
		['nav link', '/', (p) => p.locator('.topbar nav a').first()],
		['filter chip', '/music/albums', (p) => p.getByRole('toolbar', { name: 'Filters' }).getByRole('button', { name: 'All', exact: true })]
	];

	for (const [name, path, find] of targets) {
		await open(page, path);
		const locator = find(page);
		const before = await ring(locator);
		await locator.focus();
		await page.keyboard.press('Shift');
		// the ring's width settles over the 1 ms reduced-motion transition
		await expect.poll(() => ring(locator).then((r) => r.width), name).toBe('2px');
		const after = await ring(locator);
		expect(after.style, name).toBe('solid');
		expect(after.offset, name).toBeGreaterThan(0);
		expect(after.radius, name).toBe(before.radius);
	}
});

test('Scenario: Focused card shows one ring on its corners', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'keyboard focus is a desktop concern');
	await seed(request, { entries: [{ type: 'album', title: 'Blonde' }] });
	await open(page, '/music/albums');

	const link = page.locator('[data-card-title] a');
	await link.focus();
	await page.keyboard.press('Shift');
	const cardShadow = () => page.locator('[data-card]').evaluate((el) => getComputedStyle(el).boxShadow);
	await expect.poll(cardShadow).toContain('rgb(243, 241, 236)');
	expect(await page.locator('[data-card]').evaluate((el) => getComputedStyle(el).borderRadius)).toBe('24px');
	expect((await ring(link)).style).toBe('none');
	expect(await link.evaluate((el) => getComputedStyle(el).boxShadow)).toBe('none');
});
