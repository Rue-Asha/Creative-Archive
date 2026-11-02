import { readdirSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { coverName, fadeSlide, hideOnOutro, holdReveals, pop, reducedMotion, reveal, rise, stagger } from './motion.ts';

function prefersReduced(reduce: boolean) {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: reduce && query === '(prefers-reduced-motion: reduce)',
		media: query
	}));
}

class FakeNode {
	constructor(public top = 100) {}
	attrs = new Map<string, string>();
	listeners = new Map<string, Set<() => void>>();
	style = {
		props: new Map<string, string>(),
		setProperty: (k: string, v: string) => this.style.props.set(k, v),
		removeProperty: (k: string) => this.style.props.delete(k)
	};
	getBoundingClientRect() {
		return { top: this.top, bottom: this.top + 200, left: 0, right: 160 };
	}
	setAttribute(k: string, v: string) {
		this.attrs.set(k, v);
	}
	removeAttribute(k: string) {
		this.attrs.delete(k);
	}
	hasAttribute(k: string) {
		return this.attrs.has(k);
	}
	getAttribute(k: string) {
		return this.attrs.get(k) ?? null;
	}
	addEventListener(type: string, fn: () => void) {
		if (!this.listeners.has(type)) this.listeners.set(type, new Set());
		this.listeners.get(type)!.add(fn);
	}
	removeEventListener(type: string, fn: () => void) {
		this.listeners.get(type)?.delete(fn);
	}
	dispatch(type: string) {
		for (const fn of this.listeners.get(type) ?? []) fn();
	}
}

type Entry = { isIntersecting: boolean; target: unknown };
let observers: { cb: (entries: Entry[]) => void; targets: unknown[]; disconnected: boolean }[] = [];

function stubObserver() {
	observers = [];
	vi.stubGlobal(
		'IntersectionObserver',
		class {
			record: (typeof observers)[number];
			constructor(cb: (entries: Entry[]) => void) {
				this.record = { cb, targets: [], disconnected: false };
				observers.push(this.record);
			}
			observe(t: unknown) {
				this.record.targets.push(t);
			}
			unobserve() {}
			disconnect() {
				this.record.disconnected = true;
			}
		}
	);
}

function properties(css: string): string[] {
	return css
		.split(';')
		.map((d) => d.split(':')[0].trim())
		.filter(Boolean);
}

const srcDir = fileURLToPath(new URL('..', import.meta.url));
const stylesDir = fileURLToPath(new URL('./styles/', import.meta.url));

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const path = `${dir}${e.name}`;
		if (e.isDirectory()) return sourceFiles(`${path}/`);
		return /\.(svelte|css)$/.test(e.name) ? [path] : [];
	});
}

