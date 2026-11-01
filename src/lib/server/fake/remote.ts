import { FetchError, ImageError } from '#lib/errors.ts';
import type { Remote } from '../remote.ts';
import { testImageNamed } from '../testing.ts';
import { FAKE_PAGES } from './pages.ts';

function parse(url: string): URL {
	try {
		return new URL(url);
	} catch {
		throw new FetchError('invalid-url');
	}
}

export const fakeRemote: Remote = {
	async fetchPage(url) {
		const u = parse(url);
		if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new FetchError('scheme');
		if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') throw new FetchError('private-address');
		if (u.hostname === 'blocked.example') throw new FetchError('status');
		const html = FAKE_PAGES[u.href];
		if (html === undefined) throw new FetchError('network');
		return { url: u.href, html };
	},
	async fetchImage(url) {
		const { pathname } = new URL(url, 'http://fake.invalid');
		if (!pathname.startsWith('/__test/image/')) throw new ImageError('download');
		return testImageNamed(pathname.slice('/__test/image/'.length));
	}
};
