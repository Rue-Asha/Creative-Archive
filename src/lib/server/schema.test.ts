import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { migrate, openDb } from './db.ts';

let db: DatabaseSync;

beforeEach(() => {
	db = openDb(join(mkdtempSync(join(tmpdir(), 'archive-schema-')), 's.db'));
	migrate(db);
});

afterEach(() => {
	db.close();
});

const NOW = '2026-10-31T08:00:00.000Z';

function entry(cols: Record<string, string | number | null>): number {
	const all = { title: 'Blonde', title_key: 'blonde', created_at: NOW, updated_at: NOW, ...cols };
	const names = Object.keys(all);
	const r = db
		.prepare(`INSERT INTO entries (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')})`)
		.run(...Object.values(all));
	return Number(r.lastInsertRowid);
}

describe('0002_core schema', () => {
	it('creates every table', () => {
		const names = db
			.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
			.all()
			.map((r) => String(r.name));

		expect(names).toEqual([
			'collection_entries',
			'collections',
			'entries',
			'entry_tags',
			'heroes',
			'images',
			'schema_migrations',
			'status_events',
			'tags'
		]);
	});

	it('defaults details to an empty object and note to an empty string', () => {
		const id = entry({ type: 'album', status: 'none' });

		expect(db.prepare('SELECT details, note FROM entries WHERE id = ?').get(id)).toEqual({ details: '{}', note: '' });
	});

	it('accepts a status only where the type has one', () => {
		expect(() => entry({ type: 'album', status: 'done' })).not.toThrow();
		expect(() => entry({ type: 'piece', status: 'owned' })).not.toThrow();
		expect(() => entry({ type: 'brand', status: null })).not.toThrow();
		expect(() => entry({ type: 'brand', status: 'done' })).toThrow(/CHECK/);
		expect(() => entry({ type: 'look', status: 'owned' })).toThrow(/CHECK/);
	});

	it('Scenario: Database accepts a magazine only without a status', () => {
		expect(() => entry({ type: 'magazine', status: null })).not.toThrow();
		expect(() => entry({ type: 'magazine', status: 'done' })).toThrow(/CHECK/);
		expect(() => entry({ type: 'magazine', status: 'owned' })).toThrow(/CHECK/);
	});

	it('refuses a piece with a media status and media with a piece status', () => {
		expect(() => entry({ type: 'piece', status: 'want' })).toThrow(/CHECK/);
		expect(() => entry({ type: 'anime', status: 'owned' })).toThrow(/CHECK/);
	});

	it('refuses an unknown type, kind and provider', () => {
		expect(() => entry({ type: 'movie' })).toThrow(/CHECK/);
		expect(() => entry({ type: 'site', kind: 'blog' })).toThrow(/CHECK/);
		expect(() => entry({ type: 'album', status: 'none', provider: 'spotify' })).toThrow(/CHECK/);
	});

	it('keeps ratings between half a star and five stars', () => {
		expect(() => entry({ type: 'album', status: 'done', rating_x2: 1 })).not.toThrow();
		expect(() => entry({ type: 'album', status: 'done', rating_x2: 10 })).not.toThrow();
		expect(() => entry({ type: 'album', status: 'done', rating_x2: 11 })).toThrow(/CHECK/);
		expect(() => entry({ type: 'album', status: 'done', rating_x2: 0 })).toThrow(/CHECK/);
	});

	it('refuses negative progress', () => {
		expect(() => entry({ type: 'anime', status: 'none', episodes: -1 })).toThrow(/CHECK/);
		expect(() => entry({ type: 'manga', status: 'none', volumes_total: -1 })).toThrow(/CHECK/);
	});

	it('refuses a blank title and invalid details', () => {
		expect(() => entry({ type: 'look', title: '   ' })).toThrow(/CHECK/);
		expect(() => entry({ type: 'look', details: '{nope' })).toThrow(/CHECK/);
	});

	it('refuses a second entry with the same type, provider and external id', () => {
		entry({ type: 'album', status: 'none', provider: 'deezer', external_id: '302127' });

		expect(() => entry({ type: 'album', status: 'none', provider: 'deezer', external_id: '302127' })).toThrow(/UNIQUE/);
		expect(() => entry({ type: 'artist', status: 'none', provider: 'deezer', external_id: '302127' })).not.toThrow();
		expect(() => entry({ type: 'album', status: 'none' })).not.toThrow();
		expect(() => entry({ type: 'album', status: 'none' })).not.toThrow();
	});

	it('clears the artist link when the artist is deleted', () => {
		const artist = entry({ type: 'artist', status: 'none', title: 'Frank Ocean', title_key: 'frank ocean' });
		const album = entry({ type: 'album', status: 'none', artist_id: artist, artist_name: 'Frank Ocean' });

		db.prepare('DELETE FROM entries WHERE id = ?').run(artist);

		expect(db.prepare('SELECT artist_id, artist_name FROM entries WHERE id = ?').get(album)).toEqual({
			artist_id: null,
			artist_name: 'Frank Ocean'
		});
	});

	it('cascades an entry delete to its tags, events and collections', () => {
		const id = entry({ type: 'album', status: 'none' });
		const tag = Number(db.prepare("INSERT INTO tags (name, name_key) VALUES ('Summer', 'summer')").run().lastInsertRowid);
		db.prepare('INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, ?)').run(id, tag);
		db.prepare("INSERT INTO status_events (entry_id, status, at) VALUES (?, 'done', ?)").run(id, NOW);
		const c = Number(
			db.prepare("INSERT INTO collections (name, created_at, updated_at) VALUES ('Moodboard', ?, ?)").run(NOW, NOW)
				.lastInsertRowid
		);
		db.prepare('INSERT INTO collection_entries (collection_id, entry_id, added_at) VALUES (?, ?, ?)').run(c, id, NOW);

		db.prepare('DELETE FROM entries WHERE id = ?').run(id);

		for (const t of ['entry_tags', 'status_events', 'collection_entries'])
			expect(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n, t).toBe(0);
		expect(db.prepare('SELECT count(*) AS n FROM tags').get()?.n).toBe(1);
	});

	it('clears an entry image and drops a hero when the image row goes', () => {
		const image = Number(
			db.prepare("INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/webp', 1, 1, x'00', ?)").run(NOW)
				.lastInsertRowid
		);
		const id = entry({ type: 'look', image_id: image });
		db.prepare("INSERT INTO heroes (world, image_id) VALUES ('music', ?)").run(image);

		db.prepare('DELETE FROM images WHERE id = ?').run(image);

		expect(db.prepare('SELECT image_id FROM entries WHERE id = ?').get(id)?.image_id).toBeNull();
		expect(db.prepare('SELECT count(*) AS n FROM heroes').get()?.n).toBe(0);
	});

	it('refuses an unknown hero world, a blank collection name and a duplicate tag key', () => {
		const image = Number(
			db.prepare("INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/webp', 1, 1, x'00', ?)").run(NOW)
				.lastInsertRowid
		);
		db.prepare("INSERT INTO tags (name, name_key) VALUES ('Ästhetik', 'ästhetik')").run();

		expect(() => db.prepare("INSERT INTO heroes (world, image_id) VALUES ('films', ?)").run(image)).toThrow(/CHECK/);
		expect(() =>
			db.prepare("INSERT INTO collections (name, created_at, updated_at) VALUES (' ', ?, ?)").run(NOW, NOW)
		).toThrow(/CHECK/);
		expect(() => db.prepare("INSERT INTO tags (name, name_key) VALUES ('ästhetik', 'ästhetik')").run()).toThrow(/UNIQUE/);
	});
});
