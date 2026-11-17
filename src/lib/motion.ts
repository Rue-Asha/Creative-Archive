import type { AnimationConfig } from 'svelte/animate';
import type { TransitionConfig } from 'svelte/transition';

export function reducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// The fingerprint's motion tokens (tokens.css) as numbers, so script-driven motion keeps their timing. Times come
// back in ms whether the browser serialises them as "160ms" or "0.16s".
function token(name: string, fallback: number): number {
	if (typeof document === 'undefined') return fallback;
	const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	const value = parseFloat(raw);
	if (!Number.isFinite(value)) return fallback;
	return /\ds$/.test(raw) ? value * 1000 : value;
}

// cubic-bezier() as a function of t, for --ease-out and --ease-in-out in script-driven motion
export function bezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
	const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s ** 2 * (1 - s) + s ** 3;
	return (t) => {
		let lo = 0;
		let hi = 1;
		for (let i = 0; i < 24; i++) {
			const mid = (lo + hi) / 2;
			if (at(x1, x2, mid) < t) lo = mid;
			else hi = mid;
		}
		return at(y1, y2, (lo + hi) / 2);
	};
}
const easeOut = bezier(0.23, 1, 0.32, 1);
const easeInOut = bezier(0.77, 0, 0.175, 1);

// A card, row or chip that was just created rises into its place: opacity, the settle rise and the press scale over
// --motion-glide. Instant under reduced motion. Svelte plays it only for items added after the list rendered.
export function rise(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	const lift = token('--settle-rise', 12);
	const scale = token('--press-scale', 0.97);
	return {
		duration: token('--motion-glide', 260),
		easing: easeOut,
		css: (t, u) => `opacity: ${t}; transform: translateY(${u * lift}px) scale(${scale + (1 - scale) * t})`
	};
}

// A panel that opens in place (the new-collection form) fades in over --motion-quick and out the same way; it is not
// a created thing, so it does not rise. Instant under reduced motion.
export function appear(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return { duration: token('--motion-quick', 160), easing: easeOut, css: (t) => `opacity: ${t}` };
}

// What sits below a panel that came or went glides from where it was (`dy` above its new place) instead of jumping:
// FLIP through transform over --motion-glide. Nothing moves under reduced motion.
export function shift(node: Element, dy: number): void {
	if (!dy || reducedMotion()) return;
	const ease = typeof document === 'undefined' ? '' : getComputedStyle(document.documentElement).getPropertyValue('--ease-in-out').trim();
	node.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: token('--motion-glide', 260), easing: ease || 'ease-in-out' });
}

// Siblings glide to their new place when a list reflows (FLIP through transform). `enabled` is false for keyboard
// moves, which jump; reduced motion jumps too.
export function glide(_node: Element, { from, to }: { from: DOMRect; to: DOMRect }, enabled = true): AnimationConfig {
	const dx = from.left - to.left;
	const dy = from.top - to.top;
	if (!enabled || reducedMotion() || (dx === 0 && dy === 0)) return { duration: 0 };
	return {
		duration: token('--motion-glide', 260),
		easing: easeInOut,
		css: (_t, u) => `transform: translate(${u * dx}px, ${u * dy}px)`
	};
}
