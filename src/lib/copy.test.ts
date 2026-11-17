import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COPY, withCount } from './copy.ts';

const contract = readFileSync('docs/functional-contract.md', 'utf8');
const copyList = contract.slice(contract.indexOf('## 6. Copy list'), contract.indexOf('## 7.'));

const gate5 = [
	'select', 'done', 'more', 'selected', 'setStatus', 'addTag', 'removeTag', 'statusSet', 'tagAdded', 'tagRemoved',
	'bulkFailed', 'moveToTop', 'moveToBottom', 'moveBefore', 'removeFromCollection', 'movedToTop', 'movedToBottom',
	'moved', 'removedFromCollection', 'collectionChanged', 'addSheetAll', 'addSheetDomain', 'brandOrShop',
	'heroExplanation', 'noEntriesYet', 'entryCount', 'typeCount', 'typedMeta'
] as const;

describe('copy', () => {
	it('Scenario: Contract strings stay', () => {
		for (const [key, text] of Object.entries(COPY)) expect(contract, key).toContain(text);
	});

	it('Scenario: New strings are in the contract', () => {
		for (const key of gate5) expect(copyList, key).toContain(COPY[key]);
	});

	it('counts one entry in the singular', () => {
		expect(withCount(COPY.moved, 3)).toBe('3 entries moved');
		expect(withCount(COPY.moved, 1)).toBe('1 entry moved');
		expect(withCount(COPY.selected, 2)).toBe('2 selected');
		expect(withCount(COPY.entryCount, 1)).toBe('1 entry');
	});
});
