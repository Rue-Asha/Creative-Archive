import { error, json } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { FetchError } from '#lib/errors.ts';
import { readPreview } from '#lib/server/preview.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request }) => {
	if (!Object.hasOwn(TYPES, params.type) || !TYPES[params.type as keyof typeof TYPES].preview) error(404, 'Not found');
	const body: unknown = await request.json().catch(() => null);
	const url = typeof body === 'object' && body !== null && 'url' in body && typeof body.url === 'string' ? body.url.trim() : '';
	try {
		const { title, description, image } = await readPreview(url);
		return json({ title, description, image });
	} catch (e) {
		if (e instanceof FetchError) return json({ error: 'invalid-url' });
		throw e;
	}
};
