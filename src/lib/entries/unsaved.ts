import { beforeNavigate, goto } from '$app/navigation';
import { get, writable } from 'svelte/store';

const pending = writable<URL | null>(null);
let allowed = false;

// where an in-app navigation that was held back wants to go; a dialog resolves it with keepEditing() or discard()
export const leaving = { subscribe: pending.subscribe };

// Call during component init. In-app navigation while `isDirty()` is cancelled and parked in `leaving`; leaving the
// page (reload, close, other site) is cancelled too, which makes the browser show its own prompt.
export function guardUnsaved(isDirty: () => boolean): void {
	beforeNavigate((navigation) => {
		// Kit 3 reports an enhanced form submit as a navigation too; Save is not leaving
		if (allowed || navigation.type === 'form' || !isDirty()) return;
		navigation.cancel();
		if (!navigation.willUnload && navigation.to) pending.set(navigation.to.url);
	});
}

export function keepEditing(): void {
	pending.set(null);
}

export function discard(): void {
	const url = get(pending);
	pending.set(null);
	allowed = true;
	if (url) void goto(url).finally(() => (allowed = false));
}
