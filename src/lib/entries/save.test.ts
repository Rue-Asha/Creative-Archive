import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb, closeDb } from '#lib/server/db.ts';
import { createEntry, getEntry } from '#lib/server/entries.ts';
import { insertEntryRow, testImage, useTestDb } from '#lib/server/testing.ts';
import { entryInputFromForm, saveFromForm } from './save.ts';

beforeEach(useTestDb);

afterEach(() => {
	vi.unstubAllEnvs();
	closeDb();
	delete process.env.DATABASE_PATH;
});

type Field = [string, string | Blob];

function formOf(...fields: Field[]): FormData {
	const form = new FormData();
	for (const [k, v] of fields) form.append(k, v);
	return form;
}

function count(table: string): number {
	return Number(getDb().prepare(`SELECT count(*) AS n FROM ${table}`).get()?.n);
}

describe('entryInputFromForm', () => {
	it('maps an album form to an EntryInput', () => {
		const { input, errors } = entryInputFromForm(
			formOf(
				['title', '  Ctrl '],
				['details.year', '2017'],
				['details.recordType', 'ep'],
				['details.trackCount', '7'],
				['artistName', 'SZA'],
				['artistId', ''],
				['tag', 'rnb'],
				['tag', ''],
				['note', 'late night']
			),
			'album',
			null
		);

		expect(errors).toEqual({});
		expect(input).toEqual({
			type: 'album',
			title: '  Ctrl ',
			details: { year: 2017, recordType: 'ep', trackCount: 7 },
			artist: { id: null, name: 'SZA' },
			tags: ['rnb', ''],
			note: 'late night'
		});
	});

	it('names the missing title per type', () => {
		expect(entryInputFromForm(formOf(['title', '  ']), 'book', null).errors).toEqual({ title: 'Title is required' });
		expect(entryInputFromForm(formOf(['title', '']), 'brand', null).errors).toEqual({ title: 'Name is required' });
	});

	it('leaves blank optional fields out and rejects what is not a whole number or an http(s) URL', () => {
		const ok = entryInputFromForm(formOf(['title', 'Coat'], ['details.brand', ''], ['details.price', ' 90 EUR ']), 'piece', null);
		expect(ok.input.details).toEqual({ price: '90 EUR' });

		const bad = entryInputFromForm(
			formOf(['title', 'Coat'], ['details.url', 'javascript:alert(1)'], ['details.price', '90']),
			'piece',
			null
		);
		expect(bad.errors).toEqual({ 'details.url': 'Enter a valid http or https URL' });

		const year = entryInputFromForm(formOf(['title', 'x'], ['details.year', '19x8']), 'anime', null);
		expect(year.errors).toEqual({ 'details.year': 'Enter a whole number' });
	});

	it('reads progress totals, blank meaning unknown, and keeps the stored current value', () => {
		const stored = getEntry(
			createEntry({
				type: 'manga',
				title: 'Vagabond',
				progress: { chapters: { current: 12, total: null }, volumes: { current: 2, total: 37 } }
			})
		)!;
		const { input } = entryInputFromForm(
			formOf(['title', 'Vagabond'], ['progress.chapters.total', ''], ['progress.volumes.total', '40']),
			'manga',
			stored
		);

		expect(input.progress).toEqual({
			chapters: { current: 12, total: null },
			volumes: { current: 2, total: 40 }
		});
		expect(
			entryInputFromForm(formOf(['title', 'Frieren'], ['progress.episodes.total', '28']), 'anime', null).input.progress
		).toEqual({ episodes: { current: 0, total: 28 } });
	});

	it('reads handles, authors per line and the kind', () => {
		const influencer = entryInputFromForm(
			formOf(['title', 'Someone'], ['details.handles.instagram', ' someone '], ['details.handles.tiktok', '']),
			'influencer',
			null
		);
		expect(influencer.input.details).toEqual({ handles: { instagram: 'someone' } });

		const book = entryInputFromForm(formOf(['title', 'Good Omens'], ['details.authors', 'Terry Pratchett\r\n\n Neil Gaiman ']), 'book', null);
		expect(book.input.details).toEqual({ authors: ['Terry Pratchett', 'Neil Gaiman'] });

		const site = entryInputFromForm(formOf(['title', 'Zalando'], ['kind', 'shop']), 'brand', null);
		expect(site.input.kind).toBe('shop');
	});

	it('links a chosen artist by its stored title and treats an unknown id as text', () => {
		const artist = createEntry({ type: 'artist', title: 'Solange' });

		const linked = entryInputFromForm(formOf(['title', 'A Seat'], ['artistId', String(artist)], ['artistName', 'typed']), 'album', null);
		expect(linked.input.artist).toEqual({ id: artist, name: 'Solange' });

		const unknown = entryInputFromForm(formOf(['title', 'A Seat'], ['artistId', '9999'], ['artistName', 'Nobody']), 'album', null);
		expect(unknown.input.artist).toEqual({ id: null, name: 'Nobody' });

		const cleared = entryInputFromForm(formOf(['title', 'A Seat'], ['artistId', ''], ['artistName', '  ']), 'song', null);
		expect(cleared.input.artist).toBeNull();
	});

	it('only offers status to pieces and ignores fields of another type', () => {
		const piece = entryInputFromForm(formOf(['title', 'Coat'], ['status', 'owned']), 'piece', null);
		expect(piece.input.status).toBe('owned');

		const album = entryInputFromForm(formOf(['title', 'Ctrl'], ['status', 'done'], ['progress.episodes.total', '5'], ['details.url', 'https://x.example']), 'album', null);
		expect(album.input.status).toBeUndefined();
		expect(album.input.progress).toBeUndefined();
		expect(album.input.details).toEqual({});
	});
});

