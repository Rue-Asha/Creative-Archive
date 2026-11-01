import type { Entry, EntryType, Id, ListQuery, MediaStatus, PieceStatus, ShelfData, SiteKind, SortKey, Status } from '#lib/types.ts';
import type { TypeConfig } from './config.ts';
import { statusLabel } from './derive.ts';

// `view` is page state, not part of the query the server filters by; only the shelves view is written to the URL
export interface ListState extends Partial<Pick<ListQuery, 'status' | 'kind' | 'tag' | 'minRating' | 'sort'>> {
	view?: 'shelves';
}

export const MEDIA_STATUSES: readonly MediaStatus[] = ['none', 'want', 'progress', 'done', 'dropped'];
export const PIECE_STATUSES: readonly PieceStatus[] = ['wishlist', 'owned', 'gone'];
const KINDS: readonly SiteKind[] = ['brand', 'shop', 'site'];
const SORTS: readonly SortKey[] = ['rating', 'title'];

const statusesOf = (config?: TypeConfig): readonly Status[] =>
	!config ? [...MEDIA_STATUSES, ...PIECE_STATUSES] : config.status === 'media' ? MEDIA_STATUSES : config.status === 'piece' ? PIECE_STATUSES : [];

export function toSearchParams(state: ListState): URLSearchParams {
	const params = new URLSearchParams();
	if (state.status) params.set('status', state.status);
	if (state.kind) params.set('kind', state.kind);
	if (state.tag !== undefined) params.set('tag', String(state.tag));
	if (state.minRating !== undefined) params.set('rating', String(state.minRating));
	if (state.sort && state.sort !== 'added') params.set('sort', state.sort);
	if (state.view) params.set('view', state.view);
	return params;
}

// Anything invalid, and anything the list's type has no filter for, is dropped instead of failing the page.
export function fromSearchParams(input: URLSearchParams | string, config?: TypeConfig): ListState {
	const params = typeof input === 'string' ? new URLSearchParams(input) : input;
	const state: ListState = {};

	const status = params.get('status');
	if (status && statusesOf(config).includes(status as Status)) state.status = status as Status;

	const kind = params.get('kind');
	const kinds = config ? (config.type === 'site' ? KINDS.filter((k) => k !== 'brand') : []) : KINDS;
	if (kind && kinds.includes(kind as SiteKind)) state.kind = kind as SiteKind;

	const tag = params.get('tag');
	if (tag && /^\d+$/.test(tag) && Number(tag) > 0) state.tag = Number(tag) as Id;

	const rating = Number(params.get('rating') ?? NaN);
	if ((!config || config.ratable) && rating >= 0.5 && rating <= 5 && Number.isInteger(rating * 2)) state.minRating = rating;

	const sort = params.get('sort');
	if (sort && SORTS.includes(sort as SortKey) && (sort !== 'rating' || !config || config.ratable)) state.sort = sort as SortKey;

	if (params.get('view') === 'shelves' && (!config || config.status === 'media')) state.view = 'shelves';
	return state;
}

const SHELF_ORDER: readonly MediaStatus[] = ['progress', 'want', 'done', 'dropped', 'none'];

// The shelves view: one shelf per status that has entries, in the order Rue reads them (current first).
export function statusShelves(type: EntryType, entries: Entry[]): ShelfData[] {
	return SHELF_ORDER.flatMap((status) => {
		const own = entries.filter((e) => e.status === status);
		return own.length ? [{ key: status, title: statusLabel(type, status)!, count: own.length, entries: own, href: null }] : [];
	});
}
