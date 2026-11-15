import { describe, expect, it } from 'vitest';
import { isAcceptedImageFile } from './imageFormats.ts';

describe('isAcceptedImageFile', () => {
	it('Scenario: A .heic file is refused in the browser', () => {
		expect(isAcceptedImageFile({ name: 'photo.heic', type: 'image/heic' })).toBe(false);
		expect(isAcceptedImageFile({ name: 'photo.heic', type: '' })).toBe(false);
		expect(isAcceptedImageFile({ name: 'PHOTO.HEIC', type: '' })).toBe(false);
	});

	it('accepts the six listed formats by MIME or, without a MIME, by extension', () => {
		for (const [name, type] of [
			['a.jpg', 'image/jpeg'],
			['a.png', 'image/png'],
			['a.webp', 'image/webp'],
			['a.gif', 'image/gif'],
			['a.avif', 'image/avif'],
			['a.heif', 'image/heif'],
			['a.jpeg', ''],
			['a.heif', '']
		]) {
			expect(isAcceptedImageFile({ name, type }), name).toBe(true);
		}
	});

	it('refuses other files', () => {
		expect(isAcceptedImageFile({ name: 'notes.txt', type: 'text/plain' })).toBe(false);
		expect(isAcceptedImageFile({ name: 'notes.txt', type: '' })).toBe(false);
	});
});
