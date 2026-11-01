import { FetchError } from '#lib/errors.ts';
import { safeFetch } from '../net.ts';
import { USER_AGENT } from '../remote.ts';
import { SEARCH_TIMEOUT_MS, type FetchJson } from './types.ts';

const MAX_JSON_BYTES = 1024 * 1024;

export function createFetchJson(fetcher: typeof safeFetch = safeFetch): FetchJson {
	return async (url, init) => {
		const aborted = new Promise<never>((_, reject) => {
			const abort = () => reject(new FetchError('timeout'));
			if (init.signal.aborted) abort();
			else init.signal.addEventListener('abort', abort, { once: true });
		});
		const res = await Promise.race([
			fetcher(url, {
				method: init.method ?? 'GET',
				body: init.body,
				headers: {
					'user-agent': USER_AGENT,
					accept: 'application/json',
					...(init.body !== undefined && { 'content-type': 'application/json' })
				},
				maxBytes: MAX_JSON_BYTES,
				timeoutMs: SEARCH_TIMEOUT_MS
			}),
			aborted
		]);
		if (res.status < 200 || res.status >= 300) throw new FetchError('status');
		return JSON.parse(new TextDecoder().decode(res.body));
	};
}
