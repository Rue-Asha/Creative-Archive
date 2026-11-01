export type Id = number;
export type IsoDateTime = string;
export type EntryType =
	| 'album'
	| 'artist'
	| 'song'
	| 'anime'
	| 'manga'
	| 'book'
	| 'brand'
	| 'site'
	| 'influencer'
	| 'piece'
	| 'look';
export type MediaType = 'album' | 'artist' | 'song' | 'anime' | 'manga' | 'book';
export type MediaStatus = 'none' | 'want' | 'progress' | 'done' | 'dropped';
export type PieceStatus = 'wishlist' | 'owned' | 'gone';
export type Status = MediaStatus | PieceStatus;
export type SiteKind = 'brand' | 'shop' | 'site';
export type ProviderId = 'deezer' | 'anilist' | 'openlibrary';
export type ProgressKey = 'episodes' | 'chapters' | 'volumes';
// total null = unknown, shown as "n / ?"
export interface Progress {
	current: number;
	total: number | null;
}
export interface Handles {
	instagram?: string;
	tiktok?: string;
	youtube?: string;
	website?: string;
}

// display-only per-type fields, stored in entries.details (JSON)
export interface EntryDetails {
	altTitle?: string;
	year?: number;
	recordType?: 'album' | 'ep';
	trackCount?: number;
	albumTitle?: string;
	authors?: string[];
	url?: string;
	description?: string;
	handles?: Handles;
	brand?: string;
	price?: string;
	sourceUrl?: string;
}

// count = uses across all entries
export interface Tag {
	id: Id;
	name: string;
	count: number;
}

// read model: stored fields, plus `rating` derived from the stored rating_x2
export interface Entry {
	id: Id;
	type: EntryType;
	title: string;
	status: Status | null;
	rating: number | null;
	progress: Partial<Record<ProgressKey, Progress>>;
	kind: SiteKind | null;
	artistId: Id | null;
	artistName: string | null;
	provider: ProviderId | null;
	externalId: string | null;
	imageId: Id | null;
	details: EntryDetails;
	tags: Tag[];
	note: string;
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
}

// write model; the server validates against TYPES[type]. imageId: undefined = keep, null = remove
export interface EntryInput {
	type: EntryType;
	title: string;
	status?: Status;
	rating?: number | null;
	progress?: Partial<Record<ProgressKey, Progress>>;
	kind?: SiteKind;
	artist?: { id: Id | null; name: string } | null;
	provider?: ProviderId | null;
	externalId?: string | null;
	imageId?: Id | null;
	details?: EntryDetails;
	tags?: string[];
	note?: string;
}

export interface StatusEvent {
	id: Id;
	entryId: Id;
	status: Status;
	at: IsoDateTime;
}

export type SortKey = 'added' | 'rating' | 'title';
// one type, or ['piece'] with status 'owned' for Wardrobe
export interface ListQuery {
	types: EntryType[];
	status?: Status;
	kind?: SiteKind;
	tag?: Id;
	minRating?: number;
	sort?: SortKey;
}

export interface Collection {
	id: Id;
	name: string;
	description: string;
	count: number;
	collage: Id[];
	createdAt: IsoDateTime;
	updatedAt: IsoDateTime;
}

export interface ShelfData {
	key: string;
	title: string;
	count: number;
	entries: Entry[];
	href: string | null;
}
