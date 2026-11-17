import { isRedirect } from '@sveltejs/kit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from '#lib/server/db.ts';
import { insertEntryRow, useTestDb } from '#lib/server/testing.ts';
import { actions, load } from './+page.server.ts';

const run = (domain: string, list: string, query: string) => {
	try {
		load({ params: { domain, list }, url: new URL(`http://localhost/${domain}/${list}?${query}`) } as never);
	} catch (thrown) {
		if (isRedirect(thrown)) return { status: thrown.status, location: thrown.location };
		throw thrown;
	}
	return null;
};

describe('retired fashion lists', () => {
	it('Scenario: Retired brands list redirects', () => {
		expect(run('fashion', 'brands', 'tag=3&sort=title')).toEqual({ status: 308, location: '/fashion/brands-shops?tag=3&sort=title&kind=brand' });
		expect(run('fashion', 'brands', '')).toEqual({ status: 308, location: '/fashion/brands-shops?kind=brand' });
	});

	it('Scenario: Retired shops list redirects', () => {
		expect(run('fashion', 'shops', 'sort=title')).toEqual({ status: 308, location: '/fashion/brands-shops?sort=title' });
		expect(run('fashion', 'shops', '')).toEqual({ status: 308, location: '/fashion/brands-shops' });
	});
});

describe('list page bulk actions', () => {
	beforeEach(() => {
		useTestDb();
	});

	afterEach(() => {
		closeDb();
		delete process.env.DATABASE_PATH;
	});

	const post = (name: 'bulkStatus' | 'bulkTag', fields: Record<string, string>) =>
		(actions[name] as (e: unknown) => unknown)({
			params: { domain: 'music', list: 'albums' },
			request: new Request('http://x.test', { method: 'POST', body: new URLSearchParams(fields) })
		});
	const statuses = () => getDb().prepare('SELECT status FROM entries ORDER BY id').all().map((r) => r.status);

	it('Scenario: Bulk actions answer the list page', async () => {
		const [a, b] = ['A', 'B'].map((title) => insertEntryRow({ type: 'album', title, status: 'want' }));

		expect(await post('bulkStatus', { ids: `${a},${b}`, status: 'done' })).toEqual({ updated: 2 });
		expect(statuses()).toEqual(['done', 'done']);

		expect(await post('bulkStatus', { ids: `${a},x`, status: 'none' })).toMatchObject({ status: 400 });
		expect(statuses()).toEqual(['done', 'done']);

		expect(await post('bulkTag', { ids: `${a},${b}`, tag: 'Summer', op: 'add' })).toEqual({ updated: 2 });
		expect(getDb().prepare('SELECT count(*) AS n FROM entry_tags').get()?.n).toBe(2);
	});
});
