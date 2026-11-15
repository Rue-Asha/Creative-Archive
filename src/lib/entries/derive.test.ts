import { describe, expect, it } from 'vitest';
import { atTotal, domainOf, isWardrobe, listHref, progressLabel, ratingFromX100, ratingToX100, starsFromRating, statusLabel } from './derive.ts';

describe('derived values', () => {
	it('finds the domain of each type', () => {
		expect(domainOf('song')).toBe('music');
		expect(domainOf('manga')).toBe('animanga');
		expect(domainOf('book')).toBe('books');
		expect(domainOf('look')).toBe('fashion');
	});

	it('labels statuses per domain', () => {
		expect(statusLabel('album', 'done')).toBe('Listened');
		expect(statusLabel('artist', 'want')).toBe('Want to listen');
		expect(statusLabel('anime', 'progress')).toBe('Watching');
		expect(statusLabel('anime', 'want')).toBe('Plan to watch');
		expect(statusLabel('manga', 'done')).toBe('Read');
		expect(statusLabel('book', 'progress')).toBe('Reading');
		expect(statusLabel('song', 'dropped')).toBe('Dropped');
		expect(statusLabel('book', 'none')).toBe('No status');
		expect(statusLabel('piece', 'owned')).toBe('Owned');
	});

	it('has no status label for types without status or without a status', () => {
		expect(statusLabel('brand', null)).toBeNull();
		expect(statusLabel('album', null)).toBeNull();
	});

	it('shows progress with a known and an unknown total', () => {
		expect(progressLabel({ current: 12, total: 28 })).toBe('12 / 28');
		expect(progressLabel({ current: 12, total: null })).toBe('12 / ?');
	});

	it('is at the total only when the total is known and reached', () => {
		expect(atTotal({ current: 28, total: 28 })).toBe(true);
		expect(atTotal({ current: 27, total: 28 })).toBe(false);
		expect(atTotal({ current: 500, total: null })).toBe(false);
		expect(atTotal({ current: 0, total: 0 })).toBe(true);
	});

	it('counts only owned pieces as wardrobe', () => {
		expect(isWardrobe({ type: 'piece', status: 'owned' })).toBe(true);
		expect(isWardrobe({ type: 'piece', status: 'wishlist' })).toBe(false);
		expect(isWardrobe({ type: 'album', status: 'done' })).toBe(false);
	});

	it('links each type to its list', () => {
		expect(listHref('album')).toBe('/music/albums');
		expect(listHref('site')).toBe('/fashion/brands-shops');
		expect(listHref('brand')).toBe('/fashion/brands-shops');
		expect(listHref('book')).toBe('/books/books');
	});

	it('shows the rating as half stars', () => {
		expect(starsFromRating(9)).toBe(4.5);
		expect(starsFromRating(7)).toBe(3.5);
		expect(starsFromRating(0.1)).toBe(0);
		expect(starsFromRating(8.75)).toBe(4.5);
		expect(starsFromRating(null)).toBeNull();
	});

	it('turns stored hundredths into a rating and back', () => {
		expect(ratingFromX100(875)).toBe(8.75);
		expect(ratingFromX100(0)).toBe(0);
		expect(ratingFromX100(null)).toBeNull();
		expect(ratingToX100(8.75)).toBe(875);
		expect(ratingToX100(0.1 + 0.2)).toBe(30);
		expect(ratingToX100(0)).toBe(0);
		expect(ratingToX100(null)).toBeNull();
		for (const bad of [8.755, -0.01, 10.01, Number.NaN, Infinity]) expect(() => ratingToX100(bad)).toThrow(RangeError);
	});

});
