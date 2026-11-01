import { backOut, cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

// Durations mirror --d-fast / --d-base / --d-slow in tokens.css.
const FAST = 160;
const BASE = 280;
const SLOW = 480;
const STAGGER_STEP = 40;
const STAGGER_MAX = 12;

export function reducedMotion(): boolean {
	return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function rise(_node: Element, { delay = 0, y = 16 }: { delay?: number; y?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		delay,
		duration: SLOW,
		easing: cubicOut,
		css: (t, u) => `transform: translateY(${(u * y).toFixed(2)}px); opacity: ${t}`
	};
}

export function stagger(index: number): number {
	return Math.min(index, STAGGER_MAX) * STAGGER_STEP;
}

export function pop(_node: Element): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: BASE + 80,
		easing: backOut,
		css: (t) => `transform: scale(${(0.6 + 0.4 * t).toFixed(3)}); opacity: ${Math.min(1, t * 2)}`
	};
}

// sheets, popovers and toasts
export function fadeSlide(_node: Element, { y = 10 }: { y?: number } = {}): TransitionConfig {
	if (reducedMotion()) return { duration: 0 };
	return {
		duration: FAST + 60,
		easing: cubicOut,
		css: (t, u) => `transform: translateY(${(u * y).toFixed(2)}px) scale(${(1 - u * 0.03).toFixed(3)}); opacity: ${t}`
	};
}

// global.css hides [data-reveal] until [data-revealed]; the delay feeds its transition-delay
export function reveal(node: Element, { delay = 0 }: { delay?: number } = {}): { destroy(): void } {
	const el = node as HTMLElement;
	if (reducedMotion() || typeof IntersectionObserver === 'undefined') {
		el.setAttribute('data-revealed', '');
		return { destroy() {} };
	}
	el.style.setProperty('--reveal-delay', `${delay}ms`);
	el.setAttribute('data-reveal', '');
	const observer = new IntersectionObserver(
		(entries) => {
			if (!entries.some((e) => e.isIntersecting)) return;
			el.setAttribute('data-revealed', '');
			observer.disconnect();
		},
		{ rootMargin: '0px 0px -8% 0px' }
	);
	observer.observe(el);
	return { destroy: () => observer.disconnect() };
}

// Svelte only sets inert during an outro; a test locating by role would still find the leaving element
export function hideOnOutro(node: Element): { destroy(): void } {
	const hide = () => node.setAttribute('aria-hidden', 'true');
	const show = () => node.removeAttribute('aria-hidden');
	node.addEventListener('outrostart', hide);
	node.addEventListener('introstart', show);
	return {
		destroy() {
			node.removeEventListener('outrostart', hide);
			node.removeEventListener('introstart', show);
		}
	};
}

export const coverName = (id: number): string => `cover-${id}`;
