export const STATUS_LABELS: Record<'music' | 'anime' | 'read' | 'piece', Record<string, string>> = {
	music: { none: 'No status', want: 'Want to listen', progress: 'Listening', done: 'Listened', dropped: 'Dropped' },
	anime: { none: 'No status', want: 'Plan to watch', progress: 'Watching', done: 'Watched', dropped: 'Dropped' },
	read: { none: 'No status', want: 'Want to read', progress: 'Reading', done: 'Read', dropped: 'Dropped' },
	piece: { wishlist: 'Wishlist', owned: 'Owned', gone: 'Gone' }
};

export const MARK_DONE: Record<'anime' | 'manga', string> = {
	anime: 'Mark as watched',
	manga: 'Mark as read'
};

export const COPY = {
	titleRequired: 'Title is required',
	nameRequired: 'Name is required',
	imageType: 'Unsupported image type',
	imageSize: 'Image is larger than 16 MB',
	invalidUrl: 'Enter a valid http or https URL',
	noPreview: 'No preview found',
	searchFailed: 'Search is unavailable right now',
	noResults: 'No results',
	addManually: 'Add manually',
	already: 'Already in your archive',
	coverFailed: 'Cover could not be downloaded',
	nothingMatches: 'Nothing matches',
	resetFilters: 'Reset filters',
	saved: 'Saved',
	saveFailed: 'Couldn\'t save — try again',
	deleted: 'Deleted',
	collectionNameRequired: 'Name is required',

	// Gate 5: "N" stands for the count (see withCount), "{status}" and "{domain}" for the name
	select: 'Select',
	done: 'Done',
	more: 'More',
	selected: 'N selected',
	setStatus: 'Set status',
	addTag: 'Add tag',
	removeTag: 'Remove tag',
	statusSet: 'Status set to {status} for N entries',
	tagAdded: 'Tag added to N entries',
	tagRemoved: 'Tag removed from N entries',
	bulkFailed: 'Couldn\'t update N entries — try again',
	moveToTop: 'Move to top',
	moveToBottom: 'Move to bottom',
	moveBefore: 'Move before…',
	removeFromCollection: 'Remove from collection',
	movedToTop: 'N entries moved to the top',
	movedToBottom: 'N entries moved to the bottom',
	moved: 'N entries moved',
	removedFromCollection: 'N entries removed from this collection',
	collectionChanged: 'This collection changed in another tab — reloaded',
	addSheetAll: 'Add to your archive',
	addSheetDomain: 'Add to {domain}',
	brandOrShop: 'Brand or shop',
	heroExplanation:
		'Each world can have one photo, shown behind its title. Without one, the page shows a soft colour field. JPEG, PNG, WebP, GIF or AVIF, up to 16 MB.',
	noEntriesYet: 'No entries yet',
	entryCount: 'N entries',

	// Gate 7: a sub-type shelf counts in its own noun ("14 albums", "1 album"); a shelf mixing types names each card's type
	typeCount: 'N {type}',
	typedMeta: '{type} · {maker}'
} as const;

// "N entries" reads "1 entry" for one; any other "N" is replaced as is
export function withCount(text: string, n: number): string {
	return (n === 1 ? text.replace('N entries', '1 entry') : text).replace(/\bN\b/, String(n));
}
