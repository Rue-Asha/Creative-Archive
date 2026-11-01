import type { Domain } from '#lib/domains.ts';
import { STATUS_LABELS } from '#lib/copy.ts';
import type { Entry, EntryType, Progress, Status } from '#lib/types.ts';
import { TYPES } from './config.ts';

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
	return `/${TYPES[type].domain}/${TYPES[type].slug}`;
}

export function ratingFromX2(x2: number | null): number | null {
	return x2 === null ? null : x2 / 2;
}

export function ratingToX2(rating: number | null): number | null {
	return rating === null ? null : Math.round(rating * 2);
}
