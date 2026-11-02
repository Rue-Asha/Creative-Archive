// Mirror of the scheme and accent blocks in tokens.css; tokens.test.ts checks that both agree and that every
// pair below meets AA.

export type Scheme = 'light' | 'dark';

export const SCHEME_TOKENS = [
	'ground',
	'surface',
	'surface-2',
	'line',
	'ink',
	'ink-2',
	'muted',
	'solid',
	'on-solid',
	'on-photo',
	'error',
	'glass',
	'glass-strong',
	'glass-thin',
	'glass-border',
	'glass-filter',
	'glass-rim',
	'glass-sheen',
	'ambient',
	'scrim',
	'scrim-end',
	'shadow-card',
	'shadow-float',
	'focus-ring'
] as const;
export type SchemeToken = (typeof SCHEME_TOKENS)[number];

export const FONT_TOKENS = [
	'font-display',
	'font-text',
	'display-weight',
	'display-tracking',
	'display-leading',
	'display-scale',
	'accent-style',
	'accent-weight'
] as const;
export type FontToken = (typeof FONT_TOKENS)[number];

// Three type pairings offered at the ⏸ world pick, selected by data-font; display-scale evens out their widths.
export const fontPairs = {
	a: {
		'font-display': "'Bricolage Grotesque', system-ui, sans-serif",
		'font-text': "'Figtree', system-ui, sans-serif",
		'display-weight': '500',
		'display-tracking': '-0.045em',
		'display-leading': '0.92',
		'display-scale': '1',
		'accent-style': 'normal',
		'accent-weight': '300'
	},
	b: {
		'font-display': "'Syne', system-ui, sans-serif",
		'font-text': "'Manrope', system-ui, sans-serif",
		'display-weight': '600',
		'display-tracking': '-0.035em',
		'display-leading': '0.96',
		'display-scale': '0.86',
		'accent-style': 'normal',
		'accent-weight': '400'
	},
	c: {
		'font-display': "'Bodoni Moda', 'Didot', serif",
		'font-text': "'Hanken Grotesk', system-ui, sans-serif",
		'display-weight': '400',
		'display-tracking': '-0.025em',
		'display-leading': '0.98',
		'display-scale': '1',
		'accent-style': 'italic',
		'accent-weight': '400'
	}
} as const satisfies Record<string, Record<FontToken, string>>;

export const fontLabels: Record<keyof typeof fontPairs, string> = {
	a: 'Bricolage Grotesque + Figtree',
	b: 'Syne + Manrope',
	c: 'Bodoni Moda + Hanken Grotesk'
};

export const ACCENT_TOKENS = ['accent', 'accent-ink', 'accent-soft', 'accent-wash', 'accent-glow'] as const;
export type AccentToken = (typeof ACCENT_TOKENS)[number];
type AccentSet = Record<AccentToken, string>;