describe('saveFromForm', () => {
	it('creates an entry and returns its id', async () => {
		const result = await saveFromForm(formOf(['type', 'book'], ['title', 'Norwegian Wood'], ['details.year', '1987'], ['tag', 'novel']));

		expect(result).toEqual({ id: expect.any(Number), coverFailed: false });
		const entry = getEntry((result as { id: number }).id)!;
		expect(entry).toMatchObject({ type: 'book', title: 'Norwegian Wood', details: { year: 1987 }, status: 'none' });
		expect(entry.tags.map((t) => t.name)).toEqual(['novel']);
	});

	it('returns errors and stores nothing when the title is blank', async () => {
		const result = await saveFromForm(formOf(['type', 'book'], ['title', ''], ['image', new File([testImage()], 'a.png', { type: 'image/png' })]));

		expect(result).toEqual({ errors: { title: 'Title is required' } });
		expect(count('entries')).toBe(0);
		expect(count('images')).toBe(0);
	});

	it('updates an existing entry through its stored type and keeps what the form does not carry', async () => {
		const id = insertEntryRow({ type: 'manga', title: 'Old', status: 'progress', rating: 4, progress: { chapters: { current: 3, total: 10 } } });

		const result = await saveFromForm(
			formOf(['type', 'manga'], ['title', 'New'], ['progress.chapters.total', '12'], ['progress.volumes.total', '']),
			id
		);

		expect(result).toEqual({ id, coverFailed: false });
		expect(getEntry(id)).toMatchObject({
			title: 'New',
			status: 'progress',
			rating: 4,
			progress: { chapters: { current: 3, total: 12 }, volumes: { current: 0, total: null } }
		});
	});

	it('stores an uploaded image, and replaces the old row on edit', async () => {
		const id = insertEntryRow({ type: 'look', title: 'Fit', image: true });
		const old = getEntry(id)!.imageId;

		const result = await saveFromForm(
			formOf(['title', 'Fit'], ['image', new File([testImage(5)], 'fit.png', { type: 'image/png' })]),
			id
		);

		expect(result).toMatchObject({ id });
		const now = getEntry(id)!.imageId;
		expect(now).not.toBeNull();
		expect(now).not.toBe(old);
		expect(count('images')).toBe(1);
	});

	it('removes the image on request and keeps it when the form says nothing', async () => {
		const id = insertEntryRow({ type: 'look', title: 'Fit', image: true });

		await saveFromForm(formOf(['title', 'Fit'], ['image', new File([], '')], ['removeImage', '']), id);
		expect(getEntry(id)!.imageId).not.toBeNull();

		await saveFromForm(formOf(['title', 'Fit'], ['removeImage', '1']), id);
		expect(getEntry(id)!.imageId).toBeNull();
		expect(count('images')).toBe(0);
	});

	it('answers an unsupported or oversize file with the image message and keeps the entry as it was', async () => {
		const id = insertEntryRow({ type: 'look', title: 'Fit', image: true });
		const before = getEntry(id)!.imageId;

		const text = await saveFromForm(formOf(['title', 'Changed'], ['image', new File(['hello'], 'a.txt', { type: 'text/plain' })]), id);

		expect(text).toEqual({ errors: { image: 'Unsupported image type' } });
		expect(getEntry(id)).toMatchObject({ title: 'Fit', imageId: before });
	});

	it('drops the image it just stored when the entry itself is refused', async () => {
		const result = await saveFromForm(
			formOf(['type', 'piece'], ['title', 'Coat'], ['status', 'broken'], ['image', new File([testImage()], 'a.png', { type: 'image/png' })])
		);

		expect(result).toEqual({ errors: { status: 'Invalid status' } });
		expect(count('images')).toBe(0);
		expect(count('entries')).toBe(0);
	});
});

