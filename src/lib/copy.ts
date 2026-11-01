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
	collectionNameRequired: 'Name is required'
} as const;
