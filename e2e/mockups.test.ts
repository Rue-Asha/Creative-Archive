import { expect, test, type Page } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

// U4 runs beside U3, before e2e/helpers.ts exists on its branch, so it opens pages itself.
const worlds = ['home', 'music', 'animanga', 'books', 'fashion'] as const;
const schemes = ['light', 'dark'] as const;

async function open(page: Page, path: string) {
	await page.goto(path);
	await expect(page.locator('html[data-hydrated]')).toBeAttached();
	await page.evaluate(() => document.fonts.ready);
}

const calm = (page: Page) => page.emulateMedia({ reducedMotion: 'reduce' });

// the mirror of tokens.css, read as text so the test needs no TS import of app code
const tokens = readFileSync('src/lib/styles/tokens.ts', 'utf8');
function tokenValue(block: string, name: string): string {
	const start = tokens.indexOf(block);
	const m = tokens.slice(start).match(new RegExp(`'?${name}'?: '([^']+)'`));
	return m![1];
}
const rgb = (hex: string) => {
	const n = parseInt(hex.slice(1), 16);
	return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`;
};

for (const world of worlds) {
	for (const scheme of schemes) {
		const path = `/__mockups/${world}/${scheme}`;

		test.describe(`mockup ${world}/${scheme}`, () => {
			test(`Scenario: Mockups render every world in light and dark (${world}/${scheme})`, async ({ page }) => {
				await calm(page);
				await open(page, path);
				const wrapper = page.locator('[data-world]');

				await expect(wrapper).toHaveAttribute('data-scheme', scheme);
				await expect(wrapper).toHaveAttribute('data-world', world);
				await expect(page.locator('[data-hero] img').first()).toBeVisible();
				await expect(page.locator('[data-shelf]').first().locator('[data-card]').first()).toBeVisible();
				expect(await page.locator('[data-shelf]').first().locator('[data-card]').count()).toBeGreaterThanOrEqual(4);
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
						.filter((el) => !el.closest('[data-card-title]'))
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
				const m = await page.evaluate(() => {
					const left = (el: Element) => el.getBoundingClientRect().left;
					const visible = (el: Element) => el.getBoundingClientRect().width > 0;
					const columns = [...document.querySelectorAll('[data-column]')].filter(visible).map((el) => el.getBoundingClientRect());
					return {
						viewport: document.documentElement.clientWidth,
						scrollWidth: document.documentElement.scrollWidth,
						columns: columns.map((c) => ({ left: c.left, right: c.right })),
						header: [...document.querySelectorAll('[data-page-header]')].filter(visible).map(left),
						sections: [...document.querySelectorAll('[data-section-heading]')].filter(visible).map(left)
					};
				});

				expect(m.scrollWidth).toBe(m.viewport);
				expect(m.columns.length).toBeGreaterThan(1);
				expect(m.header).toHaveLength(1);
				expect(m.sections.length).toBeGreaterThanOrEqual(3);
				const [column] = m.columns;
				for (const c of m.columns) {
					expect(Math.abs(c.left - column.left)).toBeLessThanOrEqual(1);
					expect(Math.abs(c.right - column.right)).toBeLessThanOrEqual(1);
				}
				const expected = info.project.name === 'phone' ? 16 : (m.viewport - 1200) / 2;
				expect(Math.abs(column.left - expected)).toBeLessThanOrEqual(1);
				expect(column.right - column.left).toBeLessThanOrEqual(1200);
				for (const x of [...m.header, ...m.sections]) expect(Math.abs(x - column.left)).toBeLessThanOrEqual(1);
			});

			test(`Scenario: Mockup screenshots are produced for both viewports (${world}/${scheme})`, async ({ page }, info) => {
				await open(page, path);
				await page.evaluate(async () => {
					for (const img of document.querySelectorAll('img')) img.loading = 'eager';
					for (const el of document.querySelectorAll('[data-reveal]')) el.setAttribute('data-revealed', '');
					await document.fonts.ready;
					await Promise.all([...document.images].map((img) => img.decode().catch(() => undefined)));
					await Promise.all(
						document.getAnimations().map((a) => (a.effect?.getTiming().iterations === Infinity ? undefined : a.finished.catch(() => undefined)))
					);
				});
				await page.waitForTimeout(900);
				// a full-page shot would leave the fixed nav half-way down the image; pin it to the page's end
				await page.addStyleTag({ content: 'body { position: relative } [data-shot-bottom] { position: absolute !important }' });

				const shot = `test-results/shots/mockups/${info.project.name}-${world}-${scheme}.png`;
				await page.screenshot({ path: shot, fullPage: true, animations: 'disabled' });

				expect(existsSync(shot)).toBe(true);
			});
		});
	}
}

test('Scenario: Switching a world is a data change', async ({ page }) => {
	await calm(page);
	for (const accent of ['ember', 'violet']) {
		await open(page, `/__mockups/music/dark?accent=${accent}`);
		const wrapper = page.locator('[data-world]');
		await expect(wrapper).toHaveAttribute('data-accent', accent);
		await expect(wrapper).toHaveAttribute('data-font', 'a');
		const computed = await wrapper.evaluate((el) => {
			const s = getComputedStyle(el);
			// the build's CSS minifier may shorten #111111 to #111
			const value = (name: string) =>
				s.getPropertyValue(name).trim().toUpperCase().replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3');
			return { ground: value('--ground'), ink: value('--ink'), accent: value('--accent') };
		});

		expect(computed.ground).toBe(tokenValue('dark: {', 'ground'));
		expect(computed.ink).toBe(tokenValue('dark: {', 'ink'));
		const darkAccent = tokens.match(new RegExp(`${accent}: accent\\(\\[[^\\]]*\\], \\['([^']+)'`))![1];
		expect(computed.accent).toBe(darkAccent);
		// and the wrapper is painted with it
		expect(await wrapper.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(rgb(tokenValue('dark: {', 'ground')));
	}
});

test('accent b picks the second candidate and an unknown accent is a 404', async ({ page }) => {
	await open(page, '/__mockups/books/light?accent=b');
	await expect(page.locator('[data-world]')).toHaveAttribute('data-accent', 'oxblood');
	const response = await page.goto('/__mockups/books/light?accent=ember');
	expect(response?.status()).toBe(404);
});
