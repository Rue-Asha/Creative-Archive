import sharp, { type OutputInfo } from 'sharp';
import { FetchError, ImageError } from '#lib/errors.ts';
import type { Id } from '#lib/types.ts';
import { getDb } from './db.ts';
import { getRemote } from './remote.ts';

export const MAX_UPLOAD_BYTES = 16 * 1024 * 1024;
export const MAX_LONG_SIDE = 1600;
export const TARGET_BYTES = 200 * 1024;
const MIN_LONG_SIDE = 64;
const QUALITIES = [80, 70, 60, 50, 40];
// svg and pdf would be rasterised from author-controlled markup, so only photo formats count
const FORMATS = new Set(['jpeg', 'png', 'webp', 'gif', 'avif', 'heif']);

async function downscale(bytes: Uint8Array): Promise<{ data: Buffer; width: number; height: number }> {
	const meta = await sharp(bytes).metadata();
	if (!meta.format || !FORMATS.has(meta.format)) throw new ImageError('not-image');
	for (let side = MAX_LONG_SIDE; ; side = Math.floor(side * 0.8)) {
		let out: { data: Buffer; info: OutputInfo } | null = null;
		for (const quality of QUALITIES) {
			out = await sharp(bytes)
				.rotate()
				.resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true })
				.webp({ quality })
				.toBuffer({ resolveWithObject: true });
			if (out.data.length <= TARGET_BYTES) break;
		}
		if (out!.data.length <= TARGET_BYTES || side * 0.8 < MIN_LONG_SIDE) {
			return { data: out!.data, width: out!.info.width, height: out!.info.height };
		}
	}
}

async function convert(bytes: Uint8Array): Promise<{ data: Buffer; width: number; height: number }> {
	if (bytes.length > MAX_UPLOAD_BYTES) throw new ImageError('too-large');
	return downscale(bytes).catch((e) => {
		throw e instanceof ImageError ? e : new ImageError('not-image');
	});
}

export async function storeImage(bytes: Uint8Array): Promise<Id> {
	const image = await convert(bytes);
	const { lastInsertRowid } = getDb()
		.prepare('INSERT INTO images (mime, width, height, bytes, created_at) VALUES (?, ?, ?, ?, ?)')
		.run('image/webp', image.width, image.height, image.data, new Date().toISOString());
	return Number(lastInsertRowid);
}

export async function storeImageFromUrl(url: string): Promise<Id> {
	const bytes = await getRemote()
		.fetchImage(url)
		.catch((e) => {
			if (e instanceof ImageError) throw e;
			throw new ImageError(e instanceof FetchError && e.code === 'too-large' ? 'too-large' : 'download');
		});
	return storeImage(bytes);
}

export async function toWebpDataUrl(bytes: Uint8Array): Promise<string> {
	const image = await convert(bytes);
	return `data:image/webp;base64,${image.data.toString('base64')}`;
}

export function getImage(id: Id): { mime: string; bytes: Uint8Array } | null {
	const row = getDb().prepare('SELECT mime, bytes FROM images WHERE id = ?').get(id);
	return row ? { mime: String(row.mime), bytes: row.bytes as Uint8Array } : null;
}

export function deleteImage(id: Id): void {
	getDb().prepare('DELETE FROM images WHERE id = ?').run(id);
}
