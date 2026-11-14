import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

// Splits a computed CSS image value into its gradient layers and counts each layer's colour stops, with the
// positions of those that name one.
const gradients = (locator: Locator, property: 'maskImage' | 'backgroundImage') =>
	locator.evaluate((el, prop) => {
		const value = getComputedStyle(el)[prop];
		const top = (text: string) => {
			const parts: string[] = [];
			let depth = 0;
			let start = 0;
			for (let i = 0; i < text.length; i++) {
				if (text[i] === '(') depth++;
				else if (text[i] === ')') depth--;
				else if (text[i] === ',' && depth === 0) {
					parts.push(text.slice(start, i).trim());
					start = i + 1;
				}
			}
			parts.push(text.slice(start).trim());
			return parts;
		};
		return top(value)
			.filter((layer) => /gradient\(/.test(layer))
			.map((layer) => {
				const args = top(layer.slice(layer.indexOf('(') + 1, layer.lastIndexOf(')')));
				const list = /(rgb|color|oklab|oklch|transparent|#)/.test(args[0]) ? args : args.slice(1);
				const positions = list.flatMap((stop) => {
					const at = /\s(-?[\d.]+)%$/.exec(stop);
					return at ? [Number(at[1])] : [];
				});
				return { layer, stops: list.length, positions };
			});
	}, property);

const fiveStops = (layers: { stops: number }[]) => {
	expect(layers.length).toBeGreaterThan(0);
	for (const { stops } of layers) expect(stops).toBeGreaterThanOrEqual(5);
};

// an eased ramp has no hard step: no two stops share a position
const noHardStep = (layers: { layer: string; positions: number[] }[]) => {
	for (const { layer, positions } of layers) positions.slice(1).forEach((p, i) => expect(p, layer).toBeGreaterThan(positions[i]));
};

// the hero's photo box and its scrim are the two aria-hidden layers next to the hero's content
const heroLayers = (page: Page) => {
	const hero = page.locator('[data-hero-image]').locator('xpath=ancestor::header[1]');
	const layers = hero.locator(':scope > [aria-hidden="true"]');
	return { photo: layers.nth(0), scrim: layers.nth(1) };
};

test('Scenario: Hero photo fades through the eased mask', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { heroes: ['music'] });
	await open(page, '/music');

	await expect(page.locator('[data-hero-image]')).toHaveCount(1);
	const { photo, scrim } = heroLayers(page);
	fiveStops(await gradients(photo, 'maskImage'));
	fiveStops(await gradients(scrim, 'maskImage'));
	const ramp = await gradients(scrim, 'backgroundImage');
	fiveStops(ramp);
	noHardStep(ramp);
});

test('Scenario: Framed Home hero fades the same way', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { heroes: ['home'] });
	await open(page, '/');

	fiveStops(await gradients(heroLayers(page).photo, 'maskImage'));
});

test('Scenario: Hero without photo blends in oklab', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/books');

	const gradient = page.locator('[data-hero-gradient]');
	const layers = await gradients(gradient, 'backgroundImage');
	// the ambient radial is already resolved to oklab() stops, so only the linear layer names its space
	const linear = layers.filter(({ layer }) => layer.startsWith('linear-gradient'));
	expect(linear.length).toBeGreaterThan(0);
	for (const { layer } of linear) expect(layer).toContain('in oklab');
	const image = await gradient.evaluate((el) => getComputedStyle(el).backgroundImage);
	expect(image).toContain('url(');
});

// a glow is the aria-hidden box that holds the one blurred cover
const glowOf = (scope: Locator) => scope.locator('[aria-hidden="true"]:has(> img)');
const firstShelf = (page: Page) => page.getByRole('region').filter({ has: page.getByRole('article') }).first();

async function glowStyle(glow: Locator) {
	return glow.first().evaluate((el) => {
		const style = getComputedStyle(el);
		const saturate = /saturate\(([\d.]+)\)/.exec(style.filter);
		return { saturate: saturate ? Number(saturate[1]) : 1, mask: style.maskImage };
	});
}

