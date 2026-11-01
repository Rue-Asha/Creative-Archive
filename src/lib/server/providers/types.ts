import type { EntryDetails, Id, MediaType, ProgressKey, ProviderId } from '#lib/types.ts';

export const SEARCH_TIMEOUT_MS = 5000;

export type FetchJson = (
	url: string,
	init: { method?: 'GET' | 'POST'; body?: string; signal: AbortSignal }
) => Promise<unknown>;

export interface SearchResult {
	provider: ProviderId;
	externalId: string;
	type: MediaType;
	title: string;
	creator: string | null;
	year: number | null;
	coverUrl: string | null;
	details: EntryDetails;
	// AniList: null stays null
	progressTotals?: Partial<Record<ProgressKey, number | null>>;
	// Deezer album/track
	artist?: { externalId: string; name: string; imageUrl: string | null };
	// set by the search route, not by providers
	existingId?: Id;
}

export interface Provider {
	id: ProviderId;
	search(type: MediaType, query: string, signal: AbortSignal): Promise<SearchResult[]>;
}
