import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { open } from './helpers.ts';

const html = readFileSync('src/app.html', 'utf8');
const linkHrefs = (rel: string): string[] =>
	[...html.matchAll(/<link\s+rel="([^"]+)"\s+href="([^"]+)"/g)].filter((m) => m[1] === rel).map((m) => m[2]);
const manifest = JSON.parse(readFileSync('static/manifest.webmanifest', 'utf8')) as { icons: { src: string }[] };

test('Scenario: Icon files are served', async ({ request }) => {
	const paths = [...linkHrefs('icon'), ...linkHrefs('apple-touch-icon'), ...manifest.icons.map((i) => i.src)];
	expect(paths.length).toBeGreaterThanOrEqual(6);
	for (const path of paths) {
		const res = await request.get(path);
		expect(res.status(), path).toBe(200);
		expect(res.headers()['content-type'], path).toMatch(/^image\//);
	}
	const served = await request.get('/manifest.webmanifest');
	expect(served.status()).toBe(200);
	// the installed app shows the product name, as the family's other apps do
	expect(await served.json()).toMatchObject({ name: 'Creative Archive', short_name: 'Creative Archive' });
});

test('Scenario: Head carries the icon links', async ({ page }) => {
	await open(page, '/');
	const head = page.locator('head');
	await expect(head.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', /\/favicon\.svg$/);
	await expect(head.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute('href', /\/favicon\.ico$/);
	await expect(head.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', /\/apple-touch\-icon\.png$/);
	await expect(head.locator('link[rel="manifest"]')).toHaveAttribute('href', /\/manifest\.webmanifest$/);
	await expect(head.locator('meta[name="theme-color"]')).toHaveAttribute('content', /^#[0-9a-fA-F]{6}$/);
});
