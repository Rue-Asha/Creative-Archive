import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { progressLabel } from '#lib/entries/derive.ts';
import { ValidationError } from '#lib/errors.ts';
import type { EntryType, Id } from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import { loadTags, rowToEntry } from './rows.ts';
import { insertEntryRow, useTestDb } from './testing.ts';
import { setProgress, setRating, setStatus, statusEvents, stepProgress } from './tracking.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const OLD = '2026-01-01T00:00:00.000Z';

function read(id: Id) {
	const row = getDb().prepare('SELECT * FROM entries WHERE id = ?').get(id) as Record<string, unknown>;
	return rowToEntry(row, loadTags([id]).get(id) ?? []);
}

function eventCount(id: Id): number {
	return statusEvents(id).length;
}

function seed(type: EntryType, extra: Parameters<typeof insertEntryRow>[0] extends infer S ? Partial<S> : never = {}) {
	return insertEntryRow({ type, title: `Seeded ${type}`, ...extra }, OLD);
}

describe('setStatus', () => {
	it('Scenario: Changing status stores a dated event', () => {
		const id = seed('album', { status: 'want' });
		const before = Date.now();

		expect(setStatus(id, 'done')).toBe(true);

		expect(read(id).status).toBe('done');
		const events = statusEvents(id);
		expect(events).toHaveLength(1);
		expect(events.at(-1)).toMatchObject({ entryId: id, status: 'done' });
		const at = Date.parse(events.at(-1)!.at);
		expect(at).toBeGreaterThanOrEqual(before);
		expect(at).toBeLessThanOrEqual(Date.now());
		expect(read(id).updatedAt).toBe(events.at(-1)!.at);
	});

	it('Scenario: Setting the same status again stores no event', () => {
		const id = seed('book', { status: 'progress' });

		expect(setStatus(id, 'progress')).toBe(false);

		expect(eventCount(id)).toBe(0);
		expect(read(id).updatedAt).toBe(OLD);
	});

	it('Scenario: Status none is allowed', () => {
		const id = seed('artist', { status: 'done' });

		expect(setStatus(id, 'none')).toBe(true);

		expect(read(id).status).toBe('none');
		expect(statusEvents(id).map((e) => e.status)).toEqual(['none']);
	});

	it('Scenario: Invalid status for a type is rejected', () => {
		const brand = seed('brand', { kind: 'brand' });
		const piece = seed('piece', { status: 'owned' });
		const album = seed('album', { status: 'want' });
		const magazine = seed('magazine');

		expect(() => setStatus(brand, 'want')).toThrow(ValidationError);
		expect(() => setStatus(magazine, 'done')).toThrow(ValidationError);
		expect(() => setStatus(magazine, 'none')).toThrow(ValidationError);
		expect(() => setStatus(brand, 'none')).toThrow(ValidationError);
		expect(() => setStatus(piece, 'want')).toThrow(ValidationError);
		expect(() => setStatus(album, 'owned')).toThrow(ValidationError);

		expect(read(brand).status).toBeNull();
		expect(read(magazine).status).toBeNull();
		expect(read(piece).status).toBe('owned');
		expect(read(album).status).toBe('want');
		expect([brand, piece, album, magazine].map(eventCount)).toEqual([0, 0, 0, 0]);
	});

	it('stores no event for a piece and still changes its status', () => {
		const id = seed('piece', { status: 'wishlist' });

		expect(setStatus(id, 'owned')).toBe(true);

		expect(read(id).status).toBe('owned');
		expect(eventCount(id)).toBe(0);
	});
});

