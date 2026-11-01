import { requireTestFlag } from '#lib/server/test-flag.ts';
import { testImageNamed } from '#lib/server/testing.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ params }) => {
	requireTestFlag();
	return new Response(testImageNamed(params.name), { headers: { 'content-type': 'image/png' } });
};
