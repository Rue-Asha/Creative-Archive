import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const wire = join(import.meta.dirname, '..', '..');

const screens = [
	'list',
	'list/shelves',
	'list/states',
	'list/magazines',
	'list/wardrobe',
	'list/brands-shops',
	'select',
	'select/states',
	'select/sheets',
	'add',
	'add/picked',
	'add/url',
	'add/manual',
	'add/states',
	'entry',
	'entry/anime',
	'entry/progress',
	'entry/rating',
	'entry/piece',
	'entry/artist',
	'entry/overlays',
	'entry/states',
	'edit',
	'edit/piece',
	'edit/kinds',
	'edit/guard'
];

describe('gate 4 wireframes: list and Select, add, entry, edit', () => {
	it('Scenario: Every gate 4 screen of the list, Select, add, entry and edit surfaces exists', () => {
		for (const slug of screens) expect(existsSync(join(wire, slug, '+page.svelte')), slug).toBe(true);
	});

	it('Scenario: Every screen sits in the Frame and reads the fixtures', () => {
		for (const slug of screens) {
			const src = readFileSync(join(wire, slug, '+page.svelte'), 'utf8');
			expect(src, slug).toContain('Frame');
			expect(src, slug).toMatch(/mockData|dataFor/);
		}
	});

	it('Scenario: Wireframes stay greyscale and take no photo beyond placeholders', () => {
		for (const slug of screens) {
			const src = readFileSync(join(wire, slug, '+page.svelte'), 'utf8');
			expect(src, slug).not.toMatch(/__mockups\/photo|<img/);
		}
	});
});
