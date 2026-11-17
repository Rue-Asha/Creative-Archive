import type { MockEntry } from '../../fixtures.ts';

export type Target = 'top' | 'bottom' | { before: number };

// The selected entries keep their relative order (their order in the list, not the click order) and move as one block.
export function moveSelection(order: MockEntry[], selected: Set<number>, target: Target): MockEntry[] {
	const block = order.filter((e) => selected.has(e.id));
	const rest = order.filter((e) => !selected.has(e.id));
	if (target === 'top') return [...block, ...rest];
	if (target === 'bottom') return [...rest, ...block];
	const at = rest.findIndex((e) => e.id === target.before);
	return at < 0 ? order : [...rest.slice(0, at), ...block, ...rest.slice(at)];
}
