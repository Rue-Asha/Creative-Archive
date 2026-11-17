import { error, fail, redirect } from '@sveltejs/kit';
import { DOMAINS } from '#lib/domains.ts';
import { LISTS, RETIRED_LISTS, TYPES } from '#lib/entries/config.ts';
import { fromSearchParams } from '#lib/entries/query.ts';
import { ValidationError } from '#lib/errors.ts';
import { bulkSetStatus, bulkTag } from '#lib/server/bulk.ts';
import type { Status } from '#lib/types.ts';
import { listEntries } from '#lib/server/entries.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url }) => {
	const domain = DOMAINS.find((d) => d === params.domain);
	const retired = RETIRED_LISTS[`${params.domain}/${params.list}`];
	if (retired) {
		const query = new URLSearchParams(url.searchParams);
		if (retired.kind) query.set('kind', retired.kind);
		const search = query.size ? `?${query}` : '';
		redirect(308, `/${params.domain}/${retired.to}${search}`);
	}
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

function parseIds(raw: string): number[] | null {
	if (raw === '') return [];
	const parts = raw.split(',');
	return parts.every((p) => /^\d+$/.test(p)) ? parts.map(Number) : null;
}

function bulk(run: (ids: number[], form: FormData) => number) {
	return async ({ request }: { request: Request }) => {
		const form = await request.formData();
		const ids = parseIds(String(form.get('ids') ?? ''));
		if (!ids) return fail(400, { errors: { ids: 'Ids must be numbers' } });
		try {
			return { updated: run(ids, form) };
		} catch (e) {
			if (e instanceof ValidationError) return fail(400, { errors: e.fields });
			throw e;
		}
	};
}

export const actions: Actions = {
	bulkStatus: bulk((ids, form) => bulkSetStatus(ids, String(form.get('status') ?? '') as Status)),
	bulkTag: bulk((ids, form) => {
		const op = form.get('op');
		if (op !== 'add' && op !== 'remove') throw new ValidationError({ op: 'Op must be add or remove' });
		return bulkTag(ids, String(form.get('tag') ?? ''), op);
	})
};
