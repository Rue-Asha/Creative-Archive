import { resolve } from 'node:path';
import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';
import { accents, schemes } from '../src/lib/styles/tokens.ts';
import { WORLDS } from '../src/lib/styles/worlds.ts';
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
// lands drops the rest. Call before opening the page; await the returned check with the number of writes made.
export function countSaves(page: Page): (count: number) => Promise<void> {
	let done = 0;
	page.on('response', (res) => {
		if (res.request().method() === 'POST' && res.url().includes('?/')) done++;
	});
	return (count) => expect.poll(() => done).toBe(count);
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

export function progressValue(scope: Page | Locator, label: string): Locator {
	return scope.getByRole('group', { name: label, exact: true }).getByRole('button', { name: new RegExp(`^${label} \\d+ of `) });
}

export async function editProgress(
	scope: Page | Locator,
	label: string,
	text: string,
	end: 'Enter' | 'Escape' | 'blur'
): Promise<void> {
	await progressValue(scope, label).click();
	const input = scope.getByRole('group', { name: label, exact: true }).getByRole('textbox');
	await input.fill(text);
	if (end === 'blur') await input.evaluate((el) => (el as HTMLInputElement).blur());
	else await input.press(end);
}

export const cards = (scope: Page | Locator): Locator => scope.getByRole('article');

export const cardTitles = (scope: Page | Locator): Locator => cards(scope).getByRole('heading', { level: 3 });

export const cardOf = (scope: Page | Locator, title: string): Locator => cards(scope).filter({ hasText: title });

export const shelf = (page: Page, name: string): Locator => page.getByRole('region', { name, exact: true });

// The world's scheme and accent reach every element as inherited custom properties, so the page heading shows them.
export async function expectWorld(page: Page, world: keyof typeof WORLDS, label?: string): Promise<void> {
	const { scheme, accent } = WORLDS[world];
	const tokens = await page.getByRole('heading', { level: 1 }).evaluate((el) => {
		const style = getComputedStyle(el);
		return { ground: style.getPropertyValue('--ground').trim(), accent: style.getPropertyValue('--accent').trim() };
	});
	expect(tokens.ground.toLowerCase(), label).toBe(schemes[scheme].ground.toLowerCase());
	expect(tokens.accent.toLowerCase(), label).toBe(accents[accent][scheme].accent.toLowerCase());
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

// Click the left or right half of a star (1 to 5) in the rating slider.
export async function rate(slider: Locator, star: number, half: 'left' | 'right'): Promise<void> {
	const box = (await slider.boundingBox())!;
	const width = box.width / 5;
	await slider.click({ position: { x: (star - 1) * width + (half === 'left' ? 0.15 : 0.85) * width, y: box.height / 2 } });
}
