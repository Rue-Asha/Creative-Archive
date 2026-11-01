import { describe, expect, it } from 'vitest';
import { inertiaSteps } from './dragScroll.ts';

describe('drag-scroll inertia', () => {
	it('Scenario: Inertia decays to a stop', () => {
		const steps = inertiaSteps(2);
		expect(steps.length).toBeGreaterThan(5);
		expect(steps[0]).toBeLessThan(2);
		steps.slice(1).forEach((v, i) => expect(v).toBeLessThan(steps[i]));
		expect(steps.at(-1)).toBeLessThan(0.05);
	});

	it('decays leftward velocity symmetrically', () => {
		expect(inertiaSteps(-2)).toEqual(inertiaSteps(2).map((v) => -v));
	});

	it('has nothing to glide when the release is already slow', () => {
		expect(inertiaSteps(0)).toEqual([]);
		expect(inertiaSteps(0.04)).toEqual([]);
	});
});
