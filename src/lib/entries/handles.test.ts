import { describe, expect, it } from 'vitest';
import { handlesFromUrl } from './handles.ts';

describe('handlesFromUrl', () => {
	it('Scenario: Profile URLs map to handles', () => {
		expect(handlesFromUrl('https://www.instagram.com/someone/')).toEqual({ instagram: 'someone' });
		expect(handlesFromUrl('https://instagram.com/someone')).toEqual({ instagram: 'someone' });
		expect(handlesFromUrl('https://www.tiktok.com/@someone')).toEqual({ tiktok: 'someone' });
		expect(handlesFromUrl('https://m.youtube.com/@someone')).toEqual({ youtube: 'someone' });
		expect(handlesFromUrl('https://www.youtube.com/c/someone')).toEqual({ youtube: 'someone' });
		expect(handlesFromUrl('https://www.youtube.com/user/someone/')).toEqual({ youtube: 'someone' });
	});

	it('Scenario: Unknown platform fills only the website', () => {
		expect(handlesFromUrl('https://someone.blog/about')).toEqual({ website: 'https://someone.blog/about' });
	});

	it('Scenario: Post and video URLs give no prefill', () => {
		for (const url of [
			'https://www.instagram.com/p/Cx1/',
			'https://www.instagram.com/reel/Cx2/',
			'https://www.instagram.com/stories/someone/1/',
			'https://www.tiktok.com/@someone/video/123',
			'https://www.youtube.com/watch?v=abc',
			'https://www.youtube.com/shorts/abc',
			'https://youtu.be/abc',
			'https://vm.tiktok.com/ZMabc123/',
			'https://music.youtube.com/watch?v=abc'
		])
			expect(handlesFromUrl(url), url).toBeNull();
	});

	it('keeps a look-alike host a plain website', () => {
		expect(handlesFromUrl('https://notinstagram.com/someone')).toEqual({ website: 'https://notinstagram.com/someone' });
	});

	it('gives nothing for something that is not an http(s) URL', () => {
		expect(handlesFromUrl('someone')).toBeNull();
		expect(handlesFromUrl('ftp://instagram.com/someone')).toBeNull();
	});

	it('treats a platform home page as no profile', () => {
		expect(handlesFromUrl('https://www.instagram.com/')).toBeNull();
	});
});
