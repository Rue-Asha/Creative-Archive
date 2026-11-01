import { json } from '@sveltejs/kit';
import { dataTables, getDb } from '#lib/server/db.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	requireTestFlag();
	const db = getDb();
	return json(
		Object.fromEntries(
			dataTables(db).map((t) => [t, Number(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n)])
		)
	);
};
