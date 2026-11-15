import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from '#lib/server/db.ts';
import { useTestDb } from '#lib/server/testing.ts';
import { load } from './+page.server.ts';

beforeEach(useTestDb);

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

const run = (type: string, query: string) =>
	load({ params: { type }, url: new URL(`http://localhost/add/${type}?${query}`) } as never) as unknown as {
		initialStatus?: string;
	};

describe('add route status prefill', () => {
	it('Scenario: Valid status prefills the form', () => {
		expect(run('piece', 'manual=1&status=owned').initialStatus).toBe('owned');
		expect(run('album', 'status=want').initialStatus).toBe('want');
	});

	it('Scenario: Invalid status is dropped', () => {
		expect(run('piece', 'status=done').initialStatus).toBeUndefined();
		expect(run('book', 'status=owned').initialStatus).toBeUndefined();
		expect(run('artist', 'status=owned').initialStatus).toBeUndefined();
	});
});

describe('brand and site add routes', () => {
	it('Scenario: Both add routes open the combined form', () => {
		for (const type of ['brand', 'site']) expect(run(type, '')).toMatchObject({ type, manual: false });
	});
});
