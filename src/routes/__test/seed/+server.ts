import { json } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import { insertEntryRow, insertTestImage, type SeedInput, type SeedResult } from '#lib/server/testing.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	requireTestFlag();
	const input = (await request.json()) as SeedInput;
	const db = getDb();
	const now = new Date().toISOString();
	const result: SeedResult = { entries: [], collections: [] };

	for (const e of input.entries ?? [])
		result.entries.push(
			insertEntryRow({ ...e, artist: typeof e.artist === 'number' ? result.entries[e.artist] : e.artist }, now)
		);

	const insertCollection = db.prepare(
		'INSERT INTO collections (name, description, created_at, updated_at) VALUES (?, ?, ?, ?)'
	);
	const addEntry = db.prepare(
		'INSERT INTO collection_entries (collection_id, entry_id, added_at) VALUES (?, ?, ?)'
	);
	for (const c of input.collections ?? []) {
		const id = Number(insertCollection.run(c.name, c.description ?? '', now, now).lastInsertRowid);
		// one millisecond apart, so "added order" is the order given here
		c.entries.forEach((index, i) =>
			addEntry.run(id, result.entries[index], new Date(Date.parse(now) + i).toISOString())
		);
		result.collections.push(id);
	}

	const insertHero = db.prepare('INSERT OR REPLACE INTO heroes (world, image_id) VALUES (?, ?)');
	(input.heroes ?? []).forEach((world, i) => insertHero.run(world, insertTestImage(100 + i, now)));

	return json(result);
};
