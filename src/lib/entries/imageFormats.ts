const MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heif']);
const EXTENSION = /\.(jpe?g|png|webp|gif|avif|heif)$/i;

// HEIC (HEVC inside HEIF) is not decodable by the prebuilt sharp, so `image/heic` and `.heic` stay out
export function isAcceptedImageFile(file: { type: string; name: string }): boolean {
	return MIME.has(file.type) || (file.type === '' && EXTENSION.test(file.name));
}
