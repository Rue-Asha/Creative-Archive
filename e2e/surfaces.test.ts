import { expect, test, type Page } from '@playwright/test';
import { calm, open, reset, seed } from './helpers.ts';

// Splits a computed CSS image value into its gradient layers and counts each layer's colour stops, with the
// positions of those that name one.
const gradients = (page: Page, selector: string, property: 'maskImage' | 'backgroundImage') =>
	page.locator(selector).first().evaluate((el, prop) => {
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

test('Scenario: Hero photo fades through the eased mask', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { heroes: ['music'] });
	await open(page, '/music');

	await expect(page.locator('[data-hero] [data-hero-image]')).toHaveCount(1);
	fiveStops(await gradients(page, '[data-hero] .photo', 'maskImage'));
	fiveStops(await gradients(page, '[data-hero] .scrim', 'maskImage'));
	const scrim = await gradients(page, '[data-hero] .scrim', 'backgroundImage');
	fiveStops(scrim);
	noHardStep(scrim);
});

test('Scenario: Framed Home hero fades the same way', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { heroes: ['home'] });
	await open(page, '/');

	fiveStops(await gradients(page, '.frame [data-hero] .photo', 'maskImage'));
});

test('Scenario: Hero without photo blends in oklab', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await open(page, '/books');

	const layers = await gradients(page, '[data-hero] [data-hero-gradient]', 'backgroundImage');
	// the ambient radial is already resolved to oklab() stops, so only the linear layer names its space
	const linear = layers.filter(({ layer }) => layer.startsWith('linear-gradient'));
	expect(linear.length).toBeGreaterThan(0);
	for (const { layer } of linear) expect(layer).toContain('in oklab');
	const image = await page.locator('[data-hero-gradient]').evaluate((el) => getComputedStyle(el).backgroundImage);
	expect(image).toContain('url(');
});

const glowOf = (page: Page, scope: string) => page.locator(`${scope} .glow`);

async function glowStyle(glow: ReturnType<typeof glowOf>) {
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

	const glow = glowOf(page, '[data-shelf]');
	await expect(page.locator('[data-shelf]').first()).toBeVisible();
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

	const section = page.locator('[data-shelf]').first();
	const sectionBox = (await section.boundingBox())!;
	const glowBox = (await glowOf(page, '[data-shelf]').first().boundingBox())!;
	const centre = (box: { x: number; width: number }) => box.x + box.width / 2;
	expect(Math.abs(centre(glowBox) - centre(sectionBox))).toBeLessThanOrEqual(2);
	// the light itself, not only its box: the one cover fills the whole box
	const imageBox = (await glowOf(page, '[data-shelf]').first().locator('img').boundingBox())!;
	expect(Math.abs(centre(imageBox) - centre(sectionBox))).toBeLessThanOrEqual(2);
});

test('Scenario: Shelf glow has room to fade vertically', async ({ page, request }, info) => {
	test.skip(info.project.name !== 'desktop', 'desktop layout');
	await calm(page);
	await reset(request);
	await seed(request, { entries: covers(3) });
	await open(page, '/music');

	const sectionBox = (await page.locator('[data-shelf]').first().boundingBox())!;
	const glowBox = (await glowOf(page, '[data-shelf]').first().boundingBox())!;
	const room = sectionBox.height * 0.15;
	expect(sectionBox.y - glowBox.y).toBeGreaterThanOrEqual(room);
	expect(glowBox.y + glowBox.height - (sectionBox.y + sectionBox.height)).toBeGreaterThanOrEqual(room);
});

test('Scenario: No glow without covers', async ({ page, request }) => {
	await calm(page);
	await reset(request);
	await seed(request, { entries: [{ type: 'album', title: 'Plain', status: 'want' }] });
	await open(page, '/music');

	await expect(page.locator('[data-shelf]').first()).toBeVisible();
	await expect(glowOf(page, '[data-shelf]')).toHaveCount(0);
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

	const bento = glowOf(page, '[aria-label="Collections"]');
	await expect(bento.first().locator('img')).toHaveCount(1);
	const bentoStyle = await glowStyle(bento);
	expect(bentoStyle.saturate).toBeLessThanOrEqual(1.2);
	expect(stops(bentoStyle.mask)).toBeGreaterThanOrEqual(5);

	await open(page, '/music/albums');
	const list = glowOf(page, '[aria-label$=" list"]');
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

	const head = page.locator('[data-shelf-head]').first();
	const heading = (await head.locator('h2').boundingBox())!;
	expect(Math.abs(heading.x - (1280 - 1200) / 2)).toBeLessThanOrEqual(1);
	const bar = await head.evaluate((el) => {
		const style = getComputedStyle(el, '::before');
		return { top: parseFloat(style.top), bottom: parseFloat(style.bottom), left: parseFloat(style.left), x: el.getBoundingClientRect().x };
	});
	expect(bar.top).toBeCloseTo(bar.bottom, 1);
	expect(heading.x - (bar.x + bar.left)).toBeGreaterThanOrEqual(16);
});