// Dark is the base (Rue, ⏸ round 1); light is kept for comparison. Glass is matte "liquid glass": a frosted tinted
// fill with grain (--grain), a soft inner rim light and an edge sheen (global.css .liquid).
export const schemes: Record<Scheme, Record<SchemeToken, string>> = {
	dark: {
		ground: '#0D0D10',
		surface: '#17171B',
		'surface-2': '#222227',
		line: '#2F2F36',
		ink: '#F3F1EC',
		'ink-2': '#B4B1AB',
		muted: '#6A6862',
		solid: '#F3F1EC',
		'on-solid': '#121214',
		'on-photo': '#FFFFFF',
		error: '#FF8A7A',
		glass: 'rgb(34 34 40 / 0.68)',
		'glass-strong': 'rgb(28 28 33 / 0.82)',
		'glass-thin': 'rgb(255 255 255 / 0.06)',
		'glass-border': 'rgb(255 255 255 / 0.09)',
		'glass-filter': 'blur(28px) saturate(1.7) brightness(0.92)',
		'glass-rim': 'inset 0 1px 0 rgb(255 255 255 / 0.14), inset 0 -1px 0 rgb(0 0 0 / 0.3), inset 0 0 24px rgb(255 255 255 / 0.03)',
		'glass-sheen': 'linear-gradient(140deg, rgb(255 255 255 / 0.28), rgb(255 255 255 / 0.02) 34%, rgb(255 255 255 / 0) 60%, rgb(255 255 255 / 0.12))',
		ambient: 'radial-gradient(70% 55% at 0% 0% in oklab, color-mix(in oklab, var(--accent-glow) 100%, transparent) 0%, color-mix(in oklab, var(--accent-glow) 94%, transparent) 12%, color-mix(in oklab, var(--accent-glow) 80%, transparent) 26%, color-mix(in oklab, var(--accent-glow) 58%, transparent) 42%, color-mix(in oklab, var(--accent-glow) 36%, transparent) 58%, color-mix(in oklab, var(--accent-glow) 18%, transparent) 72%, color-mix(in oklab, var(--accent-glow) 6%, transparent) 86%, color-mix(in oklab, var(--accent-glow) 1%, transparent) 95%, transparent), radial-gradient(60% 50% at 100% 45% in oklab, color-mix(in oklab, var(--accent-wash) 100%, transparent) 0%, color-mix(in oklab, var(--accent-wash) 94%, transparent) 12%, color-mix(in oklab, var(--accent-wash) 80%, transparent) 26%, color-mix(in oklab, var(--accent-wash) 58%, transparent) 42%, color-mix(in oklab, var(--accent-wash) 36%, transparent) 58%, color-mix(in oklab, var(--accent-wash) 18%, transparent) 72%, color-mix(in oklab, var(--accent-wash) 6%, transparent) 86%, color-mix(in oklab, var(--accent-wash) 1%, transparent) 95%, transparent)',
		scrim: 'linear-gradient(180deg, rgb(0 0 0 / 0) 32%, rgb(0 0 0 / 0.42) 58%, var(--scrim-end) 100%)',
		'scrim-end': 'rgb(0 0 0 / 0.72)',
		'shadow-card': '0 1px 2px rgb(0 0 0 / 0.4), 0 18px 40px -20px rgb(0 0 0 / 0.75)',
		'shadow-float': '0 30px 60px -24px rgb(0 0 0 / 0.85)',
		'focus-ring': '0 0 0 2px var(--ground), 0 0 0 4px var(--ink)'
	},
	light: {
		ground: '#ECEAE6',
		surface: '#F6F5F2',
		'surface-2': '#E1DED8',
		line: '#D2CEC6',
		ink: '#1C1B19',
		'ink-2': '#56524C',
		muted: '#9A958D',
		solid: '#1C1B19',
		'on-solid': '#F6F5F2',
		'on-photo': '#FFFFFF',
		error: '#B3261E',
		glass: 'rgb(248 247 244 / 0.62)',
		'glass-strong': 'rgb(248 247 244 / 0.8)',
		'glass-thin': 'rgb(255 255 255 / 0.3)',
		'glass-border': 'rgb(255 255 255 / 0.55)',
		'glass-filter': 'blur(28px) saturate(1.5)',
		'glass-rim': 'inset 0 1px 0 rgb(255 255 255 / 0.8), inset 0 -1px 0 rgb(28 27 25 / 0.06)',
		'glass-sheen': 'linear-gradient(140deg, rgb(255 255 255 / 0.9), rgb(255 255 255 / 0.1) 34%, rgb(255 255 255 / 0) 60%, rgb(255 255 255 / 0.5))',
		ambient: 'radial-gradient(70% 55% at 0% 0% in oklab, color-mix(in oklab, var(--accent-glow) 100%, transparent) 0%, color-mix(in oklab, var(--accent-glow) 94%, transparent) 12%, color-mix(in oklab, var(--accent-glow) 80%, transparent) 26%, color-mix(in oklab, var(--accent-glow) 58%, transparent) 42%, color-mix(in oklab, var(--accent-glow) 36%, transparent) 58%, color-mix(in oklab, var(--accent-glow) 18%, transparent) 72%, color-mix(in oklab, var(--accent-glow) 6%, transparent) 86%, color-mix(in oklab, var(--accent-glow) 1%, transparent) 95%, transparent), radial-gradient(60% 50% at 100% 45% in oklab, color-mix(in oklab, var(--accent-wash) 100%, transparent) 0%, color-mix(in oklab, var(--accent-wash) 94%, transparent) 12%, color-mix(in oklab, var(--accent-wash) 80%, transparent) 26%, color-mix(in oklab, var(--accent-wash) 58%, transparent) 42%, color-mix(in oklab, var(--accent-wash) 36%, transparent) 58%, color-mix(in oklab, var(--accent-wash) 18%, transparent) 72%, color-mix(in oklab, var(--accent-wash) 6%, transparent) 86%, color-mix(in oklab, var(--accent-wash) 1%, transparent) 95%, transparent)',
		scrim: 'linear-gradient(180deg, rgb(14 13 12 / 0) 32%, rgb(14 13 12 / 0.42) 58%, var(--scrim-end) 100%)',
		'scrim-end': 'rgb(14 13 12 / 0.7)',
		'shadow-card': '0 1px 2px rgb(28 27 25 / 0.06), 0 14px 32px -18px rgb(28 27 25 / 0.3)',
		'shadow-float': '0 24px 48px -22px rgb(28 27 25 / 0.34)',
		'focus-ring': '0 0 0 2px var(--ground), 0 0 0 4px var(--ink)'
	}
};

