import type { World } from '#lib/domains.ts';

export type Section = World | 'collections' | 'settings';

// Collections and Settings sit in the home world, so the world alone can't tell them from Home.
export function activeSection(pathname: string, world: World): Section {
	if (pathname === '/collections' || pathname.startsWith('/collections/')) return 'collections';
	if (pathname === '/settings' || pathname.startsWith('/settings/')) return 'settings';
	return world;
}
