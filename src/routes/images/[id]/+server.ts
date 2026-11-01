import { error } from '@sveltejs/kit';
import { getImage } from '#lib/server/images.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	const image = /^\d+$/.test(params.id) ? getImage(Number(params.id)) : null;
	if (!image) error(404, 'Not found');
	return new Response(image.bytes as Uint8Array<ArrayBuffer>, {
		headers: {
			'content-type': image.mime,
			'cache-control': 'public, max-age=31536000, immutable'
		}
	});
};
