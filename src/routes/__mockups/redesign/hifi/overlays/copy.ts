// Every new string of the dialogs, menus, toasts and the collection pages, in one place for the copy list (contract §6).
import { entries } from '../shell/data.ts';

export const TOAST = {
	saved: 'Saved',
	deleted: 'Deleted',
	failed: "Couldn't save — try again",
	cover: 'Cover could not be downloaded',
	conflict: 'This collection changed in another tab — reloaded',
	statusSet: (status: string, n: number) => `Status set to ${status} for ${entries(n)}`,
	updated: (n: number) => `${entries(n)} updated`,
	tagAdded: (n: number) => `Tag added to ${entries(n)}`,
	tagRemoved: (n: number) => `Tag removed from ${entries(n)}`,
	movedTop: (n: number) => `${entries(n)} moved to the top`,
	movedBottom: (n: number) => `${entries(n)} moved to the bottom`,
	moved: (n: number) => `${entries(n)} moved`,
	removed: (n: number) => `${entries(n)} removed from this collection`,
	bulkFailed: (n: number) => `Couldn't update ${entries(n)} — try again`
};

export const quote = (title: string) => `“${title}”`;
