import { SvelteSet } from 'svelte/reactivity';
import type { Id } from '#lib/types.ts';

export interface Selection {
	readonly active: boolean;
	readonly ids: Set<Id>;
	readonly count: number;
	enter(): void;
	leave(): void;
	toggle(id: Id, options?: { range?: boolean }): void;
	clear(): void;
	all(): void;
	prune(): void;
}

// One selection model for the list and the collection. A range runs from the last toggled id to the clicked one in
// display order; ids that are no longer in the list (a filter, a reload) stop counting, and `prune` forgets them so a
// wider filter later does not bring back picks the user can no longer see.
export function createSelection<T extends { id: Id }>(items: () => T[]): Selection {
	let active = $state(false);
	const picked = new SvelteSet<Id>();
	let anchor: Id | null = null;

	const present = $derived(new Set(items().map((item) => item.id)));
	const ids = $derived(new Set([...picked].filter((id) => present.has(id))));

	function toggle(id: Id, { range = false }: { range?: boolean } = {}) {
		const order = items().map((item) => item.id);
		const from = anchor === null ? -1 : order.indexOf(anchor);
		const to = order.indexOf(id);
		if (range && from >= 0 && to >= 0) {
			const [lo, hi] = from < to ? [from, to] : [to, from];
			for (const between of order.slice(lo, hi + 1)) picked.add(between);
		} else if (picked.has(id)) picked.delete(id);
		else picked.add(id);
		anchor = id;
	}

	function clear() {
		picked.clear();
		anchor = null;
	}

	return {
		get active() {
			return active;
		},
		get ids() {
			return ids;
		},
		get count() {
			return ids.size;
		},
		enter: () => (active = true),
		leave() {
			active = false;
			clear();
		},
		toggle,
		clear,
		all() {
			for (const item of items()) picked.add(item.id);
		},
		prune() {
			for (const id of [...picked]) if (!present.has(id)) picked.delete(id);
			if (anchor !== null && !present.has(anchor)) anchor = null;
		}
	};
}
