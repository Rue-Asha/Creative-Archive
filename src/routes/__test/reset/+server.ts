import { resetDb } from '#lib/server/db.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = () => {
	requireTestFlag();
	resetDb();
	return new Response(null, { status: 204 });
};
