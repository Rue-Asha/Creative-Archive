import { error, fail } from '@sveltejs/kit';
import { COPY } from '#lib/copy.ts';
import { WORLD_NAMES, type World } from '#lib/domains.ts';
import { ImageError } from '#lib/errors.ts';
import { getHeroes, removeHero, setHero } from '#lib/server/heroes.ts';
import { storeImage } from '#lib/server/images.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({ world: 'home' as const, heroes: getHeroes() });

function worldOf(data: FormData): World {
	const world = WORLD_NAMES.find((w) => w === data.get('world'));
	if (!world) error(400, 'Unknown world');
	return world;
}

export const actions: Actions = {
	upload: async ({ request }) => {
		const data = await request.formData();
		const world = worldOf(data);
		const file = data.get('image');
		if (!(file instanceof File)) return fail(400, { world, error: COPY.imageType });
		let id;
		try {
			id = await storeImage(new Uint8Array(await file.arrayBuffer()));
		} catch (e) {
			if (!(e instanceof ImageError)) throw e;
			return fail(400, { world, error: e.code === 'too-large' ? COPY.imageSize : COPY.imageType });
		}
		setHero(world, id);
		return { world };
	},
	remove: async ({ request }) => {
		const world = worldOf(await request.formData());
		removeHero(world);
		return { world };
	}
};
