import { error, json } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { ProviderError } from '#lib/errors.ts';
import { findByExternal } from '#lib/server/entries.ts';
import { search } from '#lib/server/providers/index.ts';
import type { SearchResult } from '#lib/server/providers/types.ts';
import type { MediaType } from '#lib/types.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url }) => {
	if (!Object.hasOwn(TYPES, params.type) || TYPES[params.type as keyof typeof TYPES].provider === null) error(404, 'Not found');
	const type = params.type as MediaType;
	const q = (url.searchParams.get('q') ?? '').trim();
	if (!q) return json({ results: [] });
	try {
		const found = await search(type, q);
		const results: SearchResult[] = found.map((r) => {
			const existingId = findByExternal(type, r.provider, r.externalId);
			return existingId === null ? r : { ...r, existingId };
		});
		return json({ results });
	} catch (e) {
		if (e instanceof ProviderError) return json({ error: e.code });
		throw e;
	}
};