const stops = (mask: string) => (mask.match(/(rgba?\(|oklab\(|color-mix\()/g) ?? []).length;

const covers = (count: number) =>
	Array.from({ length: count }, (_, i) => ({ type: 'album' as const, title: `Album ${i + 1}`, status: 'want' as const, image: true }));

test('Scenario: Shelf glow comes from one cover', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: covers(3) });
	await open(page, '/music');

	const glow = glowOf(firstShelf(page));
	await expect(firstShelf(page)).toBeVisible();
	await expect(glow.first().locator('img')).toHaveCount(1);
	const style = await glowStyle(glow);
	expect(style.saturate).toBeLessThanOrEqual(1.2);
	expect(stops(style.mask)).toBeGreaterThanOrEqual(5);
});

test('Scenario: Shelf glow is centred', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, { entries: covers(1) });
	await open(page, '/music');

	const sectionBox = (await firstShelf(page).boundingBox())!;
	const glow = glowOf(firstShelf(page)).first();
	const glowBox = (await glow.boundingBox())!;
	const centre = (box: { x: number; width: number }) => box.x + box.width / 2;
	expect(Math.abs(centre(glowBox) - centre(sectionBox))).toBeLessThanOrEqual(2);
	// the light itself, not only its box: the one cover fills the whole box
	const imageBox = (await glow.locator('img').boundingBox())!;
	expect(Math.abs(centre(imageBox) - centre(sectionBox))).toBeLessThanOrEqual(2);
});

test('Scenario: Shelf glow has room to fade vertically', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, { entries: covers(3) });
	await open(page, '/music');

	const sectionBox = (await firstShelf(page).boundingBox())!;
	const glowBox = (await glowOf(firstShelf(page)).first().boundingBox())!;
	const room = sectionBox.height * 0.15;
	expect(sectionBox.y - glowBox.y).toBeGreaterThanOrEqual(room);
	expect(glowBox.y + glowBox.height - (sectionBox.y + sectionBox.height)).toBeGreaterThanOrEqual(room);
});

test('Scenario: No glow without covers', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Plain', status: 'want' }] });
	await open(page, '/music');

	await expect(firstShelf(page)).toBeVisible();
	await expect(glowOf(firstShelf(page))).toHaveCount(0);
});

test('Scenario: Bento and list glows match the shelf glow', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, {
		entries: covers(3),
		collections: [
			{ name: 'Winter evenings', entries: [0, 1] },
			{ name: 'Tokyo, someday', entries: [2] }
		]
	});
	await open(page, '/');

	const bento = glowOf(page.getByRole('region', { name: 'Collections', exact: true }));
	await expect(bento.first().locator('img')).toHaveCount(1);
	const bentoStyle = await glowStyle(bento);
	expect(bentoStyle.saturate).toBeLessThanOrEqual(1.2);
	expect(stops(bentoStyle.mask)).toBeGreaterThanOrEqual(5);

	await open(page, '/music/albums');
	const list = glowOf(page.getByRole('region', { name: / list$/ }));
	await expect(list.first().locator('img')).toHaveCount(1);
	const listStyle = await glowStyle(list);
	expect(listStyle.saturate).toBeLessThanOrEqual(1.2);
	expect(stops(listStyle.mask)).toBeGreaterThanOrEqual(5);
});

test('Scenario: Sticky shelf head keeps the heading on the column edge', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'sticky heads are a desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'manga', title: 'Planned', status: 'want' }] });
	await open(page, '/animanga/manga?view=shelves');

	const head = page.locator('main [data-column]').filter({ has: page.getByRole('heading', { level: 2 }) }).first();
	const heading = (await head.getByRole('heading', { level: 2 }).boundingBox())!;
	expect(Math.abs(heading.x - (1280 - 1200) / 2)).toBeLessThanOrEqual(1);
	const bar = await head.evaluate((el) => {
		const style = getComputedStyle(el, '::before');
		return { top: parseFloat(style.top), bottom: parseFloat(style.bottom), left: parseFloat(style.left), x: el.getBoundingClientRect().x };
	});
	expect(bar.top).toBeCloseTo(bar.bottom, 1);
	expect(heading.x - (bar.x + bar.left)).toBeGreaterThanOrEqual(16);
});
