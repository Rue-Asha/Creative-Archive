import { describe, expect, it } from 'vitest';
import { createSelection } from './selection.svelte.ts';

const items = [1, 2, 3, 4, 5].map((id) => ({ id }));
const ids = (s: ReturnType<typeof createSelection>) => [...s.ids].sort();

describe('selection', () => {
	it('Scenario: Selection toggles and ranges', () => {
		const s = createSelection(() => items);
		s.toggle(2);
		expect(ids(s)).toEqual([2]);
		expect(s.count).toBe(1);

		s.toggle(4, { range: true });
		expect(ids(s)).toEqual([2, 3, 4]);
		expect(s.count).toBe(3);

		s.toggle(3);
		expect(ids(s)).toEqual([2, 4]);

		s.clear();
		expect(ids(s)).toEqual([]);
		expect(s.count).toBe(0);
	});

	it('a range runs backwards too and a range without an anchor is a plain toggle', () => {
		const s = createSelection(() => items);
		s.toggle(4, { range: true });
		expect(ids(s)).toEqual([4]);
		s.toggle(2, { range: true });
		expect(ids(s)).toEqual([2, 3, 4]);
	});

	it('enter and leave switch the mode and leaving clears', () => {
		const s = createSelection(() => items);
		expect(s.active).toBe(false);
		s.enter();
		s.toggle(1);
		expect(s.active).toBe(true);
		s.leave();
		expect(s.active).toBe(false);
		expect(s.count).toBe(0);
	});

	it('all selects every item in display order and ids that left the list stop counting', () => {
		let list = items;
		const s = createSelection(() => list);
		s.all();
		expect(s.count).toBe(5);
		list = items.filter((i) => i.id !== 3);
		expect(s.count).toBe(4);
	});

	it('prune forgets picks the list no longer shows, so a wider list does not bring them back', () => {
		let list = items;
		const s = createSelection(() => list);
		s.toggle(2);
		s.toggle(4);
		list = items.filter((i) => i.id !== 4);
		s.prune();
		expect(ids(s)).toEqual([2]);
		list = items;
		expect(ids(s)).toEqual([2]);
	});
});
