import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import {
	ACCENT_TOKENS,
	FONT_TOKENS,
	fontPairs,
	accents,
	glassText,
	largePairs,
	SCHEME_TOKENS,
	schemes,
	textPairs,
	type Scheme,
	type SchemeToken
} from './tokens.ts';
import { CANDIDATES, FONT, WORLDS, worldAttrs } from './worlds.ts';

interface Rgba {
	r: number;
	g: number;
	b: number;
	a: number;
}

function parse(value: string): Rgba {
	if (value.startsWith('#')) {
		const n = parseInt(value.slice(1), 16);
		return { r: n >> 16, g: (n >> 8) & 255, b: n & 255, a: 1 };
	}
	const m = value.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
	if (!m) throw new Error(`not a colour: ${value}`);
	return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] };
}

function channel(c: number): number {
	const s = c / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

const luminance = ({ r, g, b }: Rgba) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

function contrast(a: Rgba, b: Rgba): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

function over(top: Rgba, under: Rgba): Rgba {
	const mix = (t: number, u: number) => t * top.a + u * (1 - top.a);
	return { r: mix(top.r, under.r), g: mix(top.g, under.g), b: mix(top.b, under.b), a: 1 };
}

const black = parse('#000000');
const white = parse('#FFFFFF');
const SCHEMES: Scheme[] = ['light', 'dark'];

function colour(scheme: Scheme, accent: keyof typeof accents, name: string): Rgba {
	const set = { ...schemes[scheme], ...accents[accent][scheme] } as Record<string, string>;
	const c = parse(set[name]);
	// translucent fills (washes) sit on the page ground
	return c.a < 1 ? over(c, parse(schemes[scheme].ground)) : c;
}

const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const blocks = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
	selectors: m[1].split(',').map((s) => s.trim()),
	decls: Object.fromEntries(
		[...m[2].matchAll(/--([\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2].replace(/\s+/g, ' ').trim()])
	)
}));
const block = (selector: string) => blocks.find((b) => b.selectors.includes(selector))?.decls;

describe('tokens', () => {
	it('Scenario: Every scheme and accent defines the full token set', () => {
		expect(Object.keys(schemes.light).sort()).toEqual([...SCHEME_TOKENS].sort());
		expect(Object.keys(schemes.dark).sort()).toEqual([...SCHEME_TOKENS].sort());
		expect(Object.keys(accents).length).toBe(10);
		for (const [name, set] of Object.entries(accents))
			for (const scheme of SCHEMES) expect(Object.keys(set[scheme]).sort(), `${name} ${scheme}`).toEqual([...ACCENT_TOKENS].sort());
	});

	it('Scenario: Text contrast meets AA in every world', () => {
		const failing: string[] = [];
		for (const scheme of SCHEMES)
			for (const accent of Object.keys(accents) as (keyof typeof accents)[]) {
				const check = (pairs: readonly (readonly [string, string])[], min: number) => {
					for (const [text, bg] of pairs) {
						const ratio = contrast(colour(scheme, accent, text), colour(scheme, accent, bg));
						if (ratio < min) failing.push(`${scheme}/${accent}: ${text} on ${bg} = ${ratio.toFixed(2)}`);
					}
				};
				check(textPairs, 4.5);
				check(largePairs, 3);
			}
		expect(textPairs.length).toBeGreaterThan(8);
		expect(failing).toEqual([]);
	});

	it('Scenario: Text over photos stays legible', () => {
		for (const scheme of SCHEMES) {
			const s = schemes[scheme];
			for (const photo of [black, white]) {
				for (const fill of ['glass', 'glass-strong'] as const) {
					const ground = over(parse(s[fill]), photo);
					for (const text of glassText)
						expect(contrast(parse(s[text]), ground), `${scheme} ${text} on ${fill}`).toBeGreaterThanOrEqual(4.5);
				}
				expect(contrast(parse(s['on-photo']), over(parse(s['scrim-end']), photo)), `${scheme} scrim`).toBeGreaterThanOrEqual(4.5);
			}
		}
	});

	it('tokens.css declares the same values as tokens.ts', () => {
		const light = block("[data-scheme='light']");
		const dark = block("[data-scheme='dark']");
		expect(block(':root')).toBeDefined();
		for (const name of SCHEME_TOKENS) {
			expect(light?.[name], `light ${name}`).toBe(schemes.light[name as SchemeToken]);
			expect(dark?.[name], `dark ${name}`).toBe(schemes.dark[name as SchemeToken]);
		}
		for (const [name, set] of Object.entries(accents)) {
			for (const token of ACCENT_TOKENS) {
				expect(block(`[data-accent='${name}']`)?.[token], `${name} light ${token}`).toBe(set.light[token]);
				expect(block(`[data-scheme='dark'][data-accent='${name}']`)?.[token], `${name} dark ${token}`).toBe(set.dark[token]);
			}
		}
	});

	it('maps every world to two candidates and a provisional pick among them', () => {
		for (const [world, names] of Object.entries(CANDIDATES)) {
			expect(names, world).toHaveLength(2);
			for (const name of names) expect(accents, world).toHaveProperty(name);
			expect(names, world).toContain(WORLDS[world as keyof typeof WORLDS].accent);
		}
		expect(worldAttrs('music', { scheme: 'dark', accent: 'violet', font: 'c' })).toEqual({
			'data-scheme': 'dark',
			'data-accent': 'violet',
			'data-font': 'c'
		});
		expect(worldAttrs('books')).toEqual({
			'data-scheme': WORLDS.books.scheme,
			'data-accent': WORLDS.books.accent,
			'data-font': FONT
		});
	});

	it('Scenario: Type pairings are token blocks selected by data-font', () => {
		expect(Object.keys(fontPairs).sort()).toEqual(['a', 'b', 'c']);
		for (const [name, set] of Object.entries(fontPairs)) {
			expect(Object.keys(set).sort(), name).toEqual([...FONT_TOKENS].sort());
			for (const token of FONT_TOKENS)
				expect(block(`[data-font='${name}']`)?.[token], `${name} ${token}`).toBe(set[token]);
		}
		expect(blocks.find((b) => b.selectors.includes(`[data-font='${FONT}']`))?.selectors).toContain(':root');
	});

	it('Scenario: Type pairings are token blocks selected by data-font (every family self-hosted with its licence)', () => {
		const global = readFileSync(new URL('./global.css', import.meta.url), 'utf8');
		const faces = [...global.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => ({
			family: m[1].match(/font-family:\s*'([^']+)'/)![1],
			src: m[1].match(/url\('([^']+)'\)/)![1]
		}));
		const families = Object.values(fontPairs).flatMap((p) =>
			[p['font-display'], p['font-text']].map((f) => f.match(/^'([^']+)'/)![1])
		);
		for (const family of families) {
			const own = faces.filter((f) => f.family === family);
			expect(own.length, family).toBeGreaterThan(0);
			for (const f of own) expect(existsSync(new URL(`../../../static${f.src}`, import.meta.url)), f.src).toBe(true);
			expect(existsSync(new URL(`../../../static/fonts/${family.replace(/ /g, '')}-OFL.txt`, import.meta.url)), family).toBe(true);
		}
	});
});
