import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const dir = join(root, 'fixtures/mockups');
const line = /^(\S+) \| (https?:\/\/\S+|generated) \| author: (.+?) \| licence: (.+)$/;
const image = /\.(jpe?g|png|webp|avif)$/i;

function files(path: string): string[] {
	if (!existsSync(path)) return [];
	return readdirSync(path, { withFileTypes: true }).flatMap((e) =>
		e.isDirectory() ? files(join(path, e.name)) : [join(path, e.name)]
	);
}

describe('mockup photos', () => {
	it('Scenario: Every mockup photo is credited', () => {
		const images = readdirSync(dir).filter((f) => image.test(f));
		const credits = new Map(
			readFileSync(join(dir, 'CREDITS.txt'), 'utf8')
				.split('\n')
				.map((l) => l.match(line))
				.filter((m) => m !== null)
				.map((m) => [m[1], { source: m[2], author: m[3].trim(), licence: m[4].trim() }])
		);

		expect(images.length).toBeGreaterThanOrEqual(16);
		for (const name of images) {
			const credit = credits.get(name);
			expect(credit, name).toBeDefined();
			expect(credit!.author.length, name).toBeGreaterThan(0);
			expect(credit!.licence, name).toMatch(/CC0|Public Domain|^generated \(scripts\/synthetic-photo\.mjs\)$/);
			if (credit!.source === 'generated') expect(credit!.licence, name).toMatch(/^generated/);
		}
		for (const name of credits.keys()) expect(images, `credited but missing: ${name}`).toContain(name);
	});

	it('Scenario: Every world has a mood photo', async () => {
		const credited = readFileSync(join(dir, 'CREDITS.txt'), 'utf8');
		for (const world of ['home', 'music', 'animanga', 'books', 'fashion']) {
			const name = `world-${world}.jpg`;
			expect(existsSync(join(dir, name)), name).toBe(true);
			expect((await sharp(join(dir, name)).metadata()).width, name).toBeGreaterThanOrEqual(1920);
			expect(credited, name).toMatch(new RegExp(`^${name} \\|`, 'm'));
		}
	});

	// proof builds before it tests, so build/client is the build this run made
	it('Scenario: Mockup photos stay out of the product', () => {
		// the app icon set comes from Design-System's build-icons at its own size; any other image counts from 10 KB
		const iconSet = /\/(icon-192|icon-512|icon-maskable-512|apple-touch-icon)\.png$/;
		const shipped = [...files(join(root, 'static')), ...files(join(root, 'build/client'))].filter(
			(f) => image.test(f) && !iconSet.test(f) && statSync(f).size >= 10 * 1024
		);
		expect(existsSync(join(root, 'build/client')), 'run the build first').toBe(true);
		expect(shipped).toEqual([]);
		// the tarball's top level is pinned by scripts/package.test.ts ("Package produces a verifiable tarball")
		expect(readFileSync(join(root, 'scripts/package.mjs'), 'utf8')).not.toMatch(/fixtures/);
	});
});
