import { reducedMotion } from '#lib/motion.ts';

const MAX_DEGREES = 6;
const LIFT = -4;
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

// cards pinned flat by atRest, which a pointer move must not tilt again
const resting = new WeakSet<Element>();

// Lifts the wrapped card and tilts it toward the pointer. A mouse on a fine-pointer device only; touch and reduced
// motion leave the card alone (reduced motion also switches off the CSS hover lift in EntryCard).
export function tilt(node: HTMLElement): { destroy(): void } {
	const card = () => node.querySelector<HTMLElement>('[data-card]');
	const active = (event: PointerEvent) => event.pointerType === 'mouse' && matchMedia(FINE_POINTER).matches && !reducedMotion();

	function move(event: PointerEvent) {
		const el = card();
		if (!el || resting.has(el) || !active(event)) return;
		const box = el.getBoundingClientRect();
		const x = (event.clientX - box.left) / box.width - 0.5;
		const y = (event.clientY - box.top) / box.height - 0.5;
		// the buttons of a control row stay flat under the pointer
		const flat = (event.target as Element).closest('button, input') !== null;
		const rx = flat ? 0 : -y * 2 * MAX_DEGREES;
		const ry = flat ? 0 : x * 2 * MAX_DEGREES;
		el.style.transition = 'transform 120ms var(--ease-out), box-shadow var(--d-base) var(--ease-out)';
		el.style.transform = `perspective(800px) translateY(${LIFT}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
	}

	function leave() {
		const el = card();
		if (!el) return;
		el.style.removeProperty('transition');
		el.style.removeProperty('transform');
	}

	node.addEventListener('pointermove', move);
	node.addEventListener('pointerleave', leave);
	return {
		destroy() {
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerleave', leave);
			leave();
		}
	};
}

// The page transition snapshots a card's cover at rest: no lift, no tilt and no zoomed image, whatever the pointer
// does until the snapshot is taken. Returns the undo.
export function atRest(cover: HTMLElement): () => void {
	const card = cover.closest<HTMLElement>('[data-card]');
	const pinned = [card, cover.querySelector<HTMLElement>('img')].filter((el) => el !== null);
	const saved = pinned.map((el) => ['transform', 'transition'].map((p) => [p, el.style.getPropertyValue(p)] as const));
	if (card) resting.add(card);
	for (const el of pinned) {
		el.style.setProperty('transition', 'none');
		el.style.setProperty('transform', 'none');
	}
	return () => {
		if (card) resting.delete(card);
		pinned.forEach((el, i) => {
			for (const [p, value] of saved[i]) {
				if (value) el.style.setProperty(p, value);
				else el.style.removeProperty(p);
			}
		});
	};
}
