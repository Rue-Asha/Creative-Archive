import { error, fail, redirect } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { saveFromForm } from '#lib/entries/save.ts';
import { getEntry, listArtists } from '#lib/server/entries.ts';
import { listTags } from '#lib/server/tags.ts';
import type { Entry, EntryInput } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

function entryOf(param: string): Entry {
	const entry = /^\d+$/.test(param) ? getEntry(Number(param)) : null;
	return entry ?? error(404, 'Not found');
}

// what the form opens with: stored fields only, derived ones are the server's to recompute
function valuesOf(entry: Entry): Partial<EntryInput> {
	return {
		type: entry.type,
		title: entry.title,
		status: entry.status ?? undefined,
		kind: entry.kind ?? undefined,
		artist: entry.artistName === null ? null : { id: entry.artistId, name: entry.artistName },
		progress: entry.progress,
		details: entry.details,
		tags: entry.tags.map((t) => t.name),
		note: entry.note,
		imageId: entry.imageId
	};
}

export const load: PageServerLoad = ({ params }) => {
	const entry = entryOf(params.id);
	const config = TYPES[entry.type];
	return {
		world: config.domain,
		id: entry.id,
		type: entry.type,
		heading: entry.title,
		values: valuesOf(entry),
		artists: config.artist ? listArtists() : [],
		tags: listTags()
	};
};

export const actions: Actions = {
	save: async ({ params, request }) => {
		const entry = entryOf(params.id);
		const result = await saveFromForm(await request.formData(), entry.id);
		if ('errors' in result) return fail(400, result);
		redirect(303, `/entries/${result.id}`);
	}
};
