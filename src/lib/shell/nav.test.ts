import { describe, expect, it } from 'vitest';
import { activeSection, POSTURE_SWITCH, worldOf } from './nav.ts';

describe('activeSection', () => {
	it('Scenario: Active section is derived for sub-routes', () => {
		expect(activeSection('/', worldOf('/'))).toBe('home');
		expect(activeSection('/books/books', worldOf('/books/books'))).toBe('books');
		expect(activeSection('/entries/3', 'animanga')).toBe('animanga');
		expect(activeSection('/add/piece', worldOf('/add/piece'))).toBe('fashion');
		expect(activeSection('/entries/9/edit', 'music')).toBe('music');
		expect(activeSection('/collections/2', worldOf('/collections/2'))).toBe('collections');
		expect(activeSection('/settings', worldOf('/settings'))).toBe('settings');
	});

	it('does not mistake a path that merely starts with the same letters', () => {
		expect(activeSection('/collectionsx', 'home')).toBe('home');
		expect(activeSection('/settings-old', 'home')).toBe('home');
	});

	it('marks the collections index', () => {
		expect(activeSection('/collections', 'home')).toBe('collections');
	});
});

describe('worldOf', () => {
	it('names the world of a path', () => {
		expect(worldOf('/')).toBe('home');
		expect(worldOf('/collections/2')).toBe('home');
		expect(worldOf('/settings')).toBe('home');
		expect(worldOf('/music')).toBe('music');
		expect(worldOf('/fashion/wardrobe')).toBe('fashion');
		expect(worldOf('/add/book')).toBe('books');
		expect(worldOf('/add/site')).toBe('fashion');
		expect(worldOf('/add/nothing')).toBe('home');
		expect(worldOf('/entries/3')).toBe('home');
	});

	it('keeps the posture switch at 1024', () => {
		expect(POSTURE_SWITCH).toBe(1024);
	});
});
