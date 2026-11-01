import { error } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireTestFlag } from '#lib/server/test-flag.ts';
import type { RequestHandler } from './$types';

// the photos never enter static/ or the build; CI's unpacked tarball points MOCKUP_PHOTOS_DIR at the repo's folder
function photosDir(): string {
	if (process.env.MOCKUP_PHOTOS_DIR) return process.env.MOCKUP_PHOTOS_DIR;
	let dir = dirname(fileURLToPath(import.meta.url));
	while (!existsSync(join(dir, 'package.json')) && dirname(dir) !== dir) dir = dirname(dir);
	return join(dir, 'fixtures', 'mockups');
}

export const GET: RequestHandler = ({ params }) => {
	requireTestFlag();
	const path = join(photosDir(), params.name);
	if (!/^[\w-]+\.jpg$/.test(params.name) || !existsSync(path)) error(404, 'Not found');
	return new Response(readFileSync(path), {
		headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=3600' }
	});
};
