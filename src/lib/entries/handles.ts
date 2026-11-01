import type { Handles } from '#lib/types.ts';

const host = (hostname: string) => hostname.toLowerCase().replace(/^(www|m)\./, '');

const on = (name: string, domain: string) => name === domain || name.endsWith(`.${domain}`);

// the one path segment of a profile URL, or null when there are more (a post, a video) or none
function profile(segments: string[]): string | null {
	return segments.length === 1 && segments[0] ? segments[0] : null;
}

export function handlesFromUrl(value: string): Handles | null {
	let url: URL;
	try {
		url = new URL(value.trim());
	} catch {
		return null;
	}
	if (!['http:', 'https:'].includes(url.protocol)) return null;
	const segments = url.pathname.split('/').filter(Boolean);
	const name = host(url.hostname);

	if (on(name, 'instagram.com')) {
		const handle = profile(segments);
		return handle && !['p', 'reel', 'reels', 'stories', 'explore'].includes(handle) ? { instagram: handle } : null;
	}
	if (on(name, 'tiktok.com')) {
		const handle = profile(segments);
		return handle?.startsWith('@') && handle.length > 1 ? { tiktok: handle.slice(1) } : null;
	}
	if (on(name, 'youtube.com')) {
		const first = segments[0] ?? '';
		if (first.startsWith('@') && segments.length === 1 && first.length > 1) return { youtube: first.slice(1) };
		if (['c', 'user'].includes(first) && segments.length === 2) return { youtube: segments[1] };
		return null;
	}
	if (on(name, 'youtu.be')) return null;
	return { website: value.trim() };
}
