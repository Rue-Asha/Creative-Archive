import { describe, expect, it } from 'vitest';
import { moveSelection } from './moveSelection.ts';

const [A, B, C, D, E] = [1, 2, 3, 4, 5];
const order = [A, B, C, D, E];

describe('moveSelection', () => {
	it('Scenario: Move order is computed for any selection', () => {
		const picked = new Set([D, B]);
		expect(moveSelection(order, picked, 'top')).toEqual([B, D, A, C, E]);
		expect(moveSelection(order, picked, 'bottom')).toEqual([A, C, E, B, D]);
		expect(moveSelection(order, picked, { before: C })).toEqual([A, B, D, C, E]);
		expect(moveSelection(order, new Set(order), 'top')).toEqual(order);
	});

	it('leaves the order alone for a target inside the selection', () => {
		expect(moveSelection(order, new Set([B, C]), { before: B })).toEqual(order);
	});
});
