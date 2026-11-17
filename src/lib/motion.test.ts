import { readdirSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appear, bezier, glide, reducedMotion, rise, shift } from './motion.ts';

function prefersReduced(reduce: boolean) {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: reduce && query === '(prefers-reduced-motion: reduce)',
		media: query
	}));
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

const files = sourceFiles(srcDir)
	.filter((path) => !path.includes('/styles/fingerprint/'))
	.map((path) => {
		const text = readFileSync(path, 'utf8');
		const styles = path.endsWith('.css') ? [text] : [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
		return { path, name: relative(srcDir, path), text, css: styles.join('\n').replace(/\/\*[\s\S]*?\*\//g, '') };
	});

// movement and entrances animate transform and opacity; colours may change on a state change
const stateColours = ['color', 'background', 'background-color', 'border-color', 'box-shadow', 'fill', 'stroke'];

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

	it('rise and glide move only transform and opacity, and are instant under reduced motion or a keyboard move', () => {
		const node = {} as Element;
		const from = { left: 0, top: 40 } as DOMRect;
		const to = { left: 0, top: 0 } as DOMRect;
		prefersReduced(false);
		const up = rise(node);
		expect(up.duration).toBeGreaterThan(0);
		expect(up.css!(0, 1)).toMatch(/^opacity: 0; transform: translateY\([\d.]+px\) scale\([\d.]+\)$/);
		expect(glide(node, { from, to }).css!(0, 1)).toBe('transform: translate(0px, 40px)');
		expect(glide(node, { from, to }, false).duration).toBe(0);
		expect(glide(node, { from: to, to }).duration).toBe(0);
		prefersReduced(true);
		expect(rise(node).duration).toBe(0);
		expect(glide(node, { from, to }).duration).toBe(0);
	});

	it('appear only fades, shift only translates, and both are still under reduced motion', () => {
		const animate = vi.fn();
		const node = { animate } as unknown as Element;
		prefersReduced(false);
		const fade = appear(node);
		expect(fade.duration).toBeGreaterThan(0);
		expect(fade.css!(0.5, 0.5)).toBe('opacity: 0.5');
		shift(node, 40);
		expect(animate.mock.calls[0][0]).toEqual([{ transform: 'translateY(40px)' }, { transform: 'none' }]);
		shift(node, 0);
		expect(animate).toHaveBeenCalledTimes(1);
		prefersReduced(true);
		expect(appear(node).duration).toBe(0);
		shift(node, 40);
		expect(animate).toHaveBeenCalledTimes(1);
	});

	it('bezier matches the ease-out curve at its ends and rises fast', () => {
		const ease = bezier(0.23, 1, 0.32, 1);
		expect(ease(0)).toBeCloseTo(0, 3);
		expect(ease(1)).toBeCloseTo(1, 3);
		expect(ease(0.25)).toBeGreaterThan(0.6);
	});

	it('styles animate only transform and opacity, colours only on state changes', () => {
		expect(files.length).toBeGreaterThan(10);
		const offenders = files.flatMap((f) =>
			animatedProperties(f.css, f.name).filter((entry) => {
				const prop = entry.split(' ').pop()!;
				if (['transform', 'opacity', 'none'].includes(prop)) return false;
				if (entry.includes('transition') && stateColours.includes(prop)) return false;
				// discrete: a closing popover stays rendered in the top layer while it fades; nothing moves
				if (entry.includes('transition') && ['display', 'overlay'].includes(prop)) return false;
				return true;
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
});
