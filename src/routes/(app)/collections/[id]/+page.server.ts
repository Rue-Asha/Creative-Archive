import { error, fail, redirect } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { ValidationError } from '#lib/errors.ts';
import { deleteCollection, getCollection, removeFromCollection, removeManyFromCollection, renameCollection, reorderCollection } from '#lib/server/collections.ts';
import type { Actions, PageServerLoad } from './$types';

function find(id: string) {
	const collection = /^\d+$/.test(id) ? getCollection(Number(id)) : null;
	if (!collection) error(404, 'Collection not found');
	return collection;
}

function parseIds(raw: string): number[] | null {
	if (raw === '') return [];
	const parts = raw.split(',');
	return parts.every((p) => /^\d+$/.test(p)) ? parts.map(Number) : null;
}

export const load: PageServerLoad = ({ params }) => {
	const collection = find(params.id);
	return { world: 'home' as const, collection, typeLabels: Object.fromEntries(collection.entries.map((e) => [e.id, TYPES[e.type].label])) };
};

export const actions: Actions = {
	rename: async ({ params, request }) => {
		const collection = find(params.id);
		const form = await request.formData();
		try {
			renameCollection(collection.id, String(form.get('name') ?? ''), String(form.get('description') ?? '').trim());
		} catch (e) {
			if (e instanceof ValidationError) return fail(400, { errors: e.fields });
			throw e;
		}
	},
	remove: async ({ params, request }) => {
		const collection = find(params.id);
		const entryId = Number((await request.formData()).get('entryId'));
		removeFromCollection(collection.id, entryId);
	},
	reorder: async ({ params, request }) => {
		const collection = find(params.id);
		const ids = parseIds(String((await request.formData()).get('ids') ?? ''));
		if (!ids || new Set(ids).size !== ids.length) return fail(400, { errors: { ids: 'Order must list each entry once' } as Record<string, string> });
		try {
			reorderCollection(collection.id, ids);
		} catch (e) {
			if (e instanceof ValidationError) return fail(409, { errors: e.fields });
			throw e;
		}
	},
	removeMany: async ({ params, request }) => {
		const collection = find(params.id);
		const ids = parseIds(String((await request.formData()).get('ids') ?? ''));
		if (!ids) return fail(400, { errors: { ids: 'Ids must be numbers' } as Record<string, string> });
		try {
			return { removed: removeManyFromCollection(collection.id, ids) };
		} catch (e) {
			if (e instanceof ValidationError) return fail(400, { errors: e.fields });
			throw e;
		}
	},
	delete: ({ params }) => {
		deleteCollection(find(params.id).id);
		redirect(303, '/collections');
	}
};
