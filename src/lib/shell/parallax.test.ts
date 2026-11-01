import { describe, expect, it } from 'vitest';
import { parallaxOffset } from './parallax.ts';

describe('parallaxOffset', () => {
	it('Scenario: Parallax offset follows scroll', () => {
		const at200 = parallaxOffset(200, false);

		expect(parallaxOffset(0, false)).toBe(0);
		expect(at200).toBeGreaterThan(0);
		expect(parallaxOffset(400, false)).toBe(at200 * 2);
		expect(parallaxOffset(400, true)).toBe(0);
	});

	it('moves slower than the page scrolls', () => {
		expect(parallaxOffset(400, false)).toBeLessThan(400);
	});

	it('stays put when the page is pulled past the top', () => {
		expect(parallaxOffset(-50, false)).toBe(0);
	});
});
