import { crc32, deflateSync } from 'node:zlib';
import type { World } from '#lib/domains.ts';
import { TYPES } from '#lib/entries/config.ts';
import { fold } from '#lib/text.ts';
import type {
	EntryDetails,
	EntryType,
	Id,
	IsoDateTime,
	Progress,
	ProgressKey,
	ProviderId,
	SiteKind,
	Status
} from '#lib/types.ts';
import { closeDb, getDb } from './db.ts';
import { entryColumns } from './rows.ts';

export interface SeedEntry {
	type: EntryType;
	title: string;
	status?: Status;
	rating?: number;
	progress?: Partial<Record<ProgressKey, Progress>>;
	kind?: SiteKind;
	// the seed route: index of an earlier entry in the request; insertEntryRow: that entry's id. A string is a plain name.
	artist?: number | string;
	provider?: ProviderId;
	externalId?: string;
	details?: EntryDetails;
	tags?: string[];
	note?: string;
	image?: boolean;
	createdAt?: IsoDateTime;
	updatedAt?: IsoDateTime;
}

export interface SeedInput {
	entries?: SeedEntry[];
	// entries are indexes into `entries`, in added order
	collections?: { name: string; description?: string; entries: number[] }[];
	heroes?: World[];
}

export interface SeedResult {
	entries: Id[];
	collections: Id[];
}

export function useTestDb(): void {
	closeDb();
	process.env.DATABASE_PATH = ':memory:';
	getDb();
}

function png(width: number, height: number, index: number): Uint8Array<ArrayBuffer> {
	const chunk = (type: string, data: Buffer) => {
		const body = Buffer.concat([Buffer.from(type), data]);
		const out = Buffer.alloc(body.length + 8);
		out.writeUInt32BE(data.length, 0);
		body.copy(out, 4);
		out.writeUInt32BE(crc32(body), body.length + 4);
		return out;
	};
	const header = Buffer.alloc(13);
	header.writeUInt32BE(width, 0);
	header.writeUInt32BE(height, 4);
	header.set([8, 2, 0, 0, 0], 8);
	const hue = (index * 67) % 256;
	const raw = Buffer.alloc((width * 3 + 1) * height);
	for (let y = 0; y < height; y++) {
		const row = y * (width * 3 + 1);
		for (let x = 0; x < width; x++) raw.set([hue, (120 + x * 2) % 256, (255 - hue + y) % 256], row + 1 + x * 3);
	}
	return new Uint8Array(
		Buffer.concat([
			Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
			chunk('IHDR', header),
			chunk('IDAT', deflateSync(raw)),
			chunk('IEND', Buffer.alloc(0))
		])
	);
}

const WIDTH = 64;
const HEIGHT = 48;

export function testImage(index = 0): Uint8Array<ArrayBuffer> {
	return png(WIDTH, HEIGHT, index);
}

// the same name always gives the same image
export function testImageNamed(name: string): Uint8Array<ArrayBuffer> {
	return testImage([...name].reduce((sum, c) => sum + c.charCodeAt(0), 0));
}

export function insertTestImage(index: number, now: IsoDateTime = new Date().toISOString()): Id {
	const { lastInsertRowid } = getDb()
		.prepare("INSERT INTO images (mime, width, height, bytes, created_at) VALUES ('image/png', ?, ?, ?, ?)")
		.run(WIDTH, HEIGHT, testImage(index), now);
	return Number(lastInsertRowid);
}

let images = 0;

// plain SQL, no validation: what a seeded row looks like is up to the test
export function insertEntryRow(input: SeedEntry, now: IsoDateTime = new Date().toISOString()): Id {
	const db = getDb();
	const status = TYPES[input.type].status;
	const artistName =
		typeof input.artist === 'number'
			? String(db.prepare('SELECT title FROM entries WHERE id = ?').get(input.artist)?.title)
			: input.artist;
	const createdAt = input.createdAt ?? now;
	const cols: Record<string, unknown> = {
		...entryColumns({
			type: input.type,
			title: input.title,
			status: input.status ?? (status === 'media' ? 'none' : status === 'piece' ? 'wishlist' : undefined),
			rating: input.rating,
			progress: input.progress,
			kind: input.kind,
			artist:
				artistName === undefined
					? undefined
					: { id: typeof input.artist === 'number' ? input.artist : null, name: artistName },
			provider: input.provider,
			externalId: input.externalId,
			details: input.details,
			note: input.note
		}),
		image_id: input.image ? insertTestImage(images++, now) : null,
		created_at: createdAt,
		updated_at: input.updatedAt ?? createdAt
	};
	for (const k of Object.keys(cols)) if (cols[k] === undefined) delete cols[k];
	const names = Object.keys(cols);
	const id = Number(
		db
			.prepare(`INSERT INTO entries (${names.join(', ')}) VALUES (${names.map(() => '?').join(', ')})`)
			.run(...(Object.values(cols) as (string | number | null)[])).lastInsertRowid
	);
	const findTag = db.prepare('SELECT id FROM tags WHERE name_key = ?');
	const insertTag = db.prepare('INSERT INTO tags (name, name_key) VALUES (?, ?)');
	const linkTag = db.prepare('INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)');
	for (const name of input.tags ?? []) {
		const key = fold(name);
		if (!key) continue;
		const tagId =
			(findTag.get(key)?.id as number | undefined) ??
			Number(insertTag.run(name.trim().replace(/\s+/g, ' '), key).lastInsertRowid);
		linkTag.run(id, tagId);
	}
	return id;
}
