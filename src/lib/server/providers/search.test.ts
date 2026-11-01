import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchError, ProviderError } from '#lib/errors.ts';
import { USER_AGENT } from '../remote.ts';
import type { SafeFetchOptions, SafeResponse } from '../net.ts';
import { createDeezer } from './deezer.ts';
import { createFetchJson } from './http.ts';
import { search } from './index.ts';
import { SEARCH_TIMEOUT_MS, type FetchJson } from './types.ts';

afterEach(() => {
	vi.useRealTimers();
});

const signal = new AbortController().signal;
const json = (value: unknown, status = 200): SafeResponse => ({
	url: 'https://api.example/',
	status,
	contentType: 'application/json',
	body: new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value))
});

describe('search', () => {
	it('Scenario: Provider times out after 5 seconds', async () => {
		vi.useFakeTimers();
		let seen: AbortSignal | undefined;
		const never: FetchJson = (_url, init) => {
			seen = init.signal;
			return new Promise(() => {});
		};

		const caught = search('album', 'Blonde', createDeezer(never)).catch((e) => e);
		await vi.advanceTimersByTimeAsync(SEARCH_TIMEOUT_MS - 1);
		expect(seen?.aborted).toBe(false);
		await vi.advanceTimersByTimeAsync(1);

		const error = await caught;
		expect(error).toBeInstanceOf(ProviderError);
		expect(error.code).toBe('timeout');
		expect(seen?.aborted).toBe(true);
	});

	it('maps a fetch timeout and an abort to timeout, anything else to failed', async () => {
		const failing = (e: unknown) => createDeezer(() => Promise.reject(e));

		await expect(search('album', 'x', failing(new FetchError('timeout')))).rejects.toMatchObject({ code: 'timeout' });
		await expect(search('album', 'x', failing(new DOMException('aborted', 'AbortError')))).rejects.toMatchObject({
			code: 'timeout'
		});
		await expect(search('album', 'x', failing(new FetchError('network')))).rejects.toMatchObject({ code: 'failed' });
		await expect(search('album', 'x', failing(new Error('boom')))).rejects.toMatchObject({ code: 'failed' });
	});
});

describe('createFetchJson', () => {
	it('sends a GET with the user agent, a 1 MB cap and the search budget, and parses the JSON', async () => {
		const calls: [string, SafeFetchOptions][] = [];
		const fetchJson = createFetchJson(async (url, opts) => (calls.push([url, opts]), json({ ok: true })));

		expect(await fetchJson('https://api.example/search?q=a', { signal })).toEqual({ ok: true });

		const [url, opts] = calls[0];
		expect(url).toBe('https://api.example/search?q=a');
		expect(opts).toMatchObject({ maxBytes: 1024 * 1024, timeoutMs: SEARCH_TIMEOUT_MS, method: 'GET' });
		expect(opts.headers).toMatchObject({ 'user-agent': USER_AGENT, accept: 'application/json' });
		expect(opts.headers).not.toHaveProperty('content-type');
	});

	it('posts a JSON body with a content type', async () => {
		const calls: SafeFetchOptions[] = [];
		const fetchJson = createFetchJson(async (_url, opts) => (calls.push(opts), json({})));

		await fetchJson('https://api.example/', { method: 'POST', body: '{"a":1}', signal });

		expect(calls[0]).toMatchObject({ method: 'POST', body: '{"a":1}' });
		expect(calls[0].headers).toMatchObject({ 'content-type': 'application/json' });
	});

	it('rejects a non-2xx answer, invalid JSON and an aborted signal', async () => {
		await expect(createFetchJson(async () => json({}, 429))('https://api.example/', { signal })).rejects.toThrow();
		await expect(createFetchJson(async () => json('<html>'))('https://api.example/', { signal })).rejects.toThrow();

		const controller = new AbortController();
		const slow = createFetchJson(() => new Promise(() => {}));
		const pending = slow('https://api.example/', { signal: controller.signal });
		controller.abort();
		await expect(pending).rejects.toMatchObject({ code: 'timeout' });
	});
});
