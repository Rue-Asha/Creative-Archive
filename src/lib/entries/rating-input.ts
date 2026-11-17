import { isValidRating } from './derive.ts';

export const RATING_STEP = 0.25;

export type ParsedRating = { ok: true; value: number | null } | { ok: false };

// what the typed field commits: empty clears, a comma counts as the point, anything isValidRating refuses is rejected
export function parseRating(text: string): ParsedRating {
	const trimmed = text.trim().replace(',', '.');
	if (trimmed === '') return { ok: true, value: null };
	if (!/^\d+(\.\d+)?$|^\.\d+$/.test(trimmed)) return { ok: false };
	const value = Number(trimmed);
	return isValidRating(value) ? { ok: true, value } : { ok: false };
}

export function stepRating(value: number | null, direction: 1 | -1): number | null {
	if (value === null) return direction > 0 ? RATING_STEP : null;
	const next = Math.round((value + direction * RATING_STEP) * 100) / 100;
	return Math.min(10, Math.max(0, next));
}

export function formatRating(value: number | null): string {
	return value === null ? '' : String(value);
}
