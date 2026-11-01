import { resolve } from 'node:path';
import { expect, type APIRequestContext, type Page } from '@playwright/test';
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
