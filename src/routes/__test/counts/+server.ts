import { json } from '@sveltejs/kit';
import { dataTables, getDb } from '#lib/server/db.ts';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	requireTestFlag();
	const db = getDb();
	// status events also by status ("status_events.progress"), so a test can tell which event a save wrote
	const byStatus = db.prepare('SELECT status, count(*) AS n FROM status_events GROUP BY status').all();
	return json({
		...Object.fromEntries(dataTables(db).map((t) => [t, Number(db.prepare(`SELECT count(*) AS n FROM ${t}`).get()?.n)])),
		...Object.fromEntries(byStatus.map((r) => [`status_events.${r.status}`, Number(r.n)]))
	});
};
