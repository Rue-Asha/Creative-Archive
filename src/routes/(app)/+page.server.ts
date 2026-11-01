import { listCollections } from '#lib/server/collections.ts';
import { getHeroes } from '#lib/server/heroes.ts';
import { coverflowEntries, homeShelves } from '#lib/server/home.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	world: 'home' as const,
	hero: getHeroes().home ?? null,
	coverflow: coverflowEntries(),
	shelves: homeShelves(),
	collections: listCollections()
});
