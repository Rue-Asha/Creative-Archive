import { reducedMotion } from '#lib/motion.ts';

const MAX_DEGREES = 6;
const LIFT = -4;
const FINE_POINTER = '(hover: hover) and (pointer: fine)';

// Lifts the wrapped card and tilts it toward the pointer. A mouse on a fine-pointer device only; touch and reduced
// motion leave the card alone (reduced motion also switches off the CSS hover lift in EntryCard).
export function tilt(node: HTMLElement): { destroy(): void } {
	const card = () => node.querySelector<HTMLElement>('[data-card]');
	const active = (event: PointerEvent) => event.pointerType === 'mouse' && matchMedia(FINE_POINTER).matches && !reducedMotion();

	function move(event: PointerEvent) {
		const el = card();
		if (!el || !active(event)) return;
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
