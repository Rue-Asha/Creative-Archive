import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { accents, schemes } from '../src/lib/styles/tokens.ts';
import { CANDIDATES } from '../src/lib/styles/worlds.ts';
import { calm, open } from './helpers.ts';

const worlds = ['home', 'music', 'animanga', 'books', 'fashion'] as const;
const colorSchemes = ['light', 'dark'] as const;

// the world's scheme and accent reach every element as inherited custom properties, so the page heading shows them
const tokensOf = (page: Page) =>
	page
		.getByRole('heading', { level: 1 })
		.first()
		.evaluate((el) => {
			const style = getComputedStyle(el);
			// the build's CSS minifier may shorten #111111 to #111
			const value = (name: string) => style.getPropertyValue(name).trim().toUpperCase().replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3');
			return { ground: value('--ground'), ink: value('--ink'), accent: value('--accent'), font: style.fontFamily.split(',')[0].replace(/['"]/g, '') };
		});

for (const world of worlds) {
	for (const scheme of colorSchemes) {
		const path = `/__mockups/${world}/${scheme}`;

		test.describe(`mockup ${world}/${scheme}`, () => {
			test(`Scenario: Mockups render every world in light and dark (${world}/${scheme})`, async ({ page }) => {
				await calm(page);
				await open(page, path);
				const tokens = await tokensOf(page);

				expect(tokens.ground).toBe(schemes[scheme].ground.toUpperCase());
				expect(tokens.accent).toBe(accents[CANDIDATES[world][0]][scheme].accent.toUpperCase());
				await expect(page.locator('[data-hero-image]').first()).toBeVisible();
				const shelf = page.getByRole('region').filter({ has: page.getByRole('article') }).first();
				await expect(shelf.getByRole('article').first()).toBeVisible();
				expect(await shelf.getByRole('article').count()).toBeGreaterThanOrEqual(4);
			});

			test(`Scenario: Pages load no external resources (${world}/${scheme})`, async ({ page, baseURL }) => {
				const origins = new Set<string>();
				page.on('request', (request) => {
					origins.add(new URL(request.url()).origin);
				});
				await open(page, path);
				await page.waitForLoadState('networkidle');

				expect([...origins]).toEqual([new URL(baseURL!).origin]);
			});

			test(`Scenario: Controls are at least 44px on phone (${world}/${scheme})`, async ({ page }, info) => {
				test.skip(info.project.name !== 'phone', 'the 44px rule is for phone');
				await calm(page);
				await open(page, path);
				const small = await page.evaluate(() =>
					[...document.querySelectorAll('button, a[href], input, select, [role="slider"]')]
						.filter((el) => {
							const r = el.getBoundingClientRect();
							return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]');
						})
						// a card's title link is stretched over the whole card by a pseudo-element
						.filter((el) => !el.closest('article h3'))
						.map((el) => {
							const r = el.getBoundingClientRect();
							return { control: el.outerHTML.slice(0, 100), width: Math.round(r.width), height: Math.round(r.height) };
						})
						.filter((c) => c.width < 44 || c.height < 44)
				);

				expect(small).toEqual([]);
			});

			test(`Scenario: Mockups share one alignment rule (${world}/${scheme})`, async ({ page }, info) => {
				await calm(page);
				await open(page, path);
				const edges = async (level: number) => {
					const xs: number[] = [];
					for (const heading of await page.getByRole('heading', { level }).all()) {
						if (await heading.isVisible()) xs.push(Math.round((await heading.boundingBox())!.x));
					}
					return xs;
				};
				const viewport = page.viewportSize()!.width;
				const header = await edges(1);
				const sections = await edges(2);
				const columns = await page.evaluate(() =>
					[...document.querySelectorAll('[data-column]')].map((el) => el.getBoundingClientRect()).filter((b) => b.width > 0).map((b) => ({ left: b.left, right: b.right }))
				);
				const pageHeaders = await page.evaluate(() =>
					[...document.querySelectorAll('[data-page-header]')].map((el) => el.getBoundingClientRect()).filter((b) => b.width > 0).map((b) => b.left)
				);

				expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport);
				expect(columns.length).toBeGreaterThan(1);
				expect(header).toHaveLength(1);
				expect(pageHeaders).toHaveLength(1);
				expect(sections.length).toBeGreaterThanOrEqual(3);
				const [column] = columns;
				for (const c of columns) {
					expect(Math.abs(c.left - column.left)).toBeLessThanOrEqual(1);
					expect(Math.abs(c.right - column.right)).toBeLessThanOrEqual(1);
				}
				const expected = info.project.name === 'phone' ? 16 : (viewport - 1200) / 2;
				expect(Math.abs(column.left - expected)).toBeLessThanOrEqual(1);
				expect(column.right - column.left).toBeLessThanOrEqual(1200);
				for (const x of [...pageHeaders, ...sections]) expect(Math.abs(x - column.left)).toBeLessThanOrEqual(1);
				if (world !== 'home') for (const x of header) expect(Math.abs(x - column.left)).toBeLessThanOrEqual(1);
			});

			test(`Scenario: Mockup screenshots are produced for both viewports (${world}/${scheme})`, async ({ page }, info) => {
				await calm(page);
				await open(page, path);
				await page.evaluate(async () => {
					for (const img of document.querySelectorAll('img')) img.loading = 'eager';
					await document.fonts.ready;
					await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
					await Promise.all(
						document.getAnimations().map((a) => (a.effect?.getTiming().iterations === Infinity ? undefined : a.finished.catch(() => undefined)))
					);
				});
				await page.waitForTimeout(900);
				// a full-page shot would leave the fixed nav half-way down the image; pin its wrapper to the page's end
				await page
					.getByRole('navigation', { name: 'Main' })
					.last()
					.evaluate((el) => {
						document.body.style.position = 'relative';
						el.parentElement!.style.setProperty('position', 'absolute', 'important');
					});

				const shot = `test-results/shots/mockups/${info.project.name}-${world}-${scheme}.png`;
				await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });

				expect(existsSync(shot)).toBe(true);
			});
		});
	}
}

test('Scenario: Switching a world is a data change', async ({ page }) => {
	await calm(page);
	for (const accent of ['ember', 'violet'] as const) {
		await open(page, `/__mockups/music/dark?accent=${accent}`);
		const tokens = await tokensOf(page);

		expect(tokens.ground).toBe(schemes.dark.ground.toUpperCase());
		expect(tokens.ink).toBe(schemes.dark.ink.toUpperCase());
		expect(tokens.accent).toBe(accents[accent].dark.accent.toUpperCase());
		expect(tokens.font).toBe('Bricolage Grotesque');
	}
});

test('accent b picks the second candidate and an unknown accent is a 404', async ({ page }) => {
	await open(page, '/__mockups/books/light?accent=b');
	expect((await tokensOf(page)).accent).toBe(accents.oxblood.light.accent.toUpperCase());
	const response = await page.goto('/__mockups/books/light?accent=ember');
	expect(response?.status()).toBe(404);
});
