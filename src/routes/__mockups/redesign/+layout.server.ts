import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import { worldPhotoName, type PhotoWorld } from './fixtures.ts';
import type { LayoutServerLoad } from './$types';

function photosDir(): string {
	if (process.env.MOCKUP_PHOTOS_DIR) return process.env.MOCKUP_PHOTOS_DIR;
	let dir = dirname(fileURLToPath(import.meta.url));
	while (!existsSync(join(dir, 'package.json')) && dirname(dir) !== dir) dir = dirname(dir);
	return join(dir, 'fixtures', 'mockups');
}

export const load: LayoutServerLoad = () => {
	requireTestFlag();
	const dir = photosDir();
	const worlds = Object.keys(worldPhotoName(false)) as PhotoWorld[];
	// world-<world>.jpg once unit 2's mood photos exist, today's hero until then
	const photos = Object.fromEntries(
		worlds.map((w) => [w, existsSync(join(dir, `${worldPhotoName(true)[w]}.jpg`)) ? worldPhotoName(true)[w] : worldPhotoName(false)[w]])
	) as Record<PhotoWorld, string>;
	return { photos };
};
