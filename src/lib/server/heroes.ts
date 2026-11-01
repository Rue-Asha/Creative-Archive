import type { World } from '#lib/domains.ts';
import type { Id } from '#lib/types.ts';
import { getDb } from './db.ts';
import { deleteImage } from './images.ts';
import { atomic } from './tags.ts';

export function getHeroes(): Partial<Record<World, Id>> {
	const out: Partial<Record<World, Id>> = {};
	for (const r of getDb().prepare('SELECT world, image_id FROM heroes').all())
		out[r.world as World] = Number(r.image_id);
	return out;
}

export function setHero(world: World, imageId: Id): void {
	atomic(() => {
		const old = getHeroes()[world];
		getDb().prepare('INSERT OR REPLACE INTO heroes (world, image_id) VALUES (?, ?)').run(world, imageId);
		if (old !== undefined && old !== imageId) deleteImage(old);
	});
}

export function removeHero(world: World): void {
	atomic(() => {
		const old = getHeroes()[world];
		if (old === undefined) return;
		getDb().prepare('DELETE FROM heroes WHERE world = ?').run(world);
		deleteImage(old);
	});
}
