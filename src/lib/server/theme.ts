import { DOMAINS, type World } from '#lib/domains.ts';
import tokens from '#lib/styles/fingerprint/tokens.css?raw';

// The phone's status bar takes the colour at the top of the screen: the page colour on Home, Collections and Settings,
// the world's night on a domain's screens. `theme-color` needs a literal, so it is read out of the vendored tokens and
// never repeated here.
export function themeColors(css = tokens): Record<World, string> {
	const hex = (scope: string, prop: string) => {
		const block = css.match(new RegExp(`${scope.replace(/[[\]"]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
		const value = block.match(new RegExp(`${prop}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1];
		if (!value) throw new Error(`tokens.css has no ${prop} in ${scope}`);
		return value;
	};
	return {
		home: hex(':root', '--surface-page'),
		...(Object.fromEntries(DOMAINS.map((d) => [d, hex(`[data-world="${d}"]`, '--world-night')])) as Record<(typeof DOMAINS)[number], string>)
	};
}
