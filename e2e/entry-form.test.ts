import { expect, test, type Page } from '@playwright/test';
import { DOMAIN_LABEL } from '../src/lib/domains.ts';
import { calm, counts, expectCurrent, expectWorld, open, reset } from './helpers.ts';

test.beforeEach(async ({ page, request }) => {
	await calm(page);
	await reset(request);
});

const title = (page: Page) => page.getByLabel('Title', { exact: true });
const save = (page: Page) => page.getByRole('button', { name: 'Save' });

test('Scenario: Create an album manually from the form', async ({ page, request }) => {
	await open(page, '/add/album?manual=1');
	await title(page).fill('Ctrl');
	await page.getByLabel('Year').fill('2017');
	await page.getByLabel('Type').selectOption('ep');
	await page.getByLabel('Tracks').fill('7');
	await save(page).click();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	expect((await counts(request)).entries).toBe(1);
	await open(page, `${new URL(page.url()).pathname}/edit`);
	await expect(title(page)).toHaveValue('Ctrl');
	await expect(page.getByLabel('Year')).toHaveValue('2017');
	await expect(page.getByLabel('Type')).toHaveValue('ep');
	await expect(page.getByLabel('Tracks')).toHaveValue('7');
});

test('Scenario: Form shows the fields of its type', async ({ page }) => {
	await open(page, '/add/anime?manual=1');
	for (const label of ['Alternative title', 'Year', 'Episodes total']) await expect(page.getByLabel(label), label).toBeVisible();
	await expect(title(page)).toBeVisible();

	await open(page, '/add/piece?manual=1');
	await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
	for (const label of ['Brand', 'URL', 'Price', 'Status']) await expect(page.getByLabel(label, { exact: true }), label).toBeVisible();

	await open(page, '/add/influencer?manual=1');
	await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
	for (const label of ['Instagram', 'TikTok', 'YouTube', 'Website']) await expect(page.getByLabel(label), label).toBeVisible();
});

test('Scenario: Empty title is not saved', async ({ page, request }) => {
	await open(page, '/add/book?manual=1');
	await save(page).click();

	await expect(page.getByText('Title is required')).toBeVisible();
	await expect(page).toHaveURL(/\/add\/book/);
	expect((await counts(request)).entries).toBe(0);
});

test('Scenario: Double submit creates one entry', async ({ page, request }) => {
	await open(page, '/add/album?manual=1');
	await title(page).fill('Once');
	await save(page).dblclick();

	await expect(page).toHaveURL(/\/entries\/\d+$/);
	expect((await counts(request)).entries).toBe(1);
});

test('a name is required on brands and the message says so', async ({ page }) => {
	await open(page, '/add/brand?manual=1');
	await save(page).click();

	await expect(page.getByText('Name is required')).toBeVisible();
});

test('typing in a field clears its message', async ({ page }) => {
	await open(page, '/add/book?manual=1');
	await save(page).click();
	await expect(page.getByText('Title is required')).toBeVisible();

	await title(page).fill('N');

	await expect(page.getByText('Title is required')).toHaveCount(0);
});

test('a bad link is refused next to its field', async ({ page, request }) => {
	await open(page, '/add/piece?manual=1');
	await page.getByLabel('Name', { exact: true }).fill('Coat');
	await page.getByLabel('URL').fill('javascript:alert(1)');
	await save(page).click();

	await expect(page.getByText('Enter a valid http or https URL')).toBeVisible();
	await expect(page).toHaveURL(/\/add\/piece/);
	expect((await counts(request)).entries).toBe(0);
});

test('an unknown type answers 404', async ({ page }) => {
	const res = await page.goto('/add/nothing?manual=1');

	expect(res?.status()).toBe(404);
});

test('add pages mark their domain in the nav and the world', async ({ page }) => {
	const nav = page.getByRole('navigation', { name: 'Main' });

	for (const [type, domain] of [['album', 'music'], ['manga', 'animanga'], ['book', 'books'], ['piece', 'fashion']] as const) {
		await open(page, `/add/${type}?manual=1`);
		await expectCurrent(nav, DOMAIN_LABEL[domain], type);
		await expectWorld(page, domain, type);
	}
});
