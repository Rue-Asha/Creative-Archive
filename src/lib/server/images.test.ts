import sharp, { type Sharp } from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ImageError } from '#lib/errors.ts';
import { getDb } from './db.ts';
import { MAX_UPLOAD_BYTES, deleteImage, getImage, storeImage, storeImageFromUrl, toWebpDataUrl } from './images.ts';
import { useTestDb } from './testing.ts';

beforeEach(useTestDb);
afterEach(() => vi.unstubAllEnvs());

function imageRows(): number {
	return Number(getDb().prepare('SELECT count(*) AS n FROM images').get()?.n);
}

// noise compresses badly, so this stays above 200 KB until it is downscaled
function photo(width: number, height: number): Sharp {
	return sharp({
		create: { width, height, channels: 3, background: '#808080', noise: { type: 'gaussian', mean: 128, sigma: 12 } }
	});
}

async function rejection(p: Promise<unknown>): Promise<unknown> {
	return p.then(
		() => null,
		(e) => e
	);
}

describe('storeImage', () => {
	it('Scenario: Uploaded image is stored as WebP', async () => {
		const input = await photo(3000, 2000).jpeg({ quality: 92 }).toBuffer();

		const id = await storeImage(input);

		const row = getDb().prepare('SELECT mime, width, height, bytes FROM images WHERE id = ?').get(id)!;
		const bytes = row.bytes as Uint8Array;
		const meta = await sharp(bytes).metadata();
		expect(row.mime).toBe('image/webp');
		expect(meta.format).toBe('webp');
		expect(Math.max(row.width as number, row.height as number)).toBe(1600);
		expect(row.width).toBe(meta.width);
		expect(row.height).toBe(meta.height);
		expect(bytes.length).toBeLessThanOrEqual(200 * 1024);
	});

	it('Scenario: Each listed format is accepted', async () => {
		const base = sharp({ create: { width: 200, height: 120, channels: 3, background: '#c05030' } });
		const inputs = {
			png: await base.clone().png().toBuffer(),
			webp: await base.clone().webp().toBuffer(),
			gif: await base.clone().gif().toBuffer(),
			avif: await base.clone().avif().toBuffer()
		};

		for (const [format, bytes] of Object.entries(inputs)) {
			const id = await storeImage(bytes);
			const row = getImage(id);
			expect(row?.mime, format).toBe('image/webp');
			expect((await sharp(row!.bytes).metadata()).format, format).toBe('webp');
		}
		expect(imageRows()).toBe(4);
	});

	it('Scenario: Unsupported file is rejected by the server', async () => {
		const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>');
		const text = new TextEncoder().encode('just some text, not an image');

		for (const bytes of [svg, text]) {
			const err = await rejection(storeImage(bytes));
			expect(err).toBeInstanceOf(ImageError);
			expect((err as ImageError).code).toBe('not-image');
		}
		expect(imageRows()).toBe(0);
	});

	it('Scenario: Image over 16 MB is rejected by the server', async () => {
		const err = await rejection(storeImage(new Uint8Array(MAX_UPLOAD_BYTES + 1)));

		expect(err).toBeInstanceOf(ImageError);
		expect((err as ImageError).code).toBe('too-large');
		expect(imageRows()).toBe(0);
	});
});

describe('storeImageFromUrl', () => {
	it('Scenario: Image from a URL is stored', async () => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');

		const id = await storeImageFromUrl('https://covers.example/__test/image/cover.png');

		const row = getImage(id);
		expect(row?.mime).toBe('image/webp');
		expect((await sharp(row!.bytes).metadata()).format).toBe('webp');
		expect(imageRows()).toBe(1);
	});

	it('maps a failed download to ImageError(download) and stores nothing', async () => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');

		const err = await rejection(storeImageFromUrl('https://covers.example/missing.png'));

		expect(err).toBeInstanceOf(ImageError);
		expect((err as ImageError).code).toBe('download');
		expect(imageRows()).toBe(0);
	});

	it('maps a refused address to ImageError(download) without touching the network', async () => {
		const err = await rejection(storeImageFromUrl('http://127.0.0.1/cover.png'));

		expect(err).toBeInstanceOf(ImageError);
		expect((err as ImageError).code).toBe('download');
	});
});

describe('toWebpDataUrl', () => {
	it('returns a WebP data URL within the size target', async () => {
		const input = await photo(2400, 1600).jpeg({ quality: 92 }).toBuffer();

		const url = await toWebpDataUrl(input);

		expect(url.startsWith('data:image/webp;base64,')).toBe(true);
		const bytes = Buffer.from(url.slice('data:image/webp;base64,'.length), 'base64');
		expect(bytes.length).toBeLessThanOrEqual(200 * 1024);
		expect((await sharp(bytes).metadata()).format).toBe('webp');
		expect(imageRows()).toBe(0);
	});

	it('rejects a non-image', async () => {
		const err = await rejection(toWebpDataUrl(new TextEncoder().encode('nope')));

		expect((err as ImageError).code).toBe('not-image');
	});
});

describe('getImage and deleteImage', () => {
	it('deletes the row and ignores an unknown id', async () => {
		const id = await storeImage(await sharp({ create: { width: 8, height: 8, channels: 3, background: '#fff' } }).png().toBuffer());

		deleteImage(id);
		deleteImage(id + 100);

		expect(getImage(id)).toBeNull();
		expect(imageRows()).toBe(0);
	});
});
