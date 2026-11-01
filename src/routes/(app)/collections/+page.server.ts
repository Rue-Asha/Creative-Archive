import { fail } from '@sveltejs/kit';
import { ValidationError } from '#lib/errors.ts';
import { createCollection, listCollections } from '#lib/server/collections.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ world: 'home' as const, collections: listCollections() });

export const actions: Actions = {
	create: async ({ request }) => {
		const form = await request.formData();
		try {
			createCollection(String(form.get('name') ?? ''), String(form.get('description') ?? '').trim());
		} catch (e) {
			if (e instanceof ValidationError) return fail(400, { errors: e.fields });
			throw e;
		}
	}
};
