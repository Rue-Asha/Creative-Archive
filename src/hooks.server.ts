import type { ServerInit } from '@sveltejs/kit/hooks';
import { getDb } from '#lib/server/db.ts';

// opening the database here makes a failing migration stop the server at start instead of at the first request
export const init: ServerInit = () => {
	getDb();
};
