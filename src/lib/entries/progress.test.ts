import { describe, expect, it } from 'vitest';
import { clampProgress } from './progress.ts';

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
