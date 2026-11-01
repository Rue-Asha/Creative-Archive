import { afterEach, describe, expect, it, vi } from 'vitest';
import { FetchError, ImageError } from '#lib/errors.ts';
import { fakeRemote } from './fake/remote.ts';
import { parsePreview, readPreview } from './preview.ts';

afterEach(() => {
	vi.restoreAllMocks();
	delete process.env.CREATIVE_ARCHIVE_TEST;
});

describe('parsePreview', () => {
	it('Scenario: Open Graph tags fill the preview', () => {
		const html = `<html><head>
			<title>Ignored | Home</title>
			<meta property="og:title" content="Maison &amp; Fils &#8211; &quot;Atelier&quot;">
			<meta content='Quiet tailoring &lt;3 &#x27;knitwear&#x27;' property='og:description'>
			<meta property="og:image" content="https://cdn.example/img/hero.jpg">
		</head></html>`;

		expect(parsePreview(html, 'https://brand.example/')).toEqual({
			title: 'Maison & Fils – "Atelier"',
			description: "Quiet tailoring <3 'knitwear'",
			imageUrl: 'https://cdn.example/img/hero.jpg'
		});
	});

	it('Scenario: Page without Open Graph falls back to title and icon', () => {
		const html = `<head><title>
			Shop
		</title><link rel="icon" href="/fav.png"></head>`;

		expect(parsePreview(html, 'https://shop.example/a/b')).toEqual({
			title: 'Shop',
			description: null,
			imageUrl: 'https://shop.example/fav.png'
		});
	});

	it('Scenario: Relative og:image resolves against the page URL', () => {
		const html = '<meta property="og:image" content="../img/x.jpg">';

		expect(parsePreview(html, 'https://brand.example/a/b/').imageUrl).toBe('https://brand.example/a/img/x.jpg');
	});

	it('Scenario: Page with nothing usable has no preview', () => {
		expect(parsePreview('<div id="root"></div>', 'https://app.example/')).toEqual({
			title: null,
			description: null,
			imageUrl: null
		});
	});

	it('prefers og:image over the icon and finds the icon among rel tokens', () => {
		const icon = '<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">';

		expect(parsePreview(`${icon}<meta property="og:image" content="/og.png">`, 'https://a.example/x/').imageUrl).toBe(
			'https://a.example/og.png'
		);
		expect(parsePreview(`<link rel="stylesheet" href="/s.css">${icon}`, 'https://a.example/x/').imageUrl).toBe(
			'https://a.example/x/favicon.ico'
		);
	});

	it('ignores empty values and URLs that are not http or https', () => {
		const html = `<meta property="og:title" content="  ">
			<meta property="og:image" content="javascript:alert(1)">
			<link rel="icon" href="data:image/png;base64,AAAA">
			<title>Real title</title>`;

		expect(parsePreview(html, 'https://a.example/')).toEqual({ title: 'Real title', description: null, imageUrl: null });
	});

	it('keeps a ">" inside a quoted content value', () => {
		expect(parsePreview('<meta property="og:title" content="A > B">', 'https://a.example/').title).toBe('A > B');
	});
});

describe('readPreview', () => {
	const fake = () => {
		process.env.CREATIVE_ARCHIVE_TEST = '1';
	};

	it('reads the page and returns the image as a WebP data URL', async () => {
		fake();

		const preview = await readPreview('https://brand.example/');

		expect(preview).toMatchObject({
			title: 'Maison Example',
			description: 'Quiet tailoring & knitwear from a small atelier.',
			imageUrl: 'https://brand.example/__test/image/brand.png'
		});
		expect(preview.image).toMatch(/^data:image\/webp;base64,/);
	});

	it('uses the page icon when there is no og:image', async () => {
		fake();

		const preview = await readPreview('https://favicon.example/');

		expect(preview.title).toBe('Favicon Example');
		expect(preview.image).toMatch(/^data:image\/webp;base64,/);
	});

	it('has no image for a JS shell or a login wall, and keeps the title', async () => {
		fake();

		expect(await readPreview('https://shell.example/')).toMatchObject({ title: 'App', image: null });
		expect(await readPreview('https://www.instagram.com/someone/')).toMatchObject({ image: null });
	});

	it('answers a blocked or private page with an empty preview instead of throwing', async () => {
		fake();
		const empty = { title: null, description: null, imageUrl: null, image: null };

		expect(await readPreview('https://blocked.example/')).toEqual(empty);
		expect(await readPreview('http://127.0.0.1/')).toEqual(empty);
		expect(await readPreview('https://unknown.example/')).toEqual(empty);
	});

	it('throws FetchError for a URL that is not http or https', async () => {
		fake();

		await expect(readPreview('brand dot com')).rejects.toMatchObject({ code: 'invalid-url' });
		await expect(readPreview('ftp://brand.example/')).rejects.toMatchObject({ code: 'scheme' });
	});

	it('keeps the text when the image download fails with FetchError or ImageError', async () => {
		fake();
		const download = vi.spyOn(fakeRemote, 'fetchImage');

		download.mockRejectedValueOnce(new FetchError('status'));
		expect(await readPreview('https://brand.example/')).toMatchObject({ title: 'Maison Example', image: null });

		download.mockRejectedValueOnce(new ImageError('too-large'));
		expect(await readPreview('https://brand.example/')).toMatchObject({ title: 'Maison Example', image: null });

		download.mockResolvedValueOnce(new Uint8Array([1, 2, 3]));
		expect(await readPreview('https://brand.example/')).toMatchObject({ title: 'Maison Example', image: null });
	});
});
