import type { EntryDetails, MediaType } from '#lib/types.ts';
import type { FetchJson, Provider, SearchResult } from './types.ts';

const FIELDS = 'key,title,author_name,first_publish_year,cover_i';

interface OlDoc {
	key: string;
	title: string;
	author_name?: string[];
	first_publish_year?: number;
	cover_i?: number;
}

export function createOpenLibrary(fetchJson: FetchJson): Provider {
	return {
		id: 'openlibrary',
		async search(type: MediaType, query: string, signal: AbortSignal): Promise<SearchResult[]> {
			const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=${FIELDS}`;
			const body = (await fetchJson(url, { signal })) as { docs?: OlDoc[] };
			if (!Array.isArray(body.docs)) throw new Error('openlibrary: no docs in answer');
			return body.docs.map((d) => {
				const authors = d.author_name ?? [];
				const year = d.first_publish_year ?? null;
				const details: EntryDetails = {
					...(authors.length > 0 && { authors }),
					...(year !== null && { year })
				};
				return {
					provider: 'openlibrary',
					externalId: d.key.replace(/^\/works\//, ''),
					type,
					title: d.title,
					creator: authors.length > 0 ? authors.join(', ') : null,
					year,
					coverUrl: d.cover_i ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg` : null,
					details
				};
			});
		}
	};
}
