import { describe, expect, it } from 'vitest';
import { clampProgress, parseProgress } from './progress.ts';

describe('clampProgress', () => {
	it('never goes below zero', () => {
		expect(clampProgress(-1, 28)).toBe(0);
		expect(clampProgress(-3, null)).toBe(0);
	});

	it('never goes above a known total', () => {
		expect(clampProgress(29, 28)).toBe(28);
		expect(clampProgress(28, 28)).toBe(28);
	});

	it('has no upper bound when the total is unknown', () => {
		expect(clampProgress(1200, null)).toBe(1200);
	});
});

describe('parseProgress', () => {
	it('Scenario: Typed progress is parsed strictly', () => {
		expect(parseProgress('27', 28)).toBe(27);
		expect(parseProgress('400', null)).toBe(400);
		expect(parseProgress('', 28)).toBeNull();
		expect(parseProgress('abc', 28)).toBeNull();
		expect(parseProgress('-1', 28)).toBeNull();
		expect(parseProgress('2.5', 28)).toBeNull();
		expect(parseProgress(' 7 ', 28)).toBe(7);
		expect(parseProgress('40', 28)).toBeNull();
	});
});
