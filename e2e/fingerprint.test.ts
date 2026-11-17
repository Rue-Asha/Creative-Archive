import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { calm, open, reset } from './helpers.ts';

const tokens = readFileSync('src/lib/styles/fingerprint/tokens.css', 'utf8');
const accent = 'heather';
const accentValue = tokens.match(new RegExp(`:root\\[data-accent="${accent}"\\]\\s*\\{[^}]*--accent:\\s*(#[0-9A-Fa-f]+)`))![1];

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: App renders with the accent', async ({ page }) => {
	for (const path of ['/', '/music/albums', '/collections']) {
		await open(page, path);
		await expect(page.locator('html')).toHaveAttribute('data-accent', accent);
		const value = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
		expect(value.toLowerCase(), path).toBe(accentValue.toLowerCase());
	}
});
