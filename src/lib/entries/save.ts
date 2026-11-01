import { COPY } from '#lib/copy.ts';
import { TYPES } from '#lib/entries/config.ts';
import { DuplicateError, ImageError, ValidationError } from '#lib/errors.ts';
import { createEntry, ensureArtist, findByExternal, getEntry, updateEntry } from '#lib/server/entries.ts';
import { deleteImage, storeImage, storeImageFromUrl } from '#lib/server/images.ts';
import { atomic } from '#lib/server/tags.ts';
import type { Entry, EntryInput, EntryType, Handles, Id, ProgressKey, SiteKind, Status } from '#lib/types.ts';

export type SaveResult =
	| { id: Id; coverFailed: boolean }
	| { errors: Record<string, string>; existingId?: Id };

const HANDLES = ['instagram', 'tiktok', 'youtube', 'website'] as const;
const WHOLE_NUMBER = 'Enter a whole number';

const text = (form: FormData, key: string): string => {
	const v = form.get(key);
	return typeof v === 'string' ? v : '';
};

function isHttpUrl(value: string): boolean {
	try {
		return ['http:', 'https:'].includes(new URL(value).protocol);
	} catch {
		return false;
	}
}

// The field names are the form's contract with FieldInput.svelte: `details.<key>`, `details.handles.<name>`,
// `kind` and `progress.<key>.total`.
export function entryInputFromForm(
	form: FormData,
	type: EntryType,
	existing: Entry | null
): { input: EntryInput; errors: Record<string, string> } {
	const config = TYPES[type];
	const errors: Record<string, string> = {};
	const title = text(form, 'title');
	if (!title.trim()) errors.title = config.titleLabel === 'Name' ? COPY.nameRequired : COPY.titleRequired;

	const input: EntryInput = { type, title };
	const details: Record<string, unknown> = {};

	for (const def of config.fields) {
		if (def.input === 'handles') {
			const handles: Handles = {};
			for (const name of HANDLES) {
				const value = text(form, `details.handles.${name}`).trim();
				if (!value) continue;
				if (name === 'website' && !isHttpUrl(value)) errors[`details.handles.${name}`] = COPY.invalidUrl;
				handles[name] = value;
			}
			if (Object.keys(handles).length > 0) details.handles = handles;
			continue;
		}
		const name = def.store === 'column' ? def.key : `details.${def.key}`;
		const raw = text(form, name);
		const value = def.input === 'list' ? raw : raw.trim();
		if (!value) continue;
		if (def.input === 'int') {
			if (/^\d+$/.test(value)) details[def.key] = Number(value);
			else errors[name] = WHOLE_NUMBER;
		} else if (def.input === 'url') {
			if (isHttpUrl(value)) details[def.key] = value;
			else errors[name] = COPY.invalidUrl;
		} else if (def.input === 'list') {
			const lines = value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
			if (lines.length > 0) details[def.key] = lines;
		} else if (def.store === 'column') {
			input.kind = value as SiteKind;
		} else if (def.input === 'select') {
			if (def.options?.some((o) => o.value === value)) details[def.key] = value;
		} else {
			details[def.key] = value;
		}
	}
	input.details = details;

	if (config.progress.length > 0) {
		input.progress = {};
		for (const key of config.progress as readonly ProgressKey[]) {
			const name = `progress.${key}.total`;
			const raw = text(form, name).trim();
			if (raw && !/^\d+$/.test(raw)) errors[name] = WHOLE_NUMBER;
			input.progress[key] = { current: existing?.progress[key]?.current ?? 0, total: raw ? Number(raw) : null };
		}
	}

	if (config.status === 'piece' && text(form, 'status')) input.status = text(form, 'status') as Status;

	if (config.artist) {
		const name = text(form, 'artistName').trim();
		const id = /^\d+$/.test(text(form, 'artistId')) ? Number(text(form, 'artistId')) : null;
		const linked = id === null ? null : getEntry(id);
		input.artist = linked?.type === 'artist' ? { id: linked.id, name: linked.title } : name ? { id: null, name } : null;
	}

	// a search pick posts the provider's id; only the type's own provider counts
	if (text(form, 'provider') === config.provider && text(form, 'externalId').trim()) {
		input.provider = config.provider;
		input.externalId = text(form, 'externalId').trim();
	}

	input.tags = form.getAll('tag').filter((t): t is string => typeof t === 'string');
	input.note = text(form, 'note');
	return { input, errors };
}