describe('progress', () => {
	it('Scenario: Progress cannot go below zero', () => {
		const id = seed('anime', { status: 'progress', progress: { episodes: { current: 0, total: 28 } } });

		expect(stepProgress(id, 'episodes', -1).progress.episodes?.current).toBe(0);

		expect(read(id).progress.episodes?.current).toBe(0);
		expect(setProgress(id, 'episodes', -5).progress.episodes?.current).toBe(0);
	});

	it('Scenario: Progress cannot exceed a known total', () => {
		const id = seed('anime', { status: 'progress', progress: { episodes: { current: 0, total: 28 } } });

		expect(setProgress(id, 'episodes', 40).progress.episodes?.current).toBe(28);
		expect(stepProgress(id, 'episodes', 1).progress.episodes?.current).toBe(28);
		expect(read(id).progress.episodes).toEqual({ current: 28, total: 28 });
	});

	it('Scenario: Unknown total has no upper bound', () => {
		const id = seed('manga', {
			status: 'progress',
			progress: { chapters: { current: 120, total: null }, volumes: { current: 0, total: null } }
		});

		const entry = setProgress(id, 'chapters', 400);

		expect(entry.progress.chapters?.current).toBe(400);
		expect(progressLabel(entry.progress.chapters!)).toBe('400 / ?');
		expect(read(id).progress.chapters).toEqual({ current: 400, total: null });
	});

	it('Scenario: Progress moves want to in progress', () => {
		const id = seed('anime', { status: 'want', progress: { episodes: { current: 0, total: 28 } } });

		const entry = stepProgress(id, 'episodes', 1);

		expect(entry.status).toBe('progress');
		expect(read(id).status).toBe('progress');
		expect(statusEvents(id).map((e) => e.status)).toEqual(['progress']);
	});

	it('Scenario: Progress leaves other statuses alone', () => {
		const none = seed('anime', { status: 'none', progress: { episodes: { current: 0, total: 28 } } });
		const dropped = seed('anime', { status: 'dropped', progress: { episodes: { current: 3, total: 28 } } });

		expect(stepProgress(none, 'episodes', 1).status).toBe('none');
		expect(stepProgress(dropped, 'episodes', 1).status).toBe('dropped');

		expect(read(none).progress.episodes?.current).toBe(1);
		expect(read(dropped).progress.episodes?.current).toBe(4);
		expect([none, dropped].map(eventCount)).toEqual([0, 0]);
	});

	it('Scenario: Manga tracks chapters and volumes separately', () => {
		const id = seed('manga', {
			status: 'progress',
			progress: { chapters: { current: 0, total: 100 }, volumes: { current: 0, total: 12 } }
		});

		setProgress(id, 'chapters', 50);
		setProgress(id, 'volumes', 6);

		expect(read(id).progress).toEqual({
			chapters: { current: 50, total: 100 },
			volumes: { current: 6, total: 12 }
		});
	});

	it('moves a want anime to in progress once, then never back', () => {
		const id = seed('anime', { status: 'want', progress: { episodes: { current: 0, total: 2 } } });

		stepProgress(id, 'episodes', 1);
		stepProgress(id, 'episodes', 1);
		const entry = stepProgress(id, 'episodes', -1);

		expect(entry.progress.episodes).toEqual({ current: 1, total: 2 });
		expect(entry.status).toBe('progress');
		expect(eventCount(id)).toBe(1);
	});

	it('reaching the total from want moves to in progress, not done', () => {
		const id = seed('anime', { status: 'want', progress: { episodes: { current: 0, total: 28 } } });

		const entry = setProgress(id, 'episodes', 28);

		expect(entry.progress.episodes).toEqual({ current: 28, total: 28 });
		expect(entry.status).toBe('progress');
		expect(statusEvents(id).map((e) => e.status)).toEqual(['progress']);
	});

	it('clamped to zero from want stays want', () => {
		const id = seed('anime', { status: 'want', progress: { episodes: { current: 0, total: 28 } } });

		expect(stepProgress(id, 'episodes', -1).status).toBe('want');
		expect(setProgress(id, 'episodes', 0).status).toBe('want');
		expect(eventCount(id)).toBe(0);
	});

	it('bumps updated_at on every progress write', () => {
		const id = seed('manga', {
			status: 'progress',
			progress: { chapters: { current: 1, total: null }, volumes: { current: 0, total: null } }
		});

		const entry = stepProgress(id, 'chapters', 1);

		expect(entry.updatedAt > OLD).toBe(true);
		expect(read(id).updatedAt).toBe(entry.updatedAt);
	});

	it('rejects a key the type does not track and a non-integer count', () => {
		const anime = seed('anime', { status: 'progress', progress: { episodes: { current: 2, total: 28 } } });
		const album = seed('album', { status: 'want' });

		expect(() => setProgress(anime, 'chapters', 3)).toThrow(ValidationError);
		expect(() => stepProgress(album, 'episodes', 1)).toThrow(ValidationError);
		expect(() => setProgress(anime, 'episodes', 1.5)).toThrow(ValidationError);
		expect(() => setProgress(anime, 'episodes', Number.NaN)).toThrow(ValidationError);

		expect(read(anime).progress.episodes?.current).toBe(2);
		expect(read(anime).updatedAt).toBe(OLD);
	});
});

describe('setRating', () => {
	it('Scenario: Rating is stored in half steps', () => {
		const id = seed('album', { status: 'done' });

		setRating(id, 4.5);
		expect(read(id).rating).toBe(4.5);

		for (const bad of [4.3, 0, 5.5]) {
			expect(() => setRating(id, bad)).toThrow(ValidationError);
			expect(read(id).rating).toBe(4.5);
		}
	});

	it('accepts the bounds and clears with null', () => {
		const id = seed('book', { status: 'done' });

		setRating(id, 0.5);
		expect(read(id).rating).toBe(0.5);
		setRating(id, 5);
		expect(read(id).rating).toBe(5);
		setRating(id, null);
		expect(read(id).rating).toBeNull();
	});

	it('rejects NaN and a type without ratings, and bumps updated_at on success', () => {
		const album = seed('album', { rating: 3 });
		const brand = seed('brand', { kind: 'brand' });

		expect(() => setRating(album, Number.NaN)).toThrow(ValidationError);
		expect(() => setRating(brand, 3)).toThrow(ValidationError);
		expect(read(album).updatedAt).toBe(OLD);
		expect(read(brand).rating).toBeNull();

		setRating(album, 4);
		expect(read(album).updatedAt > OLD).toBe(true);
	});
});