describe('saveFromForm with a search pick', () => {
	beforeEach(() => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');
	});

	const album = (...extra: Field[]) =>
		formOf(
			['type', 'album'],
			['title', 'Blonde'],
			['provider', 'deezer'],
			['externalId', 'fake-al-1'],
			['coverUrl', '/__test/image/blonde.png'],
			...extra
		);

	it('stores the provider id and downloads the cover into the image table', async () => {
		const result = await saveFromForm(album());

		expect(result).toEqual({ id: expect.any(Number), coverFailed: false });
		const entry = getEntry((result as { id: number }).id)!;
		expect(entry).toMatchObject({ provider: 'deezer', externalId: 'fake-al-1' });
		expect(entry.imageId).not.toBeNull();
		expect(count('images')).toBe(1);
	});

	it('saves without an image and flags coverFailed when the cover cannot be downloaded', async () => {
		const result = await saveFromForm(
			formOf(['type', 'book'], ['title', 'Broken'], ['provider', 'openlibrary'], ['externalId', 'fake-bk-3'], ['coverUrl', '/__test/missing/broken.png'])
		);

		expect(result).toEqual({ id: expect.any(Number), coverFailed: true });
		expect(getEntry((result as { id: number }).id)).toMatchObject({ title: 'Broken', imageId: null });
		expect(count('images')).toBe(0);
	});

	it('does not flag coverFailed for a result that has no cover', async () => {
		const result = await saveFromForm(formOf(['type', 'book'], ['title', 'Plain'], ['provider', 'openlibrary'], ['externalId', 'fake-bk-2']));

		expect(result).toEqual({ id: expect.any(Number), coverFailed: false });
	});

	it('prefers an uploaded file to the cover URL', async () => {
		const file = new File([testImage(3)], 'mine.png', { type: 'image/png' });
		await saveFromForm(album(['image', file]));

		expect(count('images')).toBe(1);
	});

	it('ignores a provider that is not the type\'s own and drops the cover it fetched when the entry is refused', async () => {
		const other = await saveFromForm(formOf(['type', 'book'], ['title', 'X'], ['provider', 'deezer'], ['externalId', 'fake-al-1']));
		expect(getEntry((other as { id: number }).id)).toMatchObject({ provider: null, externalId: null });

		await saveFromForm(album());
		const again = await saveFromForm(album());

		expect(again).toEqual({ errors: {}, existingId: expect.any(Number) });
		expect(count('images')).toBe(1);
		expect(count('entries')).toBe(2);
	});
});

