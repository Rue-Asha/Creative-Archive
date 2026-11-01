import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../../', import.meta.url));
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

		expect(images.length).toBeGreaterThanOrEqual(8);
		for (const name of images) {
			const credit = credits.get(name);
			expect(credit, name).toBeDefined();
			expect(credit!.author.length, name).toBeGreaterThan(0);
			expect(credit!.licence, name).toMatch(/CC0|Public Domain|^generated \(scripts\/synthetic-photo\.mjs\)$/);
			if (credit!.source === 'generated') expect(credit!.licence, name).toMatch(/^generated/);
		}
		for (const name of credits.keys()) expect(images, `credited but missing: ${name}`).toContain(name);
	});

	// proof builds before it tests, so build/client is the build this run made
	it('Scenario: Mockup photos stay out of the product', () => {
		const shipped = [...files(join(root, 'static')), ...files(join(root, 'build/client'))].filter(
			(f) => image.test(f) && statSync(f).size >= 10 * 1024
		);
		expect(existsSync(join(root, 'build/client')), 'run the build first').toBe(true);
		expect(shipped).toEqual([]);
		// the tarball's top level is pinned by scripts/package.test.ts ("Package produces a verifiable tarball")
		expect(readFileSync(join(root, 'scripts/package.mjs'), 'utf8')).not.toMatch(/fixtures/);
	});
});
