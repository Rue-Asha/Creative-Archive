import { resolve } from 'node:path';
import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { POSTURE_SWITCH } from '../src/lib/shell/nav.ts';
import type { World } from '../src/lib/domains.ts';
import type { SeedEntry, SeedInput, SeedResult } from '../src/lib/server/testing.ts';

export type { SeedEntry, SeedInput, SeedResult };

// A POST without a content type counts as a form post, which SvelteKit's CSRF check rejects.
export async function reset(request: APIRequestContext): Promise<void> {
	const res = await request.post('/__test/reset', { data: {} });
	if (!res.ok()) throw new Error(`reset failed: ${res.status()}`);
}

export async function seed(request: APIRequestContext, input: SeedInput): Promise<SeedResult> {
	const res = await request.post('/__test/seed', { data: input });
	if (!res.ok()) throw new Error(`seed failed: ${res.status()} ${await res.text()}`);
	return (await res.json()) as SeedResult;
}

export async function counts(request: APIRequestContext): Promise<Record<string, number>> {
	const res = await request.get('/__test/counts');
	if (!res.ok()) throw new Error(`counts failed: ${res.status()}`);
	return (await res.json()) as Record<string, number>;
}

// Input that lands on the server-rendered page before hydration is silently lost.
export async function open(page: Page, path: string): Promise<void> {
	await page.goto(path);
	await page.locator('html[data-hydrated]').waitFor({ state: 'attached' });
}

export const calm = (page: Page): Promise<void> => page.emulateMedia({ reducedMotion: 'reduce' });

export const photo = (name: string): string => resolve('fixtures/mockups', name);

// Controls answer from local state while their writes queue up one by one, so a reload before the last response
// lands drops the rest. Call before opening the page; await the returned check with the number of writes made. It
// waits for that many answers, then gives a stray extra write a moment to show up and fails if one was sent (a
// request the test aborts never answers and is not counted).
export function countSaves(page: Page): (count: number) => Promise<void> {
	let sent = 0;
	let aborted = 0;
	let done = 0;
	const save = (req: { method(): string; url(): string }) => req.method() === 'POST' && req.url().includes('?/');
	page.on('request', (req) => {
		if (save(req)) sent++;
	});
	page.on('requestfailed', (req) => {
		if (save(req)) aborted++;
	});
	page.on('response', (res) => {
		if (save(res.request())) done++;
	});
	return async (count) => {
		await expect.poll(() => done).toBe(count);
		await page.waitForTimeout(400);
		expect(sent - aborted, 'saves sent and not aborted').toBe(count);
		expect(done, 'saves answered').toBe(count);
	};
}

// Every save request in the order it was sent, as "action field=value …". Saves are serialised, so a test that ends
// on a sentinel save and polls for the exact list proves nothing else was queued before the sentinel.
export function recordSaves(page: Page): () => string[] {
	const sent: string[] = [];
	page.on('request', (req) => {
		if (req.method() !== 'POST' || !req.url().includes('?/')) return;
		const fields = [...(req.postData() ?? '').matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)/g)].map(([, k, v]) => `${k}=${v}`);
		sent.push([req.url().split('?/')[1], ...fields].join(' '));
	});
	return () => sent;
}

// the entry page names its group "Episodes"; a card names it after its entry too ("Episodes, Frieren")
export const progressGroup = (scope: Page | Locator, label: string, entry?: string): Locator =>
	scope.getByRole('group', { name: entry ? `${label}, ${entry}` : label, exact: true });

export function progressValue(scope: Page | Locator, label: string, entry?: string): Locator {
	return progressGroup(scope, label, entry).getByRole('button', { name: new RegExp(`^${label} \\d+ of `) });
}

export async function editProgress(
	scope: Page | Locator,
	label: string,
	text: string,
	end: 'Enter' | 'Escape' | 'blur',
	entry?: string
): Promise<void> {
	await progressValue(scope, label, entry).click();
	const input = progressGroup(scope, label, entry).getByRole('textbox');
	await input.fill(text);
	if (end === 'blur') await input.evaluate((el) => (el as HTMLInputElement).blur());
	else await input.press(end);
}

export const cards = (scope: Page | Locator): Locator => scope.getByRole('article');

// a card's one heading: h3 under a page's or a shelf's h2, h4 on a shelf nested in Home's "Recently added"
export const cardTitles = (scope: Page | Locator): Locator => cards(scope).getByRole('heading');

export const cardOf = (scope: Page | Locator, title: string): Locator => cards(scope).filter({ hasText: title });

export const shelf = (page: Page, name: string): Locator => page.getByRole('region', { name, exact: true });

// The app root names a domain's world and puts it on the night stage; Home names none (fingerprint 2.1.0). The one app
// accent sits on <html> and is the same in every world.
export async function expectWorld(page: Page, world: World, label?: string): Promise<void> {
	if (world === 'home') {
		await expect(page.locator('.app'), label).not.toHaveAttribute('data-world');
		await expect(page.locator('.app'), label).not.toHaveAttribute('data-stage');
	} else {
		await expect(page.locator('.app'), label).toHaveAttribute('data-world', world);
		await expect(page.locator('.app'), label).toHaveAttribute('data-stage', 'night');
	}
	await expect(page.locator('html'), label).toHaveAttribute('data-accent', 'heather');
}

// Exactly the link named `label` carries aria-current in `nav`; null means none does.
export async function expectCurrent(nav: Locator, label: string | null, message?: string): Promise<void> {
	await expect(nav.getByRole('link').first()).toBeVisible();
	for (const link of await nav.getByRole('link').all()) {
		const name = ((await link.textContent()) ?? '').trim();
		expect(await link.getAttribute('aria-current'), `${message ?? ''} ${name}`.trim()).toBe(name === label ? 'page' : null);
	}
}

// The cover on an entry's page: a photo (has src) or the placeholder (has none).
export const cover = (page: Page, title: string): Locator => page.getByRole('img', { name: title, exact: true });

// The top bar shows from POSTURE_SWITCH up, everything below (tablets included) gets the phone bar.
export function posture(page: Page): 'phone' | 'desktop' {
	return page.viewportSize()!.width >= POSTURE_SWITCH ? 'desktop' : 'phone';
}

// Clicks the section's pill (phone) or top-bar link (desktop). Collections and Settings sit on Home on the phone.
export async function openSection(page: Page, name: string): Promise<void> {
	const main = page.getByRole('navigation', { name: 'Main' });
	if (posture(page) === 'desktop' || !['Collections', 'Settings'].includes(name)) {
		await main.getByRole('link', { name, exact: true }).click();
		return;
	}
	await main.getByRole('link', { name: 'Home', exact: true }).click();
	await page.getByRole('link', { name: name === 'Collections' ? 'All collections' : 'Settings', exact: true }).click();
}

// The context "+" button (named "Add"); the sheet it opens belongs to the caller's test.
export const plus = (page: Page): Locator => page.getByRole('button', { name: 'Add', exact: true });

// The ··· pill on an entry page opens the Menu with Edit and Delete.
export async function openEntryMenu(page: Page): Promise<void> {
	await page.getByRole('button', { name: 'Entry menu' }).click();
	await expect(page.getByRole('menu', { name: 'Entry menu' })).toBeVisible();
}
