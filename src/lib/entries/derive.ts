import type { Domain } from '#lib/domains.ts';
import { STATUS_LABELS } from '#lib/copy.ts';
import type { Entry, EntryType, Progress, Status } from '#lib/types.ts';
import { BRANDS_SHOPS, TYPES } from './config.ts';

export function domainOf(type: EntryType): Domain {
	return TYPES[type].domain;
}

function labelSet(type: EntryType): keyof typeof STATUS_LABELS | null {
	if (type === 'piece') return 'piece';
	if (TYPES[type].status !== 'media') return null;
	if (TYPES[type].domain === 'music') return 'music';
	return type === 'anime' ? 'anime' : 'read';
}

export function statusLabel(type: EntryType, status: Status | null): string | null {
	const set = labelSet(type);
	return set && status ? (STATUS_LABELS[set][status] ?? null) : null;
}

export function progressLabel(p: Progress): string {
	return `${p.current} / ${p.total ?? '?'}`;
}

export function atTotal(p: Progress): boolean {
	return p.total !== null && p.current >= p.total;
}

export function isWardrobe(entry: Pick<Entry, 'type' | 'status'>): boolean {
	return entry.type === 'piece' && entry.status === 'owned';
}

export function listHref(type: EntryType): string {
	if (type === 'brand' || type === 'site') return `/${TYPES[type].domain}/${BRANDS_SHOPS.slug}`;
	return `/${TYPES[type].domain}/${TYPES[type].slug}`;
}

export function ratingFromX100(x100: number | null): number | null {
	return x100 === null ? null : x100 / 100;
}

// the star control still counts in half stars until the redesign: shown stars are the rating over two, in half steps
export function starsFromRating(rating: number | null): number | null {
	return rating === null ? null : Math.round(rating) / 2;
}

export function isValidRating(rating: number): boolean {
	if (!Number.isFinite(rating) || rating < 0 || rating > 10) return false;
	return Math.abs(rating * 100 - Math.round(rating * 100)) <= 1e-6;
}

export function ratingToX100(rating: number | null): number | null {
	if (rating === null) return null;
	if (!isValidRating(rating)) throw new RangeError('Rating must be between 0 and 10 with up to two decimals');
	return Math.round(rating * 100);
}
