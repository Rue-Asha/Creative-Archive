import { error } from '@sveltejs/kit';
import { DOMAINS } from '#lib/domains.ts';
import { getHeroes } from '#lib/server/heroes.ts';
import { domainShelves } from '#lib/server/home.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const domain = DOMAINS.find((d) => d === params.domain);
	if (!domain) error(404, 'Not found');
	return { world: domain, hero: getHeroes()[domain] ?? null, shelves: domainShelves(domain) };
};
