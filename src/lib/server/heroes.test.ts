import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { closeDb } from './db.ts';
import { getHeroes, removeHero, setHero } from './heroes.ts';
import { getImage } from './images.ts';
import { insertTestImage, useTestDb } from './testing.ts';

beforeEach(() => {
	useTestDb();
});

afterEach(() => {
	closeDb();
	delete process.env.DATABASE_PATH;
});

describe('heroes', () => {
	it('Scenario: Setting a hero replaces the old image', () => {
		const a = insertTestImage(1);
		const b = insertTestImage(2);
		const home = insertTestImage(3);
		setHero('music', a);
		setHero('home', home);
		setHero('music', b);
		expect(getHeroes()).toEqual({ music: b, home });
		expect(getImage(a)).toBeNull();
		expect(getImage(b)).not.toBeNull();
		expect(getImage(home)).not.toBeNull();
	});

	it('Scenario: Removing a hero deletes its image', () => {
		const image = insertTestImage(1);
		setHero('home', image);
		removeHero('home');
		expect(getHeroes().home).toBeUndefined();
		expect(getImage(image)).toBeNull();
	});

	it('keeps the image when the same one is set again and ignores a world without hero', () => {
		const image = insertTestImage(1);
		setHero('books', image);
		setHero('books', image);
		expect(getHeroes()).toEqual({ books: image });
		expect(getImage(image)).not.toBeNull();
		expect(() => removeHero('fashion')).not.toThrow();
	});
});