type Resolved = { imageId?: Id | null; stored?: Id; coverFailed?: boolean } | { error: string };

// An uploaded file replaces the image, "Remove image" clears it, a URL preview's data URL is stored (and
// re-validated) when no file came with it, a search pick's cover URL is downloaded likewise, and none of these keeps what is stored. A cover that cannot be had is not an error: the entry
// is saved without it.
async function resolveImage(form: FormData): Promise<Resolved> {
	const file = form.get('image');
	if (file instanceof File && file.size > 0) {
		try {
			const id = await storeImage(new Uint8Array(await file.arrayBuffer()));
			return { imageId: id, stored: id };
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
			return { error: e.code === 'too-large' ? COPY.imageSize : COPY.imageType };
		}
	}
	const preview = /^data:image\/[a-z+.-]+;base64,([A-Za-z0-9+/=]+)$/.exec(text(form, 'previewImage'));
	if (preview) {
		try {
			const id = await storeImage(new Uint8Array(Buffer.from(preview[1], 'base64')));
			return { imageId: id, stored: id };
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
			return {};
		}
	}
	const cover = text(form, 'coverUrl').trim();
	if (cover) {
		try {
			const id = await storeImageFromUrl(cover);
			return { imageId: id, stored: id };
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
			return { coverFailed: true };
		}
	}
	return text(form, 'removeImage') === '1' ? { imageId: null } : {};
}

async function artistToEnsure(form: FormData, name: string) {
	const externalId = text(form, 'artistExternalId').trim();
	if (!externalId || text(form, 'addArtist') !== '1' || text(form, 'provider') !== 'deezer') return null;
	const pick = { provider: 'deezer' as const, externalId, name, imageId: undefined as Id | undefined };
	const photo = text(form, 'artistImageUrl').trim();
	if (photo && findByExternal('artist', 'deezer', externalId) === null) {
		try {
			pick.imageId = await storeImageFromUrl(photo);
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
		}
	}
	return pick;
}

export async function saveFromForm(form: FormData, existingId?: Id): Promise<SaveResult> {
	const existing = existingId === undefined ? null : getEntry(existingId);
	if (existingId !== undefined && !existing) throw new Error(`No entry ${existingId}`);
	const type = existing ? existing.type : text(form, 'type');
	if (!Object.hasOwn(TYPES, type)) throw new Error(`Unknown type ${type}`);

	const { input, errors } = entryInputFromForm(form, type as EntryType, existing);
	if (Object.keys(errors).length > 0) return { errors };

	const image = await resolveImage(form);
	if ('error' in image) return { errors: { image: image.error } };
	if (image.imageId !== undefined) input.imageId = image.imageId;

	// an album or song picked from Deezer brings its artist along unless "Add artist" was unticked or the user
	// linked an artist by hand
	const artistPick = existing || input.artist?.id !== null ? null : await artistToEnsure(form, input.artist.name);

	try {
		const id = atomic(() => {
			if (existing) {
				updateEntry(existing.id, input);
				return existing.id;
			}
			if (artistPick) {
				const artist = ensureArtist(artistPick);
				input.artist = { id: artist.id, name: input.artist!.name };
				if (!artist.created && artistPick.imageId) deleteImage(artistPick.imageId);
			}
			return createEntry(input);
		});
		return { id, coverFailed: image.coverFailed === true };
	} catch (e) {
		if (image.stored !== undefined) deleteImage(image.stored);
		if (artistPick?.imageId) deleteImage(artistPick.imageId);
		if (e instanceof ValidationError) return { errors: e.fields };
		if (e instanceof DuplicateError) return { errors: {}, existingId: e.existingId };
		throw e;
	}
}
