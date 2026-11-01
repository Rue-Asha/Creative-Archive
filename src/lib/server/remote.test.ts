import { describe, expect, it } from 'vitest';
import { FetchError, ImageError } from '#lib/errors.ts';
import { fakeRemote } from './fake/remote.ts';

const PNG = [0x89, 0x50, 0x4e, 0x47];

async function code(p: Promise<unknown>): Promise<string> {
	const e = await p.then(
		() => null,
		(e: unknown) => e
	);
	if (e instanceof FetchError || e instanceof ImageError) return `${e.name}:${e.code}`;
	throw new Error(`expected a FetchError or ImageError, got ${String(e)}`);
}

describe('fake remote', () => {
	it('generates an image for relative and absolute /__test/image/ URLs', async () => {
		const relative = await fakeRemote.fetchImage('/__test/image/blonde.png');
		const absolute = await fakeRemote.fetchImage('https://brand.example/__test/image/brand.png');

		expect([...relative.slice(0, 4)]).toEqual(PNG);
		expect([...absolute.slice(0, 4)]).toEqual(PNG);
		expect(Buffer.from(await fakeRemote.fetchImage('/__test/image/blonde.png')).equals(Buffer.from(relative))).toBe(true);
	});

	it('cannot download any other image', async () => {
		expect(await code(fakeRemote.fetchImage('/__test/missing/broken.png'))).toBe('ImageError:download');
		expect(await code(fakeRemote.fetchImage('https://cdn.example/cover.jpg'))).toBe('ImageError:download');
	});

	it('serves the brand page with its Open Graph tags', async () => {
		const page = await fakeRemote.fetchPage('https://brand.example/');

		expect(page.url).toBe('https://brand.example/');
		expect(page.html).toContain('<meta property="og:title" content="Maison Example">');
		expect(page.html).toContain('og:description');
		expect(page.html).toContain('<meta property="og:image" content="/__test/image/brand.png">');
		expect((await fakeRemote.fetchPage('https://brand.example')).url).toBe('https://brand.example/');
	});

	it('serves the piece page with a title and image', async () => {
		const { html } = await fakeRemote.fetchPage('https://piece.example/coat');

		expect(html).toContain('<meta property="og:title" content="Wool Coat">');
		expect(html).toMatch(/og:image" content="\/__test\/image\/[^"]+"/);
	});

	it('serves a page with only a title and an icon', async () => {
		const { html } = await fakeRemote.fetchPage('https://favicon.example/');

		expect(html).toContain('<link rel="icon" href="/__test/image/favicon.png">');
		expect(html).toContain('<title>');
		expect(html).not.toContain('og:');
	});

	it('serves a JS-only shell and login walls without an image', async () => {
		const shell = await fakeRemote.fetchPage('https://shell.example/');
		expect(shell.html).toContain('<title>App</title>');
		expect(shell.html).not.toContain('og:');
		for (const url of ['https://www.instagram.com/someone/', 'https://www.instagram.com/p/Cx1/']) {
			const { html } = await fakeRemote.fetchPage(url);
			expect(html, url).toContain('<title>Login • Instagram</title>');
			expect(html, url).not.toContain('og:image');
			expect(html, url).not.toContain('rel="icon"');
		}
	});

	it('fails like the safe fetch would', async () => {
		expect(await code(fakeRemote.fetchPage('https://blocked.example/'))).toBe('FetchError:status');
		expect(await code(fakeRemote.fetchPage('http://127.0.0.1/'))).toBe('FetchError:private-address');
		expect(await code(fakeRemote.fetchPage('http://localhost/'))).toBe('FetchError:private-address');
		expect(await code(fakeRemote.fetchPage('https://unknown.example/'))).toBe('FetchError:network');
		expect(await code(fakeRemote.fetchPage('brand dot com'))).toBe('FetchError:invalid-url');
		expect(await code(fakeRemote.fetchPage('ftp://brand.example/'))).toBe('FetchError:scheme');
	});
});