const files = sourceFiles(srcDir).map((path) => {
	const text = readFileSync(path, 'utf8');
	const styles = path.endsWith('.css') ? [text] : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
	return { path, name: relative(srcDir, path), text, css: styles.join('\n').replace(/\/\*[\s\S]*?\*\//g, '') };
});

// movement and entrances animate transform and opacity; colours may change on a state change
const stateColours = ['color', 'background', 'background-color', 'border-color', 'box-shadow', 'fill', 'stroke'];
// the pill nav's highlight is one absolutely placed element that glides to the active item
const inlineSizeExceptions = ['lib/ui/PillNav.svelte'];

function topLevel(list: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let cur = '';
	for (const ch of list) {
		if (ch === '(') depth++;
		if (ch === ')') depth--;
		if (ch === ',' && depth === 0) {
			out.push(cur.trim());
			cur = '';
		} else cur += ch;
	}
	return [...out, cur.trim()].filter(Boolean);
}

function animatedProperties(css: string, name: string): string[] {
	const found: string[] = [];
	for (const m of css.matchAll(/(?<![-\w])transition(?:-property)?\s*:\s*([^;}]+)/g))
		for (const part of topLevel(m[1])) found.push(`${name}: transition ${part.split(/\s+/)[0]}`);
	for (const m of css.matchAll(/@keyframes\s+[-\w]+\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g))
		for (const decl of m[1].matchAll(/\{([^{}]*)\}/g))
			for (const d of decl[1].split(';')) {
				const prop = d.split(':')[0].trim();
				if (prop && prop !== 'animation-timing-function') found.push(`${name}: keyframes ${prop}`);
			}
	return found;
}

const node = {} as Element;
const primitives = {
	rise: () => rise(node, { delay: 80, y: 20 }),
	pop: () => pop(node),
	fadeSlide: () => fadeSlide(node, { y: 12 })
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('motion', () => {
	it('reducedMotion follows the media query and is false without matchMedia', () => {
		prefersReduced(true);
		expect(reducedMotion()).toBe(true);
		prefersReduced(false);
		expect(reducedMotion()).toBe(false);
		vi.stubGlobal('matchMedia', undefined);
		expect(reducedMotion()).toBe(false);
	});

	it('reduced motion gives zero-duration transitions', () => {
		prefersReduced(true);
		for (const [name, make] of Object.entries(primitives)) {
			const config = make();
			expect(config.duration ?? 0, name).toBe(0);
			expect(config.delay ?? 0, name).toBe(0);
		}
	});

	it('transitions animate only transform and opacity', () => {
		prefersReduced(false);
		for (const [name, make] of Object.entries(primitives)) {
			const config = make();
			expect(config.duration, name).toBeGreaterThan(0);
			for (const p of properties(config.css!(0.5, 0.5))) expect(['transform', 'opacity'], name).toContain(p);
		}
	});

	it('styles animate only transform and opacity, colours only on state changes', () => {
		expect(files.length).toBeGreaterThan(10);
		const offenders = files.flatMap((f) =>
			animatedProperties(f.css, f.name).filter((entry) => {
				const prop = entry.split(' ').pop()!;
				if (['transform', 'opacity', 'none'].includes(prop)) return false;
				if (entry.includes('transition') && stateColours.includes(prop)) return false;
				return !(prop === 'inline-size' && inlineSizeExceptions.includes(f.name));
			})
		);
		expect(offenders).toEqual([]);
		expect(files.flatMap((f) => (/transition\s*:\s*all\b/.test(f.css) ? [f.name] : []))).toEqual([]);
	});

	it('components use no raw colour', () => {
		const raw = files
			.filter((f) => !f.path.startsWith(stylesDir))
			.flatMap((f) => [...f.css.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g)].map((m) => `${f.name}: ${m[0]}`));
		expect(raw).toEqual([]);
	});

	it('stagger spaces entrances 40 ms apart and caps at 12', () => {
		expect([0, 1, 2, 3].map(stagger)).toEqual([0, 40, 80, 120]);
		expect(stagger(100)).toBe(stagger(12));
		expect(stagger(12)).toBe(480);
	});

	it('reveal marks the node once it intersects', () => {
		prefersReduced(false);
		stubObserver();
		const el = new FakeNode();
		const action = reveal(el as unknown as Element, { delay: 120 });

		expect(el.hasAttribute('data-reveal')).toBe(true);
		expect(el.hasAttribute('data-revealed')).toBe(false);
		expect(el.style.props.get('--reveal-delay')).toBe('120ms');
		observers[0].cb([{ isIntersecting: false, target: el }]);
		expect(el.hasAttribute('data-revealed')).toBe(false);
		observers[0].cb([{ isIntersecting: true, target: el }]);
		expect(el.hasAttribute('data-revealed')).toBe(true);
		expect(observers[0].disconnected).toBe(true);
		action.destroy();
	});

	it('Scenario: Reveal shows in-view nodes at once on history back', () => {
		prefersReduced(false);
		stubObserver();
		vi.stubGlobal('innerHeight', 800);
		vi.stubGlobal('innerWidth', 390);
		const frames: (() => void)[] = [];
		vi.stubGlobal('requestAnimationFrame', (fn: () => void) => frames.push(fn));
		const shown = new FakeNode(100);
		const below = new FakeNode(1400);
		const release = holdReveals();
		reveal(shown as unknown as Element);
		reveal(below as unknown as Element);
		release();

		expect(shown.hasAttribute('data-revealed')).toBe(true);
		expect(shown.style.props.get('transition')).toBe('none');
		expect(below.hasAttribute('data-reveal')).toBe(true);
		expect(below.hasAttribute('data-revealed')).toBe(false);
		expect(observers.flatMap((o) => o.targets)).toEqual([below]);
		while (frames.length) frames.shift()!();
		expect(shown.style.props.has('transition')).toBe(false);
		observers[0].cb([{ isIntersecting: true, target: below }]);
		expect(below.hasAttribute('data-revealed')).toBe(true);
	});

	it('Scenario: Reveal runs as before on other navigations', () => {
		prefersReduced(false);
		stubObserver();
		vi.stubGlobal('innerHeight', 800);
		vi.stubGlobal('innerWidth', 390);
		const el = new FakeNode(100);
		reveal(el as unknown as Element);

		expect(el.hasAttribute('data-reveal')).toBe(true);
		expect(el.hasAttribute('data-revealed')).toBe(false);
		expect(observers.flatMap((o) => o.targets)).toEqual([el]);
		observers[0].cb([{ isIntersecting: true, target: el }]);
		expect(el.hasAttribute('data-revealed')).toBe(true);
	});

	it('a node gone before the hold is released is left alone', () => {
		prefersReduced(false);
		stubObserver();
		vi.stubGlobal('innerHeight', 800);
		vi.stubGlobal('innerWidth', 390);
		vi.stubGlobal('requestAnimationFrame', () => 0);
		const el = new FakeNode(1400);
		const release = holdReveals();
		reveal(el as unknown as Element).destroy();
		release();

		expect(observers).toHaveLength(0);
		expect(el.hasAttribute('data-revealed')).toBe(false);
	});

	it('reduced motion reveals at once without observing', () => {
		prefersReduced(true);
		stubObserver();
		const el = new FakeNode();
		reveal(el as unknown as Element).destroy();

		expect(el.hasAttribute('data-revealed')).toBe(true);
		expect(observers).toHaveLength(0);
	});

	it('hideOnOutro toggles aria-hidden with the outro and intro', () => {
		const el = new FakeNode();
		const action = hideOnOutro(el as unknown as Element);

		el.dispatch('outrostart');
		expect(el.getAttribute('aria-hidden')).toBe('true');
		el.dispatch('introstart');
		expect(el.hasAttribute('aria-hidden')).toBe(false);
		action.destroy();
		el.dispatch('outrostart');
		expect(el.hasAttribute('aria-hidden')).toBe(false);
	});

	it('coverName names the shared cover element', () => {
		expect(coverName(7)).toBe('cover-7');
	});
});
