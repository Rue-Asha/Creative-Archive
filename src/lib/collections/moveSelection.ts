import type { Id } from '#lib/types.ts';

export type MoveTarget = 'top' | 'bottom' | { before: Id };

// The selected entries move as one block and keep their order in the list (not the order they were picked in).
// A "before" target that is itself selected, or missing, leaves the order as it is.
export function moveSelection(order: Id[], selected: Set<Id>, target: MoveTarget): Id[] {
	const block = order.filter((id) => selected.has(id));
	const rest = order.filter((id) => !selected.has(id));
	if (target === 'top') return [...block, ...rest];
	if (target === 'bottom') return [...rest, ...block];
	const at = rest.indexOf(target.before);
	return at < 0 ? order : [...rest.slice(0, at), ...block, ...rest.slice(at)];
}
