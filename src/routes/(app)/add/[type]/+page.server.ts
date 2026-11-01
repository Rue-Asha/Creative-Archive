import { error, fail, redirect } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { saveFromForm } from '#lib/entries/save.ts';
import { listArtists } from '#lib/server/entries.ts';
import { listTags } from '#lib/server/tags.ts';
import type { EntryType } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

const typeOf = (param: string): EntryType => (Object.hasOwn(TYPES, param) ? (param as EntryType) : error(404, 'Not found'));

export const load: PageServerLoad = ({ params, url }) => {
	const type = typeOf(params.type);
	const config = TYPES[type];
	return {
		world: config.domain,
		type,
		manual: url.searchParams.get('manual') === '1' || (config.provider === null && !config.preview),
		title: url.searchParams.get('title') ?? '',
		artists: config.artist ? listArtists() : [],
		tags: listTags()
	};
};

export const actions: Actions = {
	save: async ({ params, request }) => {
		const type = typeOf(params.type);
		const form = await request.formData();
		form.set('type', type);
		const result = await saveFromForm(form);
		if ('errors' in result) return fail(400, result);
		redirect(303, `/entries/${result.id}${result.coverFailed ? '?coverFailed=1' : ''}`);
	}
};
