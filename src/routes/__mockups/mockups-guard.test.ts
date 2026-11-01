import { isHttpError } from '@sveltejs/kit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { load } from './+layout.server.ts';
import { GET } from './photo/[name]/+server.ts';

const run = () => load({} as Parameters<typeof load>[0]);
const photo = (name: string) => GET({ params: { name } } as unknown as Parameters<typeof GET>[0]);

function thrown(fn: () => unknown): unknown {
	try {
		fn();
	} catch (e) {
		return e;
	}
}

afterEach(() => {
	vi.unstubAllEnvs();
});

describe('/__mockups guard', () => {
	it('Scenario: Mockup routes are hidden without the test flag', () => {
		for (const value of [undefined, '', '0', 'true']) {
			vi.stubEnv('CREATIVE_ARCHIVE_TEST', value);
			expect(isHttpError(thrown(run), 404), String(value)).toBe(true);
			expect(isHttpError(thrown(() => photo('anything.jpg')), 404), `photo ${value}`).toBe(true);
		}
	});

	it('answers with the test flag', () => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');
		expect(run).not.toThrow();
	});

	it('serves only plain file names from the photo folder', () => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');
		for (const name of ['../package.json', '..', 'CREDITS.txt', 'missing.jpg'])
			expect(isHttpError(thrown(() => photo(name)), 404), name).toBe(true);
	});
});
