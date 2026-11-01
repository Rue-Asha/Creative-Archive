import type { World } from '#lib/domains.ts';
import type { accents, fontPairs, Scheme } from './tokens.ts';

export type { Scheme };
export type AccentName = keyof typeof accents;
export type FontName = keyof typeof fontPairs;
export interface WorldChoice {
	scheme: Scheme;
	accent: AccentName;
}

export const CANDIDATES: Record<World, AccentName[]> = {
	home: ['stone', 'inkblue'],
	music: ['ember', 'violet'],
	animanga: ['electric', 'neon'],
	books: ['moss', 'oxblood'],
	fashion: ['noir', 'clay']
};

// Rue's pick (design.md → World pick): every world dark, each with its first candidate.
export const WORLDS: Record<World, WorldChoice> = {
	home: { scheme: 'dark', accent: 'stone' },
	music: { scheme: 'dark', accent: 'ember' },
	animanga: { scheme: 'dark', accent: 'electric' },
	books: { scheme: 'dark', accent: 'moss' },
	fashion: { scheme: 'dark', accent: 'noir' }
};

// One type pairing for the whole app; app.html preloads its files.
export const FONT: FontName = 'a';

export function worldAttrs(
	world: World,
	override: Partial<WorldChoice & { font: FontName }> = {}
): { 'data-scheme': Scheme; 'data-accent': AccentName; 'data-font': FontName } {
	const { scheme, accent, font } = { ...WORLDS[world], font: FONT, ...override };
	return { 'data-scheme': scheme, 'data-accent': accent, 'data-font': font };
}
