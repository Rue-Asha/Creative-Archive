import sharp from 'sharp';
import { beforeEach, describe, expect, it } from 'vitest';
import { storeImage } from '#lib/server/images.ts';
import { useTestDb } from '#lib/server/testing.ts';
import { GET } from './[id]/+server.ts';

beforeEach(useTestDb);

function get(id: string): Response | Promise<Response> {
	return GET({ params: { id } } as never);
}

async function status(id: string): Promise<number> {
	try {
		return (await get(id)).status;
	} catch (e) {
		return (e as { status: number }).status;
	}
}

describe('GET /images/[id]', () => {
	it('Scenario: Image is served with caching headers', async () => {
		const id = await storeImage(
			await sharp({ create: { width: 32, height: 24, channels: 3, background: '#c05030' } }).png().toBuffer()
		);

		const res = await get(String(id));

		expect(res.status).toBe(200);
		expect(res.headers.get('content-type')).toBe('image/webp');
		expect(res.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
		expect((await sharp(Buffer.from(await res.arrayBuffer())).metadata()).format).toBe('webp');
		expect(await status(String(id + 1))).toBe(404);
	});

	it('answers 404 for a non-numeric id', async () => {
		expect(await status('abc')).toBe(404);
		expect(await status('1e3')).toBe(404);
	});
});
