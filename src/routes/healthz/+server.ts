import { text } from '@sveltejs/kit';
import { getDb } from '#lib/server/db.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	try {
		getDb().prepare('SELECT 1').get();
		return text('ok');
	} catch {
		return text('database unavailable', { status: 503 });
	}
};
