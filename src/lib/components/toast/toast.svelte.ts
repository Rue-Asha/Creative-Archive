// Toasts: copy-in reference primitive from Design-System (sync.sh <app> --primitive toast).
// The app owns this copy. Call toast() from anywhere; <Toaster /> in the root layout shows them.
//   toast('Recipe saved')
//   toast('Moved to Friday', { action: { label: 'Undo', run: undo } })
//   toast("Couldn't save — try again", { kind: 'error' })
// Info toasts leave after 5 s (8 s with an action); errors stay until dismissed. Timers pause
// while the pointer or focus is on the toasts.

export type ToastKind = 'info' | 'error';
export type ToastAction = { label: string; run: () => void };
export type Toast = { id: number; message: string; kind: ToastKind; action?: ToastAction };

const LIMIT = 3;
const DURATION = { info: 5000, action: 8000 };

export const toasts: Toast[] = $state([]);

const timers = new Map<number, { remaining: number; started: number; handle?: ReturnType<typeof setTimeout> }>();
let paused = false;
let next = 1;

export function toast(message: string, options: { kind?: ToastKind; action?: ToastAction; duration?: number } = {}): number {
	const kind = options.kind ?? 'info';
	const id = next++;
	toasts.push({ id, message, kind, action: options.action });
	while (toasts.length > LIMIT) dismiss(toasts[0].id);
	const duration = options.duration ?? (kind === 'error' ? Infinity : options.action ? DURATION.action : DURATION.info);
	if (Number.isFinite(duration)) {
		timers.set(id, { remaining: duration, started: 0 });
		if (!paused) start(id);
	}
	return id;
}

export function dismiss(id: number) {
	clearTimeout(timers.get(id)?.handle);
	timers.delete(id);
	const i = toasts.findIndex((t) => t.id === id);
	if (i !== -1) toasts.splice(i, 1);
}

export function pause() {
	if (paused) return;
	paused = true;
	for (const t of timers.values()) {
		clearTimeout(t.handle);
		t.remaining -= Date.now() - t.started;
	}
}

export function resume() {
	if (!paused) return;
	paused = false;
	for (const id of timers.keys()) start(id);
}

function start(id: number) {
	const t = timers.get(id);
	if (!t) return;
	t.started = Date.now();
	t.handle = setTimeout(() => dismiss(id), Math.max(t.remaining, 0));
}
