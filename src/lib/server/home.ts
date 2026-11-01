import { DOMAINS, type Domain } from '#lib/domains.ts';
import { TYPES, TYPES_BY_DOMAIN } from '#lib/entries/config.ts';
import { listHref } from '#lib/entries/derive.ts';
import type { Entry, EntryType, ShelfData } from '#lib/types.ts';
import { getDb } from './db.ts';
import { loadTags, rowToEntry } from './rows.ts';

const ofTypes = (types: EntryType[]) => JSON.stringify(types);

function hydrate(rows: Record<string, unknown>[]): Entry[] {
	const tags = loadTags(rows.map((r) => Number(r.id)));
	return rows.map((r) => rowToEntry(r, tags.get(Number(r.id)) ?? []));
}

function recent(types: EntryType[], limit: number): Entry[] {
	return hydrate(
		getDb()
			.prepare(
				'SELECT * FROM entries WHERE type IN (SELECT value FROM json_each(?)) ORDER BY created_at DESC, id DESC LIMIT ?'
			)
			.all(ofTypes(types), limit)
	);
}

function total(types: EntryType[]): number {
	return Number(
		getDb()
			.prepare('SELECT count(*) AS n FROM entries WHERE type IN (SELECT value FROM json_each(?))')
			.get(ofTypes(types))!.n
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

export function domainShelves(domain: Domain): ShelfData[] {
	const progress = progressShelf(inProgress().filter((e) => TYPES[e.type].domain === domain));
	const byType = TYPES_BY_DOMAIN[domain].map((type): ShelfData => ({
		key: type,
		title: TYPES[type].plural,
		count: total([type]),
		entries: recent([type], 12),
		href: listHref(type)
	}));
	return [...progress, ...byType.filter((s) => s.count > 0)];
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
