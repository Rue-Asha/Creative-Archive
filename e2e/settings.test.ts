import { readFileSync } from 'node:fs';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { calm, counts, open, photo, reset, seed } from './helpers.ts';

const slot = (page: Page, name: string) => page.getByRole('region', { name });
const shot = (s: Locator) => s.getByRole('presentation');
const upload = (s: Locator, file: string) => s.getByLabel(/photo file$/).setInputFiles(photo(file));

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

	await books.getByLabel(/photo file$/)
		.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not a picture') });

	await expect(books.getByText('Unsupported image type')).toBeVisible();
	await expect(shot(books)).toHaveAttribute('src', before);
	await expect(slot(page, 'Music').getByText('Unsupported image type')).toHaveCount(0);
	expect(posts).toEqual([]);

	await books.getByLabel(/photo file$/).setInputFiles(photo('../heic/sample.heic'));

	await expect(books.getByText('Unsupported image type')).toBeVisible();
	await expect(shot(books)).toHaveAttribute('src', before);
});

test('Scenario: Oversize hero file shows an inline error', async ({ page, request }) => {
	await open(page, '/settings');
	const animanga = slot(page, 'Animanga');
	const before = await counts(request);
	const posts: string[] = [];
	page.on('request', (r) => r.method() === 'POST' && posts.push(r.url()));

	await animanga.getByLabel(/photo file$/)
		.setInputFiles({ name: 'huge.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(17 * 1024 * 1024) });

	await expect(animanga.getByText('Image is larger than 16 MB')).toBeVisible();
	expect(posts).toEqual([]);
	expect(await counts(request)).toEqual(before);
	await expect(shot(animanga)).toHaveCount(0);
});

test('Scenario: Slots sit three to a row on desktop', async ({ page }, info) => {
	await open(page, '/settings');
	const boxes = await Promise.all(
		['Home', 'Music', 'Animanga', 'Books', 'Fashion'].map((n) => slot(page, n).boundingBox())
	);
	const tops = boxes.map((b) => Math.round(b!.y));
	if (info.project.name === 'desktop') {
		expect(tops.slice(1, 3), 'Music and Animanga beside Home').toEqual([tops[0], tops[0]]);
		expect(tops[4], 'Fashion beside Books').toBe(tops[3]);
		expect(tops[3], 'Books on the next row').toBeGreaterThan(tops[0]);
		expect(Math.round(boxes[3]!.x), 'Books under Home').toBe(Math.round(boxes[0]!.x));
	} else expect(new Set(tops).size).toBe(5);
	for (const b of boxes) expect(b!.x + b!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test('a failed upload leaves the empty slot usable and a later upload clears the error', async ({ page }) => {
	await open(page, '/settings');
	const books = slot(page, 'Books');
	await books.getByLabel(/photo file$/)
		.setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
	await expect(books.getByText('Unsupported image type')).toBeVisible();

	await upload(books, 'reading.jpg');

	await expect(shot(books)).toHaveAttribute('src', /^\/images\/\d+$/);
	await expect(books.getByText('Unsupported image type')).toHaveCount(0);
});

test('Scenario: Slots come in world order', async ({ page }) => {
	await open(page, '/settings');

	const slots = page.getByRole('main').getByRole('region');
	await expect(slots.getByRole('heading', { level: 2 })).toHaveText(['Home', 'Music', 'Animanga', 'Books', 'Fashion']);
	for (const name of ['Home', 'Music', 'Animanga', 'Books', 'Fashion']) {
		await expect(slot(page, name).getByText('No photo yet')).toBeVisible();
		await expect(slot(page, name).getByRole('button', { name: 'Upload' })).toBeVisible();
	}
});

test('Scenario: Replace and Remove are equal choices', async ({ page, request }) => {
	await seed(request, { heroes: ['music'] });
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 844 });
		await open(page, '/settings');
		const music = slot(page, 'Music');
		const look = (name: string) =>
			music.getByRole('button', { name }).evaluate((el) => {
				const s = getComputedStyle(el);
				return {
					background: s.backgroundColor,
					border: s.border,
					height: el.getBoundingClientRect().height,
					focused: el === document.activeElement,
					arrow: !!el.querySelector('.circle'),
					primary: el.classList.contains('primary')
				};
			});
		const replace = await look('Replace');
		const remove = await look('Remove');

		expect(remove.background, `${width}`).toBe(replace.background);
		expect(remove.border, `${width}`).toBe(replace.border);
		expect(remove.height, `${width}`).toBe(replace.height);
		for (const b of [replace, remove]) expect([b.focused, b.arrow, b.primary], `${width}`).toEqual([false, false, false]);
	}
});

test('Scenario: Settings explanation matches the contract', async ({ page }) => {
	const text =
		'Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB.';
	await open(page, '/settings');

	await expect(page.getByRole('main').getByText(text, { exact: true })).toBeVisible();
	await expect(page.getByRole('main')).not.toContainText('theme gradient');
	const contract = readFileSync('docs/functional-contract.md', 'utf8');
	const section = contract.slice(contract.indexOf('### 4.9 `/settings`'), contract.indexOf('### 4.10'));
	expect(section).toContain(text);
	expect(section).not.toContain('theme gradient');
});
