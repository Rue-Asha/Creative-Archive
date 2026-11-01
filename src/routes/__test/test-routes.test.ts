import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from '#lib/server/db.ts';
import { useTestDb, type SeedInput } from '#lib/server/testing.ts';
import { GET as counts } from './counts/+server.ts';
import { GET as image } from './image/[name]/+server.ts';
import { POST as reset } from './reset/+server.ts';
import { POST as seed } from './seed/+server.ts';

const TABLES = ['collection_entries', 'collections', 'entries', 'entry_tags', 'heroes', 'images', 'status_events', 'tags'];

function post(body: unknown): never {
	return {
		request: new Request('http://localhost/__test', { method: 'POST', body: JSON.stringify(body) })
	} as never;
}

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

async function seeded(input: SeedInput): Promise<{ entries: number[]; collections: number[] }> {
	return (await seed(post(input))).json();
}

const FULL: SeedInput = {
	entries: [
		{ type: 'artist', title: 'Frank Ocean', image: true, provider: 'deezer', externalId: 'fake-ar-1' },
		{
			type: 'album',
			title: 'Blonde',
			artist: 0,
			status: 'done',
			rating: 4.5,
			tags: ['Summer', 'Ästhetik'],
			image: true,
			details: { year: 2016 },
			createdAt: '2026-10-01T00:00:00.000Z',
			updatedAt: '2026-10-02T00:00:00.000Z'
		},
		{ type: 'song', title: 'Unknown', artist: 'Unknown Band', tags: ['ästhetik'] },
		{ type: 'anime', title: 'Frieren', status: 'progress', progress: { episodes: { current: 27, total: 28 } } }
	],
	collections: [
		{ name: 'Moodboard', description: 'Autumn', entries: [3, 1] },
		{ name: 'Empty', entries: [] }
	],
	heroes: ['home', 'music']
};

beforeEach(() => {
	useTestDb();
	process.env.CREATIVE_ARCHIVE_TEST = '1';
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
	delete process.env.CREATIVE_ARCHIVE_TEST;
});

describe('test routes', () => {
	it('Scenario: Test routes answer 404 without the test flag', async () => {
		await seeded({ entries: [{ type: 'look', title: 'Layers' }] });
		delete process.env.CREATIVE_ARCHIVE_TEST;

		const later = (call: () => unknown) => Promise.resolve().then(call);
		await expect(later(() => reset(post({})))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => seed(post({ entries: [{ type: 'look', title: 'More' }] })))).rejects.toMatchObject({
			status: 404
		});
		await expect(later(() => counts({} as never))).rejects.toMatchObject({ status: 404 });
		await expect(later(() => image({ params: { name: 'x.png' } } as never))).rejects.toMatchObject({ status: 404 });

		expect(count('entries')).toBe(1);
	});

	it('reset deletes every row of every table and keeps the migration record', async () => {
		await seeded(FULL);
		getDb().prepare("INSERT INTO status_events (entry_id, status, at) VALUES (1, 'done', 'now')").run();
		for (const t of TABLES) expect(count(t), t).toBeGreaterThan(0);

		const res = await reset(post({}));

		expect(res.status).toBe(204);
		for (const t of TABLES) expect(count(t), t).toBe(0);
		expect(count('schema_migrations')).toBeGreaterThan(0);
	});

	it('seed inserts entries, links, tags, collections and heroes and returns their ids', async () => {
		const ids = await seeded(FULL);
		const db = getDb();

		expect(ids.entries).toHaveLength(4);
		expect(ids.collections).toHaveLength(2);
		const [frank, blonde, unknown, frieren] = ids.entries;
		expect(db.prepare('SELECT * FROM entries WHERE id = ?').get(blonde)).toMatchObject({
			type: 'album',
			title: 'Blonde',
			status: 'done',
			rating_x2: 9,
			artist_id: frank,
			artist_name: 'Frank Ocean',
			details: '{"year":2016}',
			created_at: '2026-10-01T00:00:00.000Z',
			updated_at: '2026-10-02T00:00:00.000Z'
		});
		expect(db.prepare('SELECT image_id FROM entries WHERE id = ?').get(blonde)?.image_id).not.toBeNull();
		expect(db.prepare('SELECT artist_id, artist_name FROM entries WHERE id = ?').get(unknown)).toEqual({
			artist_id: null,
			artist_name: 'Unknown Band'
		});
		expect(db.prepare('SELECT episodes, episodes_total FROM entries WHERE id = ?').get(frieren)).toEqual({
			episodes: 27,
			episodes_total: 28
		});
		expect(db.prepare('SELECT name FROM tags ORDER BY name_key').all().map((r) => r.name)).toEqual(['Summer', 'Ästhetik']);
		expect(count('entry_tags')).toBe(3);
		expect(db.prepare('SELECT name, description FROM collections WHERE id = ?').get(ids.collections[0])).toEqual({
			name: 'Moodboard',
			description: 'Autumn'
		});
		expect(
			db
				.prepare('SELECT entry_id FROM collection_entries WHERE collection_id = ? ORDER BY added_at')
				.all(ids.collections[0])
				.map((r) => r.entry_id)
		).toEqual([frieren, blonde]);
		expect(db.prepare('SELECT world FROM heroes ORDER BY world').all().map((r) => r.world)).toEqual(['home', 'music']);
		expect(count('images')).toBe(4);
	});

	it('seeding nothing returns empty lists', async () => {
		expect(await seeded({})).toEqual({ entries: [], collections: [] });
	});

	it('counts reports the rows of every table', async () => {
		await seeded(FULL);

		const res = await counts({} as never);

		expect(await res.json()).toEqual({
			collection_entries: 2,
			collections: 2,
			entries: 4,
			entry_tags: 3,
			heroes: 2,
			images: 4,
			status_events: 0,
			tags: 2
		});
	});

	it('the image route answers a small PNG, the same one for the same name', async () => {
		const a = await image({ params: { name: 'blonde.png' } } as never);
		const b = await image({ params: { name: 'blonde.png' } } as never);
		const c = await image({ params: { name: 'brand.png' } } as never);

		expect(a.headers.get('content-type')).toBe('image/png');
		const bytes = new Uint8Array(await a.arrayBuffer());
		expect([...bytes.slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
		expect(Buffer.from(await b.arrayBuffer()).equals(Buffer.from(bytes))).toBe(true);
		expect(Buffer.from(await c.arrayBuffer()).equals(Buffer.from(bytes))).toBe(false);
	});
});
