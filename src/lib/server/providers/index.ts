import { FetchError, ProviderError } from '#lib/errors.ts';
import { TYPES } from '#lib/entries/config.ts';
import { testFlag } from '#lib/server/test-flag.ts';
import type { MediaType, ProviderId } from '#lib/types.ts';
import { createAniList } from './anilist.ts';
import { createDeezer } from './deezer.ts';
import { fakeProviders } from './fake.ts';
import { createFetchJson } from './http.ts';
import { createOpenLibrary } from './openlibrary.ts';
import { SEARCH_TIMEOUT_MS, type Provider, type SearchResult } from './types.ts';

const fetchJson = createFetchJson();

const real: Record<ProviderId, Provider> = {
	deezer: createDeezer(fetchJson),
	anilist: createAniList(fetchJson),
	openlibrary: createOpenLibrary(fetchJson)
};

export function providerFor(type: MediaType): Provider {
	const id = TYPES[type].provider as ProviderId;
	return testFlag() ? fakeProviders[id] : real[id];
}

export async function search(
	type: MediaType,
	query: string,
	provider: Provider = providerFor(type)
): Promise<SearchResult[]> {
	const controller = new AbortController();
	let timer: ReturnType<typeof setTimeout> | undefined;
	const timeout = new Promise<never>((_, reject) => {
		timer = setTimeout(() => {
			reject(new ProviderError('timeout'));
			controller.abort();
		}, SEARCH_TIMEOUT_MS);
	});
	try {
		return await Promise.race([provider.search(type, query, controller.signal), timeout]);
	} catch (e) {
		if (e instanceof ProviderError) throw e;
		const timedOut = (e instanceof FetchError && e.code === 'timeout') || (e instanceof Error && e.name === 'AbortError');
		throw new ProviderError(timedOut ? 'timeout' : 'failed');
	} finally {
		clearTimeout(timer);
	}
}
