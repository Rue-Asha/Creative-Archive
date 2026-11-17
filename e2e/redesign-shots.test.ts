import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { mockData } from '../src/routes/__mockups/redesign/fixtures.ts';
import { calm, open } from './helpers.ts';

const root = 'src/routes/__mockups/redesign';
const widths = [375, 768, 1280];

// every directory with a +page.svelte, the index included
function screens(dir = ''): string[] {
	const here = existsSync(join(root, dir, '+page.svelte')) ? [dir] : [];
	const below = readdirSync(join(root, dir)).filter((name) => statSync(join(root, dir, name)).isDirectory());
	return [...here, ...below.flatMap((name) => screens(join(dir, name)))];
}

const slugs = screens();
const path = (slug: string, data: string) => `/__mockups/redesign/${slug}${data === 'worst' ? '?data=worst' : ''}`;

// fonts loaded and every card done settling: a shot taken mid-animation shows half-faded cards
async function settle(page: Page) {
	await page.evaluate(() => document.fonts.ready);
	await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
	await page.waitForFunction(() => [...document.images].every((img) => img.complete));
}

// the frame's backdrop-filter rasterises tiles lazily: a full-page capture of a tall page paints everything below the first
// screens blank until the page has been scrolled through once
async function scrolled(page: Page) {
	const height = await page.evaluate(() => document.documentElement.scrollHeight);
	for (let y = 0; y < height; y += 800) {
		await page.evaluate((top) => window.scrollTo(0, top), y);
		await page.waitForTimeout(60);
	}
	await page.evaluate(() => window.scrollTo(0, 0));
}

test.beforeEach(({}, info) => {
	test.skip(info.project.name !== 'desktop');
});

// one test per page directory, each with its own timeout (wireframes plus hi-fi are too many for one)
for (const slug of slugs) {
	test(`Scenario: Every mockup screen is shot at three widths (${slug || 'index'})`, async ({ page }) => {
		test.setTimeout(120_000);
		await calm(page);
		for (const data of ['normal', 'worst']) {
			await open(page, path(slug, data));
			for (const width of widths) {
				await page.setViewportSize({ width, height: 900 });
				await settle(page);
				await scrolled(page);
				const name = `${slug.replaceAll('/', '-') || 'index'}-${width}-${data}`;
				const file = `test-results/shots/redesign/${name}.png`;
				await page.screenshot({ path: file, fullPage: true });
				expect(existsSync(file), file).toBe(true);
			}
		}
	});
}

test('Scenario: Discovery finds every mockup screen', () => {
	expect(slugs.length).toBeGreaterThan(0);
});

test('Scenario: Worst-case data switches the fixtures', async ({ page }) => {
	test.setTimeout(240_000);
	const normal = mockData(new URL('http://x/'));
	const worst = mockData(new URL('http://x/?data=worst'));
	expect(worst.list).toHaveLength(500);
	expect(normal.list.length).toBeLessThan(50);

	await calm(page);
	await page.setViewportSize({ width: 375, height: 900 });
	for (const slug of slugs) {
		await open(page, path(slug, 'normal'));
		await expect(page.locator('[data-data]').first()).toHaveAttribute('data-data', 'normal');
		await open(page, path(slug, 'worst'));
		await expect(page.locator('[data-data]').first()).toHaveAttribute('data-data', 'worst');
		await settle(page);
		const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
		expect(overflow, `${slug} scrolls sideways`).toBeLessThanOrEqual(0);
	}
});

test('Scenario: Pages load no external resources', async ({ page, baseURL }) => {
	test.setTimeout(240_000);
	const origin = new URL(baseURL!).origin;
	const foreign: string[] = [];
	page.on('request', (request) => {
		const url = request.url();
		if (!url.startsWith('data:') && !url.startsWith('blob:') && new URL(url).origin !== origin) foreign.push(url);
	});
	for (const slug of slugs) {
		await open(page, path(slug, 'normal'));
		await page.evaluate(() => document.fonts.ready);
		await page.waitForLoadState('networkidle');
	}
	expect(foreign).toEqual([]);
});
