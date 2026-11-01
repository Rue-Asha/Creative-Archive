import { error } from '@sveltejs/kit';
import { DOMAINS } from '#lib/domains.ts';
import { LISTS, TYPES } from '#lib/entries/config.ts';
import { fromSearchParams } from '#lib/entries/query.ts';
import { listEntries } from '#lib/server/entries.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const domain = DOMAINS.find((d) => d === params.domain);
	const list = domain && LISTS[domain].find((l) => l.slug === params.list);
	if (!domain || !list) error(404, 'Not found');

	const type = list.query.types[0];
	const fixedStatus = list.query.status !== undefined;
	const { status, view, ...rest } = fromSearchParams(url.searchParams, TYPES[type]);
	const state = { ...rest, ...(fixedStatus || !status ? {} : { status }), ...(view ? { view } : {}) };
	const everything = listEntries(list.query);
	const filtered = Object.keys(rest).length || state.status ? listEntries({ ...list.query, ...rest, ...(state.status ? { status: state.status } : {}) }) : everything;

	const tags = new Map<number, string>();
	for (const entry of everything) for (const tag of entry.tags) tags.set(tag.id, tag.name);
	const collator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

	return {
		world: domain,
		type,
		label: list.label,
		fixedStatus,
		state,
		total: everything.length,
		entries: filtered,
		tags: [...tags].map(([id, name]) => ({ id, name })).sort((a, b) => collator.compare(a.name, b.name))
	};
};
