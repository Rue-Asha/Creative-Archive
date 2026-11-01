import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, getDb } from '#lib/server/db.ts';
import { GET } from './+server.ts';

beforeEach(() => {
	process.env.DATABASE_PATH = join(mkdtempSync(join(tmpdir(), 'archive-health-')), 'h.db');
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

describe('/healthz', () => {
	it('Scenario: Healthy server answers 200', async () => {
		const res = await GET({} as never);

		expect(res.status).toBe(200);
		expect(await res.text()).toBe('ok');
	});

	it('Scenario: Unreadable database answers 503', async () => {
		getDb().close();

		const res = await GET({} as never);

		expect(res.status).toBe(503);
	});
});
