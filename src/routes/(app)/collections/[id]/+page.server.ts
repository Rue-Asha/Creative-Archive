import { error, fail, redirect } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { ValidationError } from '#lib/errors.ts';
import { deleteCollection, getCollection, removeFromCollection, renameCollection } from '#lib/server/collections.ts';
import type { Actions, PageServerLoad } from './$types';

function find(id: string) {
	const collection = /^\d+$/.test(id) ? getCollection(Number(id)) : null;
	if (!collection) error(404, 'Collection not found');
	return collection;
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
	delete: ({ params }) => {
		deleteCollection(find(params.id).id);
		redirect(303, '/collections');
	}
};
