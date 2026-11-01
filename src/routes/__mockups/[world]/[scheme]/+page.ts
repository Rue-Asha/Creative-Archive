import { error } from '@sveltejs/kit';
import { WORLD_NAMES, type World } from '#lib/domains.ts';
import { fontPairs } from '#lib/styles/tokens.ts';
import { CANDIDATES, FONT, type AccentName, type FontName, type Scheme } from '#lib/styles/worlds.ts';
import type { PageLoad } from './$types';

// ?accent= takes a candidate's name, or a / b for the first / second candidate; ?font= picks a type pairing
export const load: PageLoad = ({ params, url }) => {
	if (!(WORLD_NAMES as readonly string[]).includes(params.world)) error(404, 'Not found');
	if (params.scheme !== 'light' && params.scheme !== 'dark') error(404, 'Not found');
	const world = params.world as World;
	const candidates = CANDIDATES[world];
	const asked = url.searchParams.get('accent') ?? 'a';
	const accent: AccentName | undefined =
		asked === 'a' ? candidates[0] : asked === 'b' ? candidates[1] : candidates.find((c) => c === asked);
	if (!accent) error(404, 'Not found');
	const font = url.searchParams.get('font') ?? FONT;
	if (!(font in fontPairs)) error(404, 'Not found');
	return { world, scheme: params.scheme as Scheme, accent, font: font as FontName };
};