describe('saveFromForm with an artist from a search pick', () => {
	beforeEach(() => {
		vi.stubEnv('CREATIVE_ARCHIVE_TEST', '1');
	});

	const pick = (...extra: Field[]) =>
		formOf(
			['type', 'album'],
			['title', 'Blonde'],
			['provider', 'deezer'],
			['externalId', 'fake-al-1'],
			['artistName', 'Frank Ocean'],
			['artistId', ''],
			['artistExternalId', 'fake-ar-1'],
			['artistImageUrl', '/__test/image/frank-ocean.png'],
			['addArtist', '1'],
			...extra
		);

	const unticked = () => {
		const form = pick();
		form.set('addArtist', '0');
		return form;
	};
	const artists = () => getDb().prepare("SELECT * FROM entries WHERE type = 'artist'").all();

	it('creates the artist with status none and its photo, and links the album', async () => {
		const result = (await saveFromForm(pick())) as { id: number };

		const [artist] = artists();
		expect(artist).toMatchObject({ title: 'Frank Ocean', status: 'none', provider: 'deezer', external_id: 'fake-ar-1' });
		expect(artist.image_id).not.toBeNull();
		expect(getEntry(result.id)).toMatchObject({ artistId: Number(artist.id), artistName: 'Frank Ocean' });
	});

	it('links the artist that already has the Deezer id and fetches no second photo', async () => {
		const id = insertEntryRow({ type: 'artist', title: 'Frank Ocean', provider: 'deezer', externalId: 'fake-ar-1' });

		const result = (await saveFromForm(pick())) as { id: number };

		expect(artists()).toHaveLength(1);
		expect(getEntry(result.id)).toMatchObject({ artistId: id });
		expect(count('images')).toBe(0);
	});

	it('stores only the name when Add artist is unticked', async () => {
		const result = (await saveFromForm(unticked())) as { id: number };

		expect(artists()).toHaveLength(0);
		expect(getEntry(result.id)).toMatchObject({ artistId: null, artistName: 'Frank Ocean' });
	});

	it('creates the artist without a photo when the photo cannot be downloaded', async () => {
		const form = pick();
		form.set('artistImageUrl', '/__test/missing/x.png');
		await saveFromForm(form);

		expect(artists()).toHaveLength(1);
		expect(artists()[0].image_id).toBeNull();
	});

	it('leaves no artist and no photo behind when the entry is refused', async () => {
		insertEntryRow({ type: 'album', title: 'Blonde', provider: 'deezer', externalId: 'fake-al-1' });

		const result = await saveFromForm(pick());

		expect(result).toEqual({ errors: {}, existingId: expect.any(Number) });
		expect(artists()).toHaveLength(0);
		expect(count('images')).toBe(0);
	});

	it('keeps an artist the user linked by hand', async () => {
		const mine = insertEntryRow({ type: 'artist', title: 'Frank' });
		const form = pick();
		form.set('artistId', String(mine));
		const result = (await saveFromForm(form)) as { id: number };

		expect(artists()).toHaveLength(1);
		expect(getEntry(result.id)).toMatchObject({ artistId: mine });
	});
});

describe('saveFromForm with a preview image', () => {
	const dataUrl = (bytes: Uint8Array) => `data:image/webp;base64,${Buffer.from(bytes).toString('base64')}`;
	const brand = (...extra: Field[]) => formOf(['type', 'brand'], ['title', 'Maison'], ...extra);

	it('stores the posted data URL as the entry image', async () => {
		const result = (await saveFromForm(brand(['previewImage', dataUrl(testImage())]))) as { id: number };

		expect(getEntry(result.id)!.imageId).not.toBeNull();
		expect(count('images')).toBe(1);
	});

	it('lets an uploaded file win over the preview image', async () => {
		const file = new File([testImage(1)], 'a.png', { type: 'image/png' });
		await saveFromForm(brand(['previewImage', dataUrl(testImage())], ['image', file]));

		expect(count('images')).toBe(1);
	});

	it('saves without an image when the data URL is not an image', async () => {
		const result = (await saveFromForm(brand(['previewImage', 'data:image/webp;base64,AAAA']))) as { id: number };

		expect(getEntry(result.id)!.imageId).toBeNull();
		expect(count('images')).toBe(0);
	});

	it('ignores anything that is not a data URL', async () => {
		const result = (await saveFromForm(brand(['previewImage', 'https://brand.example/x.png']))) as { id: number };

		expect(getEntry(result.id)!.imageId).toBeNull();
	});
});
