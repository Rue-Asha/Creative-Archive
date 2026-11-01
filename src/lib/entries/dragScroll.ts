import { reducedMotion } from '#lib/motion.ts';

const FRICTION = 0.93;
const FRAME_MS = 16;
const STOP = 0.05;
const MAX_VELOCITY = 3;
const THRESHOLD = 4;
const WINDOW_MS = 100;

// Scroll velocities (px/ms) of the frames after release, each slower than the last, ending below STOP.
export function inertiaSteps(velocity: number): number[] {
	const steps: number[] = [];
	let v = velocity;
	while (Math.abs(v) >= STOP) {
		v *= FRICTION;
		steps.push(v);
	}
	return steps;
}

// Mouse only: touch scrolls natively, with its own momentum.
export function dragScroll(node: HTMLElement): { destroy(): void } {
	let origin: { x: number; scroll: number } | null = null;
	let dragging = false;
	let samples: { t: number; x: number }[] = [];
	let frame = 0;

	const settle = () => node.style.removeProperty('scroll-snap-type');
	const halt = () => {
		cancelAnimationFrame(frame);
		frame = 0;
	};

	function down(event: PointerEvent) {
		if (event.pointerType !== 'mouse' || event.button !== 0) return;
		halt();
		origin = { x: event.clientX, scroll: node.scrollLeft };
		samples = [{ t: event.timeStamp, x: event.clientX }];
	}

	function move(event: PointerEvent) {
		if (!origin) return;
		const dx = event.clientX - origin.x;
		if (!dragging) {
			if (Math.abs(dx) < THRESHOLD) return;
			dragging = true;
			// capture only once it is a drag, so a plain click still reaches the card's link
			node.setPointerCapture(event.pointerId);
			node.style.scrollSnapType = 'none';
		}
		node.scrollLeft = origin.scroll - dx;
		samples.push({ t: event.timeStamp, x: event.clientX });
		samples = samples.filter((s) => event.timeStamp - s.t <= WINDOW_MS);
	}

	function up(event: PointerEvent) {
		const wasDragging = dragging;
		origin = null;
		dragging = false;
		if (!wasDragging) return;
		const recent = samples.filter((s) => event.timeStamp - s.t <= WINDOW_MS);
		const first = recent[0];
		const last = recent.at(-1);
		if (reducedMotion() || !first || !last || last === first || last.t === first.t) return settle();

		const velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, (first.x - last.x) / (last.t - first.t)));
		const steps = inertiaSteps(velocity);
		let i = 0;
		const tick = () => {
			const before = node.scrollLeft;
			if (i >= steps.length) return settle();
			node.scrollLeft += steps[i++] * FRAME_MS;
			// the row hit an end
			if (node.scrollLeft === before) return settle();
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
	}

	const noDrag = (event: Event) => event.preventDefault();

	node.addEventListener('pointerdown', down);
	node.addEventListener('pointermove', move);
	node.addEventListener('pointerup', up);
	node.addEventListener('pointercancel', up);
	node.addEventListener('dragstart', noDrag);
	return {
		destroy() {
			halt();
			node.removeEventListener('pointerdown', down);
			node.removeEventListener('pointermove', move);
			node.removeEventListener('pointerup', up);
			node.removeEventListener('pointercancel', up);
			node.removeEventListener('dragstart', noDrag);
		}
	};
}
