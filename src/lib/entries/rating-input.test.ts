import { describe, expect, it } from 'vitest';
import { formatRating, parseRating, stepRating } from './rating-input.ts';

describe('parseRating', () => {
	it('reads a comma or a point as the decimal mark', () => {
		expect(parseRating('8,75')).toEqual({ ok: true, value: 8.75 });
		expect(parseRating('8.75')).toEqual({ ok: true, value: 8.75 });
		expect(parseRating(' 7 ')).toEqual({ ok: true, value: 7 });
	});

	it('reads an empty field as no rating and zero as a rating', () => {
		expect(parseRating('')).toEqual({ ok: true, value: null });
		expect(parseRating('  ')).toEqual({ ok: true, value: null });
		expect(parseRating('0')).toEqual({ ok: true, value: 0 });
	});

	it('rejects more than two decimals, out of range and non-numbers', () => {
		for (const text of ['8.755', '-0.01', '10.01', '11', 'abc', '1e1', '8..5', '8,7,5']) expect(parseRating(text), text).toEqual({ ok: false });
	});
});

describe('stepRating', () => {
	it('steps by a quarter', () => {
		expect(stepRating(7, 1)).toBe(7.25);
		expect(stepRating(7.25, -1)).toBe(7);
	});

	it('clamps at 0 and 10', () => {
		expect(stepRating(0, -1)).toBe(0);
		expect(stepRating(0.1, -1)).toBe(0);
		expect(stepRating(10, 1)).toBe(10);
		expect(stepRating(9.9, 1)).toBe(10);
	});

	it('starts an unrated entry at a quarter and leaves it unrated going down', () => {
		expect(stepRating(null, 1)).toBe(0.25);
		expect(stepRating(null, -1)).toBeNull();
	});

	it('rounds to two decimals', () => {
		expect(stepRating(0.1 + 0.2, 1)).toBe(0.55);
	});
});

describe('formatRating', () => {
	it('shows the number without trailing zeros', () => {
		expect(formatRating(7)).toBe('7');
		expect(formatRating(8.75)).toBe('8.75');
		expect(formatRating(0)).toBe('0');
		expect(formatRating(null)).toBe('');
	});
});
