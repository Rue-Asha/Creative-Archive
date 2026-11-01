import pkg from '../../../package.json' with { type: 'json' };
import { FetchError, ImageError } from '#lib/errors.ts';
import { fakeRemote } from './fake/remote.ts';
import { MAX_UPLOAD_BYTES } from './images.ts';
import { safeFetch, type SafeFetchOptions } from './net.ts';
import { testFlag } from './test-flag.ts';

export interface Remote {
	fetchPage(url: string): Promise<{ url: string; html: string }>;
	fetchImage(url: string): Promise<Uint8Array>;
}

export const USER_AGENT = `Creative-Archive/${pkg.version} (private archive)`;
export const MAX_PAGE_BYTES = 1024 * 1024;

function charsetOf(contentType: string): string {
	return /charset=["']?([\w-]+)/i.exec(contentType)?.[1] ?? 'utf-8';
}

function decode(bytes: Uint8Array, contentType: string): string {
	try {
		return new TextDecoder(charsetOf(contentType)).decode(bytes);
	} catch {
		return new TextDecoder().decode(bytes);
	}
}

export function createRemote(extra: Pick<SafeFetchOptions, 'allowAddresses' | 'lookup' | 'timeoutMs'> = {}): Remote {
	const headers = { 'user-agent': USER_AGENT };
	return {
		// throws FetchError; 'status' also covers an answer that is not text/html
		async fetchPage(url) {
			const res = await safeFetch(url, { ...extra, headers, maxBytes: MAX_PAGE_BYTES, truncate: true });
			const type = res.contentType ?? '';
			if (res.status < 200 || res.status >= 300 || !/^text\/html\b/i.test(type)) throw new FetchError('status');
			return { url: res.url, html: decode(res.body, type) };
		},
		// throws FetchError, or ImageError('not-image') for a non-image answer
		async fetchImage(url) {
			const res = await safeFetch(url, { ...extra, headers, maxBytes: MAX_UPLOAD_BYTES });
			if (res.status < 200 || res.status >= 300) throw new FetchError('status');
			if (!res.contentType?.toLowerCase().startsWith('image/')) throw new ImageError('not-image');
			return res.body;
		}
	};
}

export const safeRemote: Remote = createRemote();

export function getRemote(): Remote {
	return testFlag() ? fakeRemote : safeRemote;
}
