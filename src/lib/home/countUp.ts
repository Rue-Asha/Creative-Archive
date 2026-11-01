import type { Action } from 'svelte/action';
import { reducedMotion } from '#lib/motion.ts';

const DURATION = 900;

// a count animates the first time it is seen and then stays put until the page is reloaded
const seen = new Set<string>();

const keyOf = (node: HTMLElement) => {
	const section = node.closest('[data-shelf], [aria-label]');
	return `${section?.getAttribute('data-shelf') ?? section?.getAttribute('aria-label') ?? ''}:${node.dataset.countKey ?? ''}`;
};

// Ticks the text from 0 to `count` once the element first enters the viewport. The number stays the server-rendered one
// until then, and under reduced motion for good.
export const countUp: Action<HTMLElement, number> = (node, count) => {
	if (reducedMotion() || typeof IntersectionObserver === 'undefined') return;
	const key = keyOf(node);
	if (seen.has(key)) return;
	let target = count;
	let frame = 0;

	const tick = (start: number) => (now: number) => {
		const t = Math.min(1, (now - start) / DURATION);
		const eased = 1 - (1 - t) ** 3;
		// Svelte owns this text node and writes its later updates to it, so only its data changes
		node.firstChild!.nodeValue = String(t === 1 ? target : Math.floor(target * eased));
		if (t < 1) frame = requestAnimationFrame(tick(start));
	};

	const observer = new IntersectionObserver((entries) => {
		if (!entries.some((e) => e.isIntersecting)) return;
		observer.disconnect();
		seen.add(key);
		frame = requestAnimationFrame(tick(performance.now()));
	});
	observer.observe(node);

	return {
		update(next) {
			target = next ?? 0;
		},
		destroy() {
			observer.disconnect();
			cancelAnimationFrame(frame);
		}
	};
};
