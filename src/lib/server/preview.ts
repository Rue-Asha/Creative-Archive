import { FetchError, ImageError } from '#lib/errors.ts';
import { toWebpDataUrl } from './images.ts';
import { getRemote } from './remote.ts';

export interface Preview {
	title: string | null;
	description: string | null;
	imageUrl: string | null;
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decode(s: string): string {
	return s.replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (whole, dec, hex, name) => {
		if (name) return NAMED[name.toLowerCase()] ?? whole;
		const code = dec ? Number(dec) : parseInt(hex, 16);
		return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
	});
}

// quoted values may contain ">"
const TAG = (name: string) => new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');

function attributes(tag: string): Record<string, string> {
	const attrs: Record<string, string> = {};
	for (const m of tag.matchAll(/([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
		attrs[m[1].toLowerCase()] ??= decode(m[2] ?? m[3] ?? m[4]);
	}
	return attrs;
}

function webUrl(raw: string | undefined, base: string): string | null {
	if (!raw?.trim()) return null;
	try {
		const url = new URL(raw.trim(), base);
		return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
	} catch {
		return null;
	}
}

function text(raw: string | undefined): string | null {
	return raw?.replace(/\s+/g, ' ').trim() || null;
}

export function parsePreview(html: string, pageUrl: string): Preview {
	const meta: Record<string, string> = {};
	for (const tag of html.match(TAG('meta')) ?? []) {
		const a = attributes(tag);
		const key = (a.property ?? a.name)?.toLowerCase();
		if (key && a.content !== undefined) meta[key] ??= a.content;
	}
	const icon = (html.match(TAG('link')) ?? [])
		.map(attributes)
		.find((a) => a.rel?.toLowerCase().split(/\s+/).includes('icon') && a.href);
	const title = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
	return {
		title: text(meta['og:title']) ?? text(title && decode(title)),
		description: text(meta['og:description']),
		imageUrl: webUrl(meta['og:image'], pageUrl) ?? webUrl(icon?.href, pageUrl)
	};
}

const NOT_A_URL = new Set(['invalid-url', 'scheme']);

async function downloadAsWebp(url: string): Promise<string | null> {
	try {
		return await toWebpDataUrl(await getRemote().fetchImage(url));
	} catch (e) {
		if (e instanceof FetchError || e instanceof ImageError) return null;
		throw e;
	}
}

// image = WebP data URL; an unusable URL throws FetchError, a page or image that can't be had gives nulls
export async function readPreview(url: string): Promise<Preview & { image: string | null }> {
	let page: { url: string; html: string };
	try {
		page = await getRemote().fetchPage(url);
	} catch (e) {
		if (e instanceof FetchError && NOT_A_URL.has(e.code)) throw e;
		if (e instanceof FetchError || e instanceof ImageError) return { title: null, description: null, imageUrl: null, image: null };
		throw e;
	}
	const preview = parsePreview(page.html, page.url);
	const imageUrl = preview.imageUrl ?? new URL('/favicon.ico', page.url).href;
	return { ...preview, image: await downloadAsWebp(imageUrl) };
}
