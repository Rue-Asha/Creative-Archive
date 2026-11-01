import { expect, test, type Page } from '@playwright/test';
import { calm, counts, open, photo, reset, seed } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const save = (page: Page) => page.getByRole('button', { name: 'Save' });
const file = (page: Page) => page.getByLabel('Photo file');
const preview = (page: Page) => page.getByRole('img', { name: 'Preview', exact: true });
const MIB = 1024 * 1024;

test('Scenario: Upload an image in the form', async ({ page, request }) => {
	await open(page, '/add/look?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Fit check');
	await file(page).setInputFiles(photo('fashion-look.jpg'));
	await expect(preview(page)).toBeVisible();
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	await expect(preview(page)).toHaveAttribute('src', /^\/images\/\d+$/);
	const res = await request.get((await preview(page).getAttribute('src'))!);
	expect(res.status()).toBe(200);
	expect(res.headers()['content-type']).toBe('image/webp');
});

test('Scenario: Uploading replaces the current image', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, `/entries/${entries[0]}/edit`);
	const old = (await preview(page).getAttribute('src'))!;
	expect(old).toMatch(/^\/images\/\d+$/);
	await file(page).setInputFiles(photo('cover-dusk.jpg'));
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${entries[0]}`);
	await open(page, `/entries/${entries[0]}/edit`);
	const now = (await preview(page).getAttribute('src'))!;
	expect(now).toMatch(/^\/images\/\d+$/);
	expect(now).not.toBe(old);
	expect((await request.get(old)).status()).toBe(404);
	expect((await counts(request)).images).toBe(1);
});

test('Scenario: Unsupported file shows an inline error', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, `/entries/${entries[0]}/edit`);
	const before = await preview(page).getAttribute('src');
	await file(page).setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });

	await expect(page.getByText('Unsupported image type')).toBeVisible();
	await expect(preview(page)).toHaveAttribute('src', before!);
	await save(page).click();
	await expect(page).toHaveURL(`/entries/${entries[0]}`);
	await open(page, `/entries/${entries[0]}/edit`);
	await expect(preview(page)).toHaveAttribute('src', before!);
});

test('Scenario: Oversize file shows an inline error', async ({ page, request }) => {
	await open(page, '/add/look?manual=1');
	await file(page).setInputFiles({ name: 'huge.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(17 * MIB) });

	await expect(page.getByText('Image is larger than 16 MB')).toBeVisible();
	await expect(file(page)).toHaveValue('');
	expect((await counts(request)).images).toBe(0);
});

test('a file the browser accepts but the server cannot read is refused at the field', async ({ page, request }) => {
	await open(page, '/add/look?manual=1');
	await page.getByLabel('Title', { exact: true }).fill('Fit check');
	await file(page).setInputFiles({ name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
	await save(page).click();

	await expect(page.getByText('Unsupported image type')).toBeVisible();
	await expect(page).toHaveURL(/\/add\/look/);
	expect((await counts(request)).entries).toBe(0);
});

test('choosing a fine file after a bad one clears the message', async ({ page }) => {
	await open(page, '/add/look?manual=1');
	await file(page).setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
	await expect(page.getByText('Unsupported image type')).toBeVisible();

	await file(page).setInputFiles(photo('fashion-look.jpg'));

	await expect(page.getByText('Unsupported image type')).toHaveCount(0);
	await expect(preview(page)).toBeVisible();
});

test('Remove image drops the stored image on save', async ({ page, request }) => {
	const { entries } = await seed(request, { entries: [{ type: 'album', title: 'Blonde', image: true }] });
	await open(page, `/entries/${entries[0]}/edit`);
	const old = (await preview(page).getAttribute('src'))!;
	await page.getByRole('button', { name: 'Remove image' }).click();
	await expect(preview(page)).toHaveCount(0);
	await save(page).click();

	await expect(page).toHaveURL(`/entries/${entries[0]}`);
	await open(page, `/entries/${entries[0]}/edit`);
	await expect(preview(page)).toHaveCount(0);
	expect((await request.get(old)).status()).toBe(404);
});
