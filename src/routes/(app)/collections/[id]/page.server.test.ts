import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { addToCollection, createCollection, getCollection } from '#lib/server/collections.ts';
import { closeDb } from '#lib/server/db.ts';
import { insertEntryRow, useTestDb } from '#lib/server/testing.ts';
import { actions } from './+page.server.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

function call(id: number, ids: string) {
	const request = new Request('http://x.test', { method: 'POST', body: new URLSearchParams({ ids }) });
	return (actions.reorder as (e: unknown) => unknown)({ params: { id: String(id) }, request });
}

describe('collection page reorder action', () => {
	it('Scenario: Reorder action saves the order', async () => {
		const [a, b, c] = ['A', 'B', 'C'].map((title) => insertEntryRow({ type: 'album', title }));
		const id = createCollection('Ordered');
		for (const e of [a, b, c]) addToCollection(id, e);
		const order = () => getCollection(id)!.entries.map((e) => e.id);

		expect(await call(id, `${c},${a},${b}`)).toBeUndefined();
		expect(order()).toEqual([c, a, b]);

		expect(await call(id, `${a},${b}`)).toMatchObject({ status: 400 });
		expect(await call(id, 'x,y')).toMatchObject({ status: 400 });
		expect(order()).toEqual([c, a, b]);
	});
});
