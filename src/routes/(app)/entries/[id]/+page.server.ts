import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { TYPES } from '#lib/entries/config.ts';
import { ValidationError } from '#lib/errors.ts';
import { listHref } from '#lib/entries/derive.ts';
import { addToCollection, collectionsOf, createCollection, listCollections, removeFromCollection } from '#lib/server/collections.ts';
import { artistWorks, deleteEntry, getEntry } from '#lib/server/entries.ts';
import { setProgress, setRating, setStatus, stepProgress } from '#lib/server/tracking.ts';
import type { Entry, Id, ProgressKey, Status } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

function find(id: string): Entry {
	const entry = /^\d+$/.test(id) ? getEntry(Number(id)) : null;
	if (!entry) error(404, 'Entry not found');
	return entry;
}

// every action: find the entry, run one write, map a ValidationError to a 400 with its field messages
async function run(event: RequestEvent, write: (id: Id, form: FormData, entry: Entry) => void) {
	const entry = find(event.params.id!);
	try {
		write(entry.id, await event.request.formData(), entry);
	} catch (e) {
		if (e instanceof ValidationError) return fail(400, { errors: e.fields });
		throw e;
	}
}

export const load: PageServerLoad = ({ params }) => {
	const entry = find(params.id);
	return {
		world: TYPES[entry.type].domain,
		entry,
		works: entry.type === 'artist' ? artistWorks(entry.id) : [],
		collections: listCollections().map(({ id, name }) => ({ id, name })),
		memberOf: collectionsOf(entry.id)
	};
};

export const actions: Actions = {
	delete: ({ params }) => {
		const entry = find(params.id);
		deleteEntry(entry.id);
		redirect(303, listHref(entry.type));
	},
	status: (event) => run(event, (id, form) => void setStatus(id, String(form.get('status')) as Status)),
	rating: (event) =>
		run(event, (id, form) => {
			const rating = String(form.get('rating'));
			setRating(id, rating === '' ? null : Number(rating));
		}),
	progress: (event) =>
		run(event, (id, form) => {
			const key = String(form.get('key')) as ProgressKey;
			if (form.has('delta')) stepProgress(id, key, Number(form.get('delta')) < 0 ? -1 : 1);
			else {
				const value = String(form.get('value')).trim();
				setProgress(id, key, value === '' ? NaN : Number(value));
			}
		}),
	collect: (event) => run(event, (id, form) => addToCollection(Number(form.get('collectionId')), id)),
	uncollect: (event) => run(event, (id, form) => removeFromCollection(Number(form.get('collectionId')), id)),
	newCollection: (event) => run(event, (id, form) => addToCollection(createCollection(String(form.get('name') ?? '')), id))
};
