import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function walk(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? walk(path) : [path];
	});
}

describe('no star adapter is left', () => {
	const files = walk('src').filter((file) => !file.endsWith('no-adapters.test.ts'));

	it('has no StarRating.svelte', () => {
		expect(files.filter((file) => file.endsWith('StarRating.svelte'))).toEqual([]);
	});

	it('has no code importing or defining starsFromRating', () => {
		const hits = files.filter((file) => /\.(ts|svelte)$/.test(file) && readFileSync(file, 'utf8').includes('starsFromRating'));
		expect(hits).toEqual([]);
	});
});