// Two candidates per world, offered at the ⏸ world pick. Dark values are lifted tints with dark text on them;
// accent-glow feeds the ambient light behind heroes, shelves and the page.
const accent = (
	light: [string, string, string, string],
	dark: [string, string, string, string]
): Record<Scheme, AccentSet> => {
	const set = ([a, ink, soft, rgb]: [string, string, string, string], wash: number, glow: number) => ({
		accent: a,
		'accent-ink': ink,
		'accent-soft': soft,
		'accent-wash': `rgb(${rgb} / ${wash})`,
		'accent-glow': `rgb(${rgb} / ${glow})`
	});
	return { light: set(light, 0.1, 0.18), dark: set(dark, 0.12, 0.26) };
};

export const accents = {
	stone: accent(['#7A6A5B', '#FFFFFF', '#E2D9CD', '122 106 91'], ['#C9B8A4', '#141414', '#2E2924', '201 184 164']),
	inkblue: accent(['#3E4C6B', '#FFFFFF', '#DADFE9', '62 76 107'], ['#9EB0DA', '#111111', '#21283A', '158 176 218']),
	ember: accent(['#C2502E', '#FFFFFF', '#F3DCD2', '194 80 46'], ['#F27D58', '#141414', '#3A221A', '242 125 88']),
	violet: accent(['#6D4BC3', '#FFFFFF', '#E4DDF4', '109 75 195'], ['#AD93F4', '#111111', '#2A2340', '173 147 244']),
	electric: accent(['#2A5FEA', '#FFFFFF', '#DCE5FB', '42 95 234'], ['#729EFF', '#0E0E0E', '#1C2541', '114 158 255']),
	neon: accent(['#0E7C86', '#FFFFFF', '#D4EEEF', '14 124 134'], ['#4FD8D3', '#0E0E0E', '#15302F', '79 216 211']),
	moss: accent(['#4F6B3A', '#FFFFFF', '#DFE5D4', '79 107 58'], ['#A6C487', '#111111', '#232B1C', '166 196 135']),
	oxblood: accent(['#7A2E2E', '#FFFFFF', '#EED8D5', '122 46 46'], ['#DE8A80', '#111111', '#361E1C', '222 138 128']),
	noir: accent(['#1C1C1C', '#F2EDE4', '#E2DCD2', '28 28 28'], ['#EDE6DA', '#141414', '#2B2926', '237 230 218']),
	clay: accent(['#A35A3D', '#FFFFFF', '#F1DFD5', '163 90 61'], ['#E3A07F', '#141414', '#3A2920', '227 160 127'])
} as const satisfies Record<string, Record<Scheme, AccentSet>>;

// Glass carries ink only: secondary ink is not legible on glass over a bright photo.
export const glassText: readonly SchemeToken[] = ['ink'];

type Token = SchemeToken | AccentToken;

// Every text / background pair the components use at body size. Muted is decoration only (rules, disabled icons).
export const textPairs: readonly (readonly [text: Token, background: Token])[] = [
	['ink', 'ground'],
	['ink', 'surface'],
	['ink', 'surface-2'],
	['ink-2', 'ground'],
	['ink-2', 'surface'],
	['ink-2', 'surface-2'],
	['on-solid', 'solid'],
	['accent-ink', 'accent'],
	['ink', 'accent-soft'],
	['ink-2', 'accent-soft'],
	['ink', 'accent-wash']
];

// Accent as text appears only in display sizes (the italic accent word, placeholder initials, star fills).
export const largePairs: readonly (readonly [text: Token, background: Token])[] = [
	['accent', 'ground'],
	['accent', 'surface'],
	['accent', 'accent-wash'],
	['accent', 'accent-soft']
];
