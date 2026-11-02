import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, counts, open, photo, reset, seed } from './helpers.ts';

const slot = (page: Page, name: string) => page.getByRole('region', { name });
const shot = (s: Locator) => s.locator('img');
const upload = (s: Locator, file: string) => s.locator('input[type="file"]').setInputFiles(photo(file));

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

test('Scenario: Upload a hero photo for Home', async ({ page }) => {
	await open(page, '/settings');
	const home = slot(page, 'Home');
	await expect(shot(home)).toHaveCount(0);

	await upload(home, 'music-hero.jpg');

	await expect(shot(home)).toHaveAttribute('src', /^\/images\/\d+$/);
	const src = await shot(home).getAttribute('src');
	await page.reload();
	await expect(shot(slot(page, 'Home'))).toHaveAttribute('src', src!);
});

test('Scenario: Replace a domain hero photo', async ({ page, request }) => {
	await seed(request, { heroes: ['music'] });
	await open(page, '/settings');
	const music = slot(page, 'Music');
	const old = (await shot(music).getAttribute('src'))!;

	await upload(music, 'cover-violet.jpg');

	await expect(shot(music)).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(shot(music)).not.toHaveAttribute('src', old);
	expect((await request.get(old)).status()).toBe(404);
});

test('Scenario: Remove a hero photo', async ({ page, request }) => {
	await seed(request, { heroes: ['fashion'] });
	await open(page, '/settings');
	const fashion = slot(page, 'Fashion');
	const old = (await shot(fashion).getAttribute('src'))!;

	await fashion.getByRole('button', { name: 'Remove' }).click();
	await expect(shot(fashion)).toHaveCount(0);

	await page.reload();
	const again = slot(page, 'Fashion');
	await expect(shot(again)).toHaveCount(0);
	await expect(again.getByText('No photo yet')).toBeVisible();
	expect((await request.get(old)).status()).toBe(404);
});

test('Scenario: Unsupported hero file shows an inline error', async ({ page, request }) => {
	await seed(request, { heroes: ['books'] });
	await open(page, '/settings');
	const books = slot(page, 'Books');
	const before = (await shot(books).getAttribute('src'))!;
	const posts: string[] = [];
	page.on('request', (r) => r.method() === 'POST' && posts.push(r.url()));

	await books
		.locator('input[type="file"]')
		.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a picture') });

	await expect(books.getByText('Unsupported image type')).toBeVisible();
	await expect(shot(books)).toHaveAttribute('src', before);
	expect(posts).toEqual([]);
	await expect(slot(page, 'Music').getByText('Unsupported image type')).toHaveCount(0);
});

test('Scenario: Oversize hero file shows an inline error', async ({ page, request }) => {
	await open(page, '/settings');
	const animanga = slot(page, 'Animanga');
	const before = await counts(request);
	const posts: string[] = [];
	page.on('request', (r) => r.method() === 'POST' && posts.push(r.url()));

	await animanga
		.locator('input[type="file"]')
		.setInputFiles({ name: 'huge.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(17 * 1024 * 1024) });

	await expect(animanga.getByText('Image is larger than 16 MB')).toBeVisible();
	expect(posts).toEqual([]);
	expect(await counts(request)).toEqual(before);
	await expect(shot(animanga)).toHaveCount(0);
});

test('the five slots sit in one row on desktop and stack on phone', async ({ page }, info) => {
	await open(page, '/settings');
	const boxes = await Promise.all(
		['Home', 'Music', 'Animanga', 'Books', 'Fashion'].map((n) => slot(page, n).boundingBox())
	);
	const tops = boxes.map((b) => Math.round(b!.y));
	if (info.project.name === 'desktop') expect(new Set(tops).size).toBe(1);
	else expect(new Set(tops).size).toBe(5);
	for (const b of boxes) expect(b!.x + b!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('a failed upload leaves the empty slot usable and a later upload clears the error', async ({ page }) => {
	await open(page, '/settings');
	const books = slot(page, 'Books');
	await books
		.locator('input[type="file"]')
		.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
	await expect(books.getByText('Unsupported image type')).toBeVisible();

	await upload(books, 'reading.jpg');

	await expect(shot(books)).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(books.getByText('Unsupported image type')).toHaveCount(0);
});

test('Scenario: Replace and Remove sit side by side in one style', async ({ page, request }) => {
	await seed(request, { heroes: ['music'] });
	await open(page, '/settings');
	const music = slot(page, 'Music');

	const look = (name: string) =>
		music.getByRole('button', { name }).evaluate((el) => {
			const s = getComputedStyle(el);
			const box = el.getBoundingClientRect();
			return { x: box.x, y: box.y, height: box.height, background: s.backgroundColor, border: s.border };
		});
	const replace = await look('Replace');
	const remove = await look('Remove');

	expect(Math.abs(replace.y - remove.y)).toBeLessThanOrEqual(2);
	expect(remove.x).toBeGreaterThan(replace.x);
	expect(remove.background).toBe(replace.background);
	expect(remove.border).toBe(replace.border);
	expect(remove.height).toBe(replace.height);
});
