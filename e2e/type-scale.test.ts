import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, progressValue, reset, seed, shelf } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const px = (value: string) => parseFloat(value);
const sizeOf = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).fontSize);
const spacingOf = (locator: Locator) => locator.first().evaluate((el) => getComputedStyle(el).letterSpacing);

async function eyebrowToken(page: Page) {
	return page.evaluate(() => {
		const probe = document.createElement('span');
		probe.style.cssText = 'font-size: var(--t-eyebrow); letter-spacing: var(--tracking-eyebrow)';
		document.body.append(probe);
		const { fontSize, letterSpacing } = getComputedStyle(probe);
		probe.remove();
		return { fontSize, letterSpacing };
	});
}

const homeData = {
	entries: Array.from({ length: 6 }, (_, i) => ({ type: 'album' as const, title: `Album ${i + 1}`, status: 'done' as const })),
	collections: [{ name: 'Winter evenings', entries: [0, 1, 2] }]
};

test('Scenario: Section headings share one size', async ({ page, request }, info) => {
	await seed(request, homeData);
	await open(page, '/');
	const headings = page.getByRole('heading', { level: 2 });
	await expect(headings.first()).toBeVisible();
	const sizes = await headings.evaluateAll((els) => els.map((el) => getComputedStyle(el).fontSize));

	expect(sizes.length).toBeGreaterThanOrEqual(2);
	for (const size of sizes) expect(px(size)).toBe(info.project.name === 'phone' ? 26 : 44);
});

test('Scenario: Shelf heading fits one line on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'the wrap only happens on the phone');
	await seed(request, homeData);
	await open(page, '/');
	const recent = shelf(page, 'Recently added · Music');
	const heading = recent.getByRole('heading', { level: 2 });
	await expect(heading).toContainText('Music');
	const box = (await heading.boundingBox())!;
	const lineHeight = px(await heading.evaluate((el) => getComputedStyle(el).lineHeight));
	const count = (await recent.getByText(/^\d+$/).boundingBox())!;

	expect(box.height).toBeLessThanOrEqual(lineHeight * 1.1);
	expect(count.y + count.height / 2).toBeGreaterThan(box.y);
	expect(count.y + count.height / 2).toBeLessThan(box.y + box.height);
});

test('Scenario: Inputs do not zoom on phone', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'phone', 'zoom on focus is an iOS phone behaviour');
	const {
		entries: [anime],
		collections: [collection]
	} = await seed(request, {
		entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } } }],
		collections: [{ name: 'Moodboard', entries: [0] }]
	});
	const small = async (label: string) => {
		const sizes = await page
			.getByRole('textbox')
			.or(page.getByRole('searchbox'))
			.or(page.getByRole('combobox'))
			.or(page.getByRole('spinbutton'))
			.evaluateAll((els) =>
				els.filter((el) => (el as HTMLElement).offsetParent !== null).map((el) => parseFloat(getComputedStyle(el).fontSize))
			);
		expect(sizes.length, label).toBeGreaterThan(0);
		for (const size of sizes) expect(size, label).toBeGreaterThanOrEqual(16);
	};

	await open(page, '/add/anime?manual=1');
	await small('add form');
	await open(page, '/add/anime');
	await small('add search');
	await open(page, `/entries/${anime}/edit`);
	await small('edit form');
	await open(page, '/animanga/anime');
	await small('filter bar');
	await open(page, '/collections');
	await page.getByRole('button', { name: 'New collection' }).click();
	await expect(page.getByLabel('Name')).toBeVisible();
	await small('collections index form');
	await open(page, `/collections/${collection}`);
	await page.getByRole('button', { name: 'Rename' }).click();
	await expect(page.getByLabel('Name')).toBeVisible();
	await small('collection rename form');
	await open(page, `/entries/${anime}`);
	await page.getByRole('button', { name: 'Add to collection' }).click();
	await page.getByRole('menu', { name: 'Add to collection' }).getByRole('button', { name: 'New collection' }).click();
	await expect(page.getByLabel('Name')).toBeVisible();
	await small('add-to-collection popover');
	await page.keyboard.press('Escape');
	await open(page, `/entries/${anime}`);
	await progressValue(page, 'Episodes').click();
	await expect(page.getByRole('group', { name: 'Episodes', exact: true }).getByRole('textbox')).toBeVisible();
	await small('progress input');
});

test('Scenario: Caps labels share the eyebrow style', async ({ page, request }) => {
	const {
		entries: [anime]
	} = await seed(request, { entries: [{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 3, total: 28 } } }] });
	await open(page, '/animanga');
	const token = await eyebrowToken(page);
	const eyebrow = page.getByText('Domain', { exact: true });
	expect(await sizeOf(eyebrow)).toBe(token.fontSize);
	expect(await spacingOf(eyebrow)).toBe(token.letterSpacing);

	await seed(request, { entries: [{ type: 'book', title: 'Covered', image: true }] });
	await open(page, '/');
	const counter = page.getByLabel(/^\d+ of \d+$/);
	expect(await sizeOf(counter)).toBe(token.fontSize);
	expect(await spacingOf(counter)).toBe(token.letterSpacing);

	await open(page, '/add/anime?manual=1');
	await page.getByLabel('Add a tag').fill('Brand new tag');
	await page.getByLabel('Add a tag').press('Enter');
	const badge = page.getByText('new', { exact: true });
	await expect(badge).toBeVisible();
	expect(await sizeOf(badge)).toBe(token.fontSize);
	expect(await spacingOf(badge)).toBe(token.letterSpacing);

	await open(page, `/entries/${anime}`);
	const label = page.getByText('Episodes', { exact: true });
	await expect(label).toBeVisible();
	expect(await sizeOf(label)).toBe(token.fontSize);
	expect(await spacingOf(label)).toBe(token.letterSpacing);
});

test('Scenario: Phone tab bar labels have room', async ({ page }, info) => {
	test.skip(info.project.name !== 'phone', 'the tab bar is the phone nav');
	for (const path of ['/animanga', '/collections']) {
		await open(page, path);
		const token = await eyebrowToken(page);
		const nav = page.getByRole('navigation', { name: 'Main' });
		const m = await nav.evaluate((el) => {
			const rect = (node: Element | Range) => node.getBoundingClientRect();
			const links = [...el.querySelectorAll('a')];
			const pill = rect(el.querySelector('a[aria-current="page"]')!);
			const active = el.querySelector('a[aria-current="page"] span')!;
			const range = document.createRange();
			range.selectNodeContents(active);
			const text = rect(range);
			const collections = rect(links.find((a) => a.textContent?.trim() === 'Collections')!);
			const bar = rect(el);
			return {
				sizes: links.flatMap((a) => [...a.querySelectorAll('span')]).map((s) => getComputedStyle(s).fontSize),
				overflow: links.flatMap((a) => [...a.querySelectorAll('span')]).filter((s) => s.scrollWidth > s.clientWidth).map((s) => s.textContent),
				left: text.left - pill.left,
				right: pill.right - text.right,
				collectionsLeft: collections.left - bar.left,
				collectionsRight: bar.right - collections.right,
				pill: pill.width
			};
		});

		expect(new Set(m.sizes), path).toEqual(new Set([token.fontSize]));
		expect(m.overflow, path).toEqual([]);
		expect(m.left, path).toBeGreaterThanOrEqual(4);
		expect(m.right, path).toBeGreaterThanOrEqual(4);
		expect(m.collectionsLeft, path).toBeGreaterThanOrEqual(4);
		expect(m.collectionsRight, path).toBeGreaterThanOrEqual(4);
		expect(m.pill, path).toBeGreaterThanOrEqual(64);
	}
});
