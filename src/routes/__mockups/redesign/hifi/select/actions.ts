import { statusSet, type ListDef } from '../list/data.ts';
import type { BarAction } from './SelectionBar.svelte';

// "Set status" only when every selected entry shares a status set (all media, or all pieces); tags for every type
export const barActions = (def: ListDef): BarAction[] => [
	...(statusSet(def) ? [{ id: 'status', label: 'Set status', menu: true }] : []),
	{ id: 'tag-add', label: 'Add tag' },
	{ id: 'tag-remove', label: 'Remove tag' }
];

export const TAGS = [
	{ name: 'favourite', count: 9 },
	{ name: 'autumn', count: 6 },
	{ name: 'quiet', count: 5 }
];
