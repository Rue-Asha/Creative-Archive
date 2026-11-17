import { DOMAINS, type Domain } from '#lib/domains.ts';
import { LISTS, TYPES, TYPES_BY_DOMAIN } from '#lib/entries/config.ts';
import type { Entry, EntryType, ShelfData, Status } from '#lib/types.ts';
import { getDb } from './db.ts';
import { loadTags, rowToEntry } from './rows.ts';

const ofTypes = (types: EntryType[]) => JSON.stringify(types);

function hydrate(rows: Record<string, unknown>[]): Entry[] {
	const tags = loadTags(rows.map((r) => Number(r.id)));
	return rows.map((r) => rowToEntry(r, tags.get(Number(r.id)) ?? []));
}

// `status` narrows to one status (the Wardrobe list is the owned pieces); null takes every entry of the types
function recent(types: EntryType[], limit: number, status: Status | null = null): Entry[] {
	return hydrate(
		getDb()
			.prepare(
				`SELECT * FROM entries WHERE type IN (SELECT value FROM json_each(?)) AND (? IS NULL OR status = ?)
				 ORDER BY created_at DESC, id DESC LIMIT ?`
			)
			.all(ofTypes(types), status, status, limit)
	);
}

function total(types: EntryType[], status: Status | null = null): number {
	return Number(
		getDb()
			.prepare('SELECT count(*) AS n FROM entries WHERE type IN (SELECT value FROM json_each(?)) AND (? IS NULL OR status = ?)')
			.get(ofTypes(types), status, status)!.n
	);
}

export function coverflowEntries(): Entry[] {
	return hydrate(
		getDb()
			.prepare('SELECT * FROM entries WHERE image_id IS NOT NULL ORDER BY created_at DESC, id DESC LIMIT 20')
			.all()
	);
}

export function inProgress(): Entry[] {
	const media = (Object.keys(TYPES) as EntryType[]).filter((t) => TYPES[t].status === 'media');
	return hydrate(
		getDb()
			.prepare(
				`SELECT * FROM entries WHERE status = 'progress' AND type IN (SELECT value FROM json_each(?))
				 ORDER BY updated_at DESC, id DESC`
			)
			.all(ofTypes(media))
	);
}

export function recentlyAdded(domain: Domain, limit = 12): Entry[] {
	return recent(TYPES_BY_DOMAIN[domain], limit);
}

function progressShelf(entries: Entry[]): ShelfData[] {
	return entries.length ? [{ key: 'progress', title: 'In progress', count: entries.length, entries, href: null }] : [];
}

// one shelf per sub-type list, in the order the sub-type navigation shows them (Fashion: My things, then Discover)
export function domainShelves(domain: Domain): ShelfData[] {
	const progress = progressShelf(inProgress().filter((e) => TYPES[e.type].domain === domain));
	const byList = LISTS[domain].map((list): ShelfData => {
		const { types, status = null } = list.query;
		const single = types.length === 1 && status === null;
		return {
			key: single ? types[0] : list.slug,
			title: list.label,
			count: total(types, status),
			entries: recent(types, 12, status),
			href: `/${domain}/${list.slug}`
		};
	});
	return [...progress, ...byList.filter((s) => s.count > 0)];
}

export function homeShelves(): ShelfData[] {
	const byDomain = DOMAINS.map((domain): ShelfData => ({
		key: `recent-${domain}`,
		title: 'Recently added',
		count: total(TYPES_BY_DOMAIN[domain]),
		entries: recentlyAdded(domain),
		href: `/${domain}`
	}));
	return [...progressShelf(inProgress()), ...byDomain.filter((s) => s.count > 0)];
}
