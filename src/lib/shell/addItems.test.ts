import { describe, expect, it } from 'vitest';
import { addItems } from './addItems.ts';

const view = (items: ReturnType<typeof addItems>) => items.map((i) => `${i.label} ${i.href}`);

describe('addItems', () => {
	it('Scenario: Add items per scope', () => {
		const all = addItems('all');
		expect(all).toHaveLength(11);
		expect(all.map((i) => i.domain)).toEqual([
			'music', 'music', 'music', 'animanga', 'animanga', 'books', 'fashion', 'fashion', 'fashion', 'fashion', 'fashion'
		]);
		expect(all.slice(0, 3).map((i) => i.label)).toEqual(['Album', 'Artist', 'Song']);

		expect(addItems('music').map((i) => i.label)).toEqual(['Album', 'Artist', 'Song']);

		const fashion = ['Brand or shop /add/brand', 'Influencer /add/influencer', 'Magazine /add/magazine', 'Piece /add/piece', 'Look /add/look'];
		expect(view(addItems('fashion'))).toEqual(fashion);

		fashion[3] = 'Piece /add/piece?status=owned';
		expect(view(addItems('fashion', { list: 'wardrobe' }))).toEqual(fashion);
		expect(view(addItems('fashion', { list: 'looks' }))[3]).toBe('Piece /add/piece');
	});
});
