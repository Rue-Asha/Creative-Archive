import { describe, expect, it } from 'vitest';
import { coverflowState, dragPosition, place, swipeStep } from './coverflow.ts';

describe('coverflowState', () => {
	it('Scenario: Coverflow index clamps at the ends', () => {
		expect(coverflowState(0, 1)).toMatchObject({ index: 0, label: '01 / 01', arrows: false });
		expect(coverflowState(4, 5, 1)).toMatchObject({ index: 4, label: '05 / 05', canNext: false, canPrev: true });
		expect(coverflowState(0, 5, -1)).toMatchObject({ index: 0, label: '01 / 05', canPrev: false, canNext: true });
	});

	it('pulls an index that outgrew a shorter list back in', () => {
		expect(coverflowState(9, 3).index).toBe(2);
	});

	it('has nothing to show for an empty list', () => {
		expect(coverflowState(0, 0)).toMatchObject({ index: 0, arrows: false });
	});
});

describe('swipeStep', () => {
	it('right to left goes to the next card, left to right goes back, a short drag stays', () => {
		expect(swipeStep(-80)).toBe(1);
		expect(swipeStep(80)).toBe(-1);
		expect(swipeStep(-20)).toBe(0);
	});
});

describe('dragPosition', () => {
	it('follows the finger one card per step width and resists past the ends', () => {
		expect(dragPosition(2, -125, 250, 7)).toBeCloseTo(2.5);
		expect(dragPosition(0, 300, 100, 5)).toBeCloseTo(-1);
		expect(dragPosition(4, -300, 100, 5)).toBeCloseTo(5);
	});
});

describe('place', () => {
	it('keeps the centre card flat and full size', () => {
		expect(place(2, 2)).toMatchObject({ x: 0, z: 0, rotate: 0, scale: 1, fade: 1 });
	});

	it('tilts neighbours away from the centre, mirrored on both sides', () => {
		const right = place(3, 2);
		const left = place(1, 2);
		expect(right.rotate).toBeLessThan(0);
		expect(left.rotate).toBe(-right.rotate);
		expect(right.x).toBeGreaterThan(0);
		expect(right.scale).toBeLessThan(1);
		expect(right.z).toBeLessThan(0);
	});

	it('hides cards far from the centre', () => {
		expect(place(6, 2).fade).toBe(0);
	});
});
